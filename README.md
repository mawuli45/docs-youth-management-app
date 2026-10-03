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

## Paystack dues payments

Set the Paystack **secret** key as a server environment variable before starting the app. Do not put the secret key in `script.js` or other browser files.

PowerShell:

```powershell
$env:PAYSTACK_SECRET_KEY = "sk_test_your_secret_key"
python server.py
```

Configure `PAYSTACK_SECRET_KEY` in Railway's service variables when deployed. Members enter the amount they owe in GHS and continue to Paystack's hosted checkout. The server records a payment only after Paystack confirms the matching reference, amount, currency, and member email, either through transaction verification or the signed webhook. Use a Paystack test secret key to test before switching to a live key.

For reliable payment updates when a member closes checkout before returning to the app, configure the Paystack webhook URL as `https://<your-app-domain>/api/payments/webhook`. The endpoint verifies Paystack's signature before recording a successful charge.

## Deploy on Railway

1. Push this project to a GitHub repository.
2. Go to Railway and create a new project from GitHub.
3. Select the repository and Railway will detect the Python app.
4. Make sure the service uses the default build command and set the start command to:

```bash
python server.py
```

5. Railway will automatically expose the app on a public URL.

> This project already uses the `PORT` environment variable provided by Railway, so no extra code changes are required for hosting.

## Features

- Switch between admin and member dashboard views
- Publish events with custom details and poster placeholders
- Add gallery images with captions and categories
- Browse executive profiles and community highlights
- Local demo state is stored in browser `localStorage`
