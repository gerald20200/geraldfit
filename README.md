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
	supabase/admin_dashboard.sql Additive admin authorization and archive support
```

## Requirements

- Node.js 20 or newer
- A Supabase project

## Supabase setup

1. If this is a new database, run [`server/supabase/schema.sql`](server/supabase/schema.sql) first.
2. Run [`server/supabase/training_center.sql`](server/supabase/training_center.sql) in the Supabase SQL Editor. It only adds exercise metadata and training records; it does not drop existing tables or progress logs.
3. Run [`server/supabase/football_development.sql`](server/supabase/football_development.sql) for the full coaching curriculum and saved player preferences. It only adds columns to `profiles` and `workouts`; it does not create, drop, or replace tables, and it leaves `progress_logs` and Auth intact. Review this migration before applying it.
4. Run [`server/supabase/admin_dashboard.sql`](server/supabase/admin_dashboard.sql). It adds `profiles.is_admin` (default `false`) and `workouts.is_published` (default `true`); it creates no tables and changes no existing account or progress records.
5. To authorize your own account, uncomment the example `UPDATE public.profiles ...` statement at the bottom of `admin_dashboard.sql`, replace its example email with your Supabase account email, and run only that statement in the SQL Editor. Do not expose or set admin access from client-side code.
6. Copy the project URL, anon key, and service-role key from the Supabase project settings.
7. Configure the variables in `server/.env` using `server/.env.example`. Keep the service-role key private and never expose it to the browser.
8. Configure `client/.env` with `VITE_API_URL` from `client/.env.example`. The browser does not need Supabase credentials because all Supabase access goes through the Express API.

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
- `GET /api/admin/overview` (admin only)
- `GET /api/admin/players` (admin only)
- `GET /api/admin/exercises` (admin only)
- `POST`, `PUT`, and `DELETE /api/admin/exercises` (admin only; delete archives to preserve progress history)

See [`geraldfit_complete_architecture_setup_guide.md`](geraldfit_complete_architecture_setup_guide.md) for the architecture blueprint supplied with this workspace.