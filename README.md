# Youth Management Hub

A lightweight, static youth management web app for showcasing:

- Admin dashboard
- Member dashboard
- Event publishing
- Gallery uploads
- Executive profiles

## Run locally

Run the app through its Python server (required for payments and persistent server state):

```bash
python server.py
```

Then visit `http://localhost:8000`.

## Admin access and member privacy

Admin access is verified by the server. Set both variables before starting the app; do not store these values in browser storage or source files:

```powershell
$env:ADMIN_PASSWORD = "a-unique-password-at-least-12-characters"
$env:ADMIN_SESSION_SECRET = (python -c "import secrets; print(secrets.token_urlsafe(48))")
python server.py
```

In Vercel, set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in the project's Environment Variables. Use a unique password of at least 12 characters and a stable, randomly generated session secret of at least 32 characters. Keep the session secret unchanged between deployments; changing it signs out all administrators. Admin sessions use an HTTP-only, same-site cookie and expire after eight hours.

Only a signed-in administrator can read or update member records and activity logs. Public registration remains available and is saved by the server; anonymous state responses omit member records and activity logs. The app also clears older browser-stored copies of member records on load.

## Paystack dues payments

Set the Paystack **secret** key as a server environment variable before starting the app. Do not put the secret key in `script.js` or other browser files.

PowerShell:

```powershell
$env:PAYSTACK_SECRET_KEY = "sk_test_your_secret_key"
python server.py
```

Configure `PAYSTACK_SECRET_KEY` in Vercel's Environment Variables when deployed. The dues form collects the member's name, email, and amount in GHS; the server generates and displays the payment reference before the member continues to Paystack's hosted checkout. The email is required by Paystack. The server records a payment only after Paystack confirms the matching reference, amount, currency, and member email, either through transaction verification or the signed webhook. Use a Paystack test secret key to test before switching to a live key.

For reliable payment updates when a member closes checkout before returning to the app, configure the Paystack webhook URL as `https://<your-app-domain>/api/payments/webhook`. The endpoint verifies Paystack's signature before recording a successful charge.

## Deploy on Vercel

The Vercel deployment serves the frontend and runs the Python API as a Vercel Function. PostgreSQL on Neon provides persistent storage; SQLite remains available for local development.

1. Create a Neon project and copy its pooled PostgreSQL connection string.
2. Import this GitHub repository into Vercel. Vercel reads `vercel.json` to build the static frontend and route `/api/*` requests to the Python function.
3. Add these Production Environment Variables in Vercel:
   - `DATABASE_URL`: the Neon connection string (use the pooled connection string and keep it private).
   - `ADMIN_PASSWORD`: a unique password of at least 12 characters.
   - `ADMIN_SESSION_SECRET`: a stable random secret of at least 32 characters.
   - `PAYSTACK_SECRET_KEY`: optional; required only to accept dues payments.
4. Deploy or redeploy the project. The API creates its PostgreSQL tables and initial public content on the first API request.
5. Set the Paystack webhook URL to `https://<your-vercel-domain>/api/payments/webhook`.

Do not commit database URLs or secrets. Vercel's function filesystem is not persistent, so do not set `DATABASE_PATH` there. Existing SQLite or former Railway data is not copied automatically; migrate any records you need before switching members to the new deployment.

## Features

- Switch between admin and member dashboard views
- Publish events with custom details and poster placeholders
- Add gallery images with captions and categories
- Browse executive profiles and community highlights
- Server state and dues payments are stored in Neon PostgreSQL on Vercel or SQLite during local development
- Browser `localStorage` provides local demo state when the server API is unavailable
