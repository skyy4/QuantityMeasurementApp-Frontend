# Deploy QuantityMeasurementApp Frontend

This frontend is now configured for JWT-only auth and does not depend on Google OAuth.

## Environment variable

Set this in Vercel or Netlify:

```text
VITE_API_BASE_URL=https://YOUR-BACKEND-URL
```

Example:

```text
VITE_API_BASE_URL=https://quantity-measurement-backend.onrender.com
```

## Vercel

1. Push the frontend repo to GitHub.
2. Import the repo into Vercel.
3. Framework preset: `Vite`
4. Build command:

```text
npm run build
```

5. Output directory:

```text
dist
```

6. Add environment variable:

```text
VITE_API_BASE_URL=https://YOUR-BACKEND-URL
```

7. Deploy.

## What changed

- Google login UI was removed.
- Login/Register now use backend JWT endpoints:
  - `/api/auth/register`
  - `/api/auth/login`
- JWT token is stored in `localStorage`.
- Protected requests use `Authorization: Bearer <token>`.
