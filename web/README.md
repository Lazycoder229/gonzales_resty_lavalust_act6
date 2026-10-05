# Stockroom frontend

Next.js and shadcn frontend for the LavaLust product API. The browser talks directly to LavaLust with `fetch`; it never connects to MySQL.

## Local setup

1. Set `NEXT_PUBLIC_LAVALUST_API_URL=http://localhost:3001/api` in `.env.local` for local development.
2. Start the LavaLust backend and the Next.js app in separate terminals:

   ```bash
   cd act6
   php -S 127.0.0.1:3001 -t public public/index.php
   ```

   ```bash
   cd web
   pnpm dev
   ```

3. Open `http://localhost:3000` and create an account. Accounts use LavaLust JWT access and refresh tokens.

The browser stores the current session in `sessionStorage`, so closing the tab clears the session. The API refresh endpoint rotates access tokens after expiry.

## API routes

| Method | Route | Access |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `POST` | `/api/auth/refresh` | Refresh token |
| `POST` | `/api/auth/logout` | Bearer access token |
| `GET` | `/api/products` | Bearer access token |
| `GET` | `/api/products/{id}` | Bearer access token |
| `POST` | `/api/products` | Bearer access token |
| `PUT`, `PATCH` | `/api/products/{id}` | Bearer access token |
| `DELETE` | `/api/products/{id}` | Bearer access token |

Protected routes validate access tokens through LavaLust's `Api::require_jwt()`. Responses use `Api::respond()` and `Api::respond_error()`.

## Deployment

Set `NEXT_PUBLIC_LAVALUST_API_URL` to the deployed API URL plus `/api` in the frontend host, then rebuild the Next.js app. Set `FRONTEND_ORIGIN` on the LavaLust host to the frontend origin, without a trailing slash. Configure the Aiven MySQL connection and LavaLust JWT secrets in the backend host environment. Never commit `.env` or deployment secrets.
