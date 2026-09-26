# Young Coders Impact Miami

This repo is a Vite + React + shadcn/ui starter wired to Supabase. Use `src/lib/supabase.ts` to connect to the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values defined in `.env`.

## Getting started

1. Install dependencies with your preferred package manager (`npm install`, `yarn install`, etc.). Node.js must be available on the machine before running the command.
2. Confirm that `.env` contains the Supabase credentials (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`). These values are already populated for the provided project.
3. Run `npm run dev` (or equivalent) to start the Vite dev server.

## Supabase and migrations

- The Supabase client is exported from `src/lib/supabase.ts`; import it wherever you need database or auth access.
- Use the `src/migrations` directory to stage SQL or migration scripts before applying them with Supabase CLI or Dashboard.
- Content (hackathon metadata, challenges, schedule, venue, FAQ, contact info) is now seeded in Supabase (`hackathon_info`, `site_details`, `challenges`, `event_schedule`, `venues`, `judges_mentors`, `faqs`, `contact_details`, etc.). Every UI screen reads live data from Supabase tables instead of hard-coded arrays, so update those rows in the database when the event details change. The `/admin` route provides an authenticated dashboard where organizers can add/edit/delete any of those records without touching the database manually.

## Available scripts

- `npm run dev` – start the dev server.
- `npm run build` – produce a production build.
- `npm run preview` – serve the production build locally.
- `npm run test` / `npm run test:watch` – run Vitest suites.
