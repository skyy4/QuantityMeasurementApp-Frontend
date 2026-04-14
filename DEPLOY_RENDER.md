# Deploy Without API Gateway (Render)

Use this when you want the frontend to call your backend directly on Render.

## 1. Delete old API Gateway URL usage

Make sure your frontend environment variable is set to your Render backend URL, not API Gateway:

```text
VITE_API_BASE_URL=https://your-backend-service.onrender.com
```

## 2. Backend on Render (Web Service)

1. Create a new **Web Service** on Render from your backend repo.
2. Build command: use your backend build command.
3. Start command: use your backend start command.
4. Add backend environment variables (DB URL, JWT secret, etc.).
5. Deploy and copy the generated URL, for example:

```text
https://quantity-measurement-backend.onrender.com
```

## 3. Frontend environment update

Set `VITE_API_BASE_URL` in your frontend host (Vercel/Netlify/Render Static Site) to that Render backend URL.

## 4. Endpoint checks

After deploy, verify:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/v1/history/me` (with `Authorization: Bearer <token>`)
- `POST /api/v1/quantities/convert` (with `Authorization: Bearer <token>`)

If these work, the app is running without API Gateway.

