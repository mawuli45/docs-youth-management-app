# Youth Management Hub

A lightweight, static youth management web app for showcasing:

- Admin dashboard
- Member dashboard
- Event publishing
- Gallery uploads
- Executive profiles

## Run locally

Open the `index.html` file directly in a browser, or use a local server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

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
