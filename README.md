# Geraldfit

Geraldfit is a React football-training app with an Express API and Supabase (PostgreSQL + Supabase Auth) backend.

## Project structure

```text
client/
	public/
	src/components/    Shared navigation, route protection, training centre
	src/context/       Auth and session state
	src/lib/           API client
	src/pages/          Landing, auth, dashboard, workout player
	src/styles/         Tailwind entry and app styles
server/
	config/             Supabase clients
	controllers/        Auth, workout, and profile handlers
	middleware/         Supabase bearer-token validation
	models/             Supabase data access
	routes/              Express API routes
	supabase/schema.sql          Base tables, RLS, and starter drills
	supabase/training_center.sql Additive position-specific exercise library
	supabase/football_development.sql Additive coaching lessons and player preferences
```

## Requirements

- Node.js 20.19+ or 22.12+
- A Supabase project

## Supabase setup

1. If this is a new database, run [`server/supabase/schema.sql`](server/supabase/schema.sql) first.
2. Run [`server/supabase/training_center.sql`](server/supabase/training_center.sql) in the Supabase SQL Editor. It only adds exercise metadata and training records; it does not drop existing tables or progress logs.
3. Run [`server/supabase/football_development.sql`](server/supabase/football_development.sql) for the full coaching curriculum and saved player preferences. It only adds columns to `profiles` and `workouts`; it does not create, drop, or replace tables, and it leaves `progress_logs` and Auth intact. Review this migration before applying it.
4. Copy the project URL, anon key, and service-role key from the Supabase project settings.
5. Configure the variables in `server/.env` using `server/.env.example`. Keep the service-role key private and never expose it to the browser.
6. Configure `client/.env` with `VITE_API_URL` from `client/.env.example`. The browser does not need Supabase credentials because all Supabase access goes through the Express API.

Supabase Auth handles account registration, password hashing, email confirmation, and JWT issuance. Configure the Supabase email provider and SMTP settings for your deployment. The Express API validates bearer tokens with Supabase Auth and refreshes expired sessions. The database uses row-level security; API service credentials stay on the server.

## Install and run

In separate terminals:

```powershell
cd server
npm install
npm run dev
```

```powershell
cd client
npm install
npm run dev
```

In VS Code, the API can instead be started through **Run and Debug → Geraldfit API**. The client dev server must also be running.

Open the Vite URL printed in the client terminal (normally `http://localhost:5173`). The API listens on `http://localhost:5000` by default.
If Vite selects another port because `5173` is busy, local `localhost` and `127.0.0.1` origins are allowed while the API is not in production mode.

## Deployment

Vercel builds and serves the client only. Deploy the Express server separately, set the Vercel `VITE_API_URL` environment variable to the deployed API URL ending in `/api`, and set the server's `CLIENT_ORIGIN` to the deployed frontend origin. In production, `CLIENT_ORIGIN` is the CORS allowlist; local development origins are not allowed automatically.

## Signup troubleshooting

If signup shows that the API cannot be reached, make sure `server/.env` exists and contains the Supabase project URL, anon key, and service-role key. Then start the API in a terminal with `cd server` and `npm run dev`. Keep that terminal running alongside the Vite client. Do not put the service-role key in the client environment or commit either `.env` file.

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/workouts`
- `GET /api/workouts/:id`
- `POST /api/workouts/complete` (bearer token required)
- `GET /api/users/profile` (bearer token required)
- `PATCH /api/users/training-preferences` (bearer token required)

See [`geraldfit_complete_architecture_setup_guide.md`](geraldfit_complete_architecture_setup_guide.md) for the architecture blueprint supplied with this workspace.