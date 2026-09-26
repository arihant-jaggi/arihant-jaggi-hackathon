# Deployment Guide

How to get `youngcodersimpact.com` serving **Impact Miami 2.0** (this repo's
root) and `spring2026.youngcodersimpact.com` serving the archived **Spring
2026** site (`spring-2026/`).

## Repo layout

- **Repo root** — the new site: Impact Miami 2.0, Sunday Oct 25, 2026, The
  Cushman School (Middle School), 592 NE 60th Street, Miami, FL 33137.
  Presented by Young Coders Initiative with Big Red Education.
- **`spring-2026/`** — the old site, unchanged apart from a small "archive"
  banner. Its own `package.json`, `vercel.json`, `src/`. Deployed separately.

Both are independent Vite apps with their own Supabase client, so they can
share one Supabase project (table names don't collide) or use two.

## Backend (Supabase)

1. **Run the schema.** In the Supabase SQL editor, run
   `supabase/migrations/20260924000000_impact_miami_2.sql`. It's safe to run
   in the same project the Spring 2026 site uses — every table it creates is
   new (`operators`, `events`, `tracks`, `schedule_items`, `faq_items`,
   `announcements`, `teams`, `team_members`, plus `register_team()` and
   `event_public_stats()`), so the archived site's tables are untouched. A
   fresh Supabase project works too if you'd rather keep them fully separate.

2. **Create the first operator.**
   - Sign up at `/ops` (magic link), or create a user directly in
     **Supabase → Auth → Users**.
   - Then, in the SQL editor, promote that user to `owner`:
     ```sql
     insert into public.operators (user_id, email, role)
     select id, email, 'owner' from auth.users where email = 'you@example.com';
     ```
   - Owners can add more operators later from the Ops console; everyone else
     gets `operator` by default.

3. **Allow magic-link redirects.** In **Supabase → Auth → URL Configuration**,
   add these to the redirect URL allow-list:
   - `https://youngcodersimpact.com/ops`
   - your Vercel preview domain's `/ops` (e.g.
     `https://<project>-git-<branch>-<team>.vercel.app/ops`), so magic links
     work from preview deploys too.

4. **(Optional, recommended) Lock down the archive.** Every Spring 2026 table
   was created with `using (true)` RLS policies — anyone with the public anon
   key can currently read participant PII in `registrations` and
   `contact_submissions`, and can insert/edit/delete rows in any archived
   table. Since that event is over, run
   `spring-2026/src/migrations/2026_09_24_archive_lockdown.sql` in the SQL
   editor (after step 1) to restrict writes and PII reads to operators only.
   Anyone who still needs the old `/admin` must be in `public.operators`. It's
   idempotent and touches only the Spring 2026 tables.

## Vercel — new site on youngcodersimpact.com

The existing Vercel project that already serves `youngcodersimpact.com` keeps
**Root Directory = `.`**. Once this branch is merged to that project's
production branch, the apex domain automatically serves Impact Miami 2.0 —
no new project or domain change needed.

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Framework preset:** Vite
- **Environment variables:**
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_EVENT_SLUG` (optional — which row in `public.events` this
    deployment shows; defaults are fine with a single current event)

## Vercel — archive on spring2026.youngcodersimpact.com

Create a **second, separate** Vercel project for the archive:

1. **Add New Project** → import the same GitHub repo.
2. **Root Directory:** `spring-2026`
3. **Framework preset:** Vite
4. **Environment variables:** same two —
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
5. Deploy.
6. **Settings → Domains** → add `spring2026.youngcodersimpact.com`.

**DNS:** if `youngcodersimpact.com` uses Vercel's nameservers, the subdomain
is provisioned automatically when you add it in step 6. Otherwise, at your
DNS provider add a CNAME record:

```
spring2026  CNAME  cname.vercel-dns.com
```

**Ignored Build Step** (so each project only rebuilds when its own folder
changes):

- Archive project (Root Directory = `spring-2026`, so the command runs from
  inside that folder):
  ```
  git diff --quiet HEAD^ HEAD -- .
  ```
- Root/new-site project:
  ```
  git diff --quiet HEAD^ HEAD -- . ':!spring-2026'
  ```

## Order of operations (avoid downtime)

1. Deploy the **archive** project + `spring2026.youngcodersimpact.com` domain
   first, and verify it loads correctly on the subdomain.
2. Only then merge the branch that makes the **root** project (already
   serving `youngcodersimpact.com`) build from repo root. That way the old
   content stays reachable (now at its subdomain) at every point, and the
   apex domain never serves a half-migrated state.

## Running operations on event day

All from the Ops console (`/ops`), signed in as an operator:

- **Flip registration:** Ops → Event → set registration status
  (coming soon / open / waitlist / closed).
- **Review teams:** Ops → Teams — approve or waitlist registrations, export
  the roster as CSV.
- **Check-in desk:** Ops → Check-in — works on a phone, for staffing the door.
- **Announcements:** Ops → Content — post/edit announcements shown on the
  public site.

## Local dev

```
npm install
cp .env.example .env.local
npm run dev
```

The site renders with sensible flyer defaults even with no backend
configured — fill in `.env.local` with your Supabase project's URL and anon
key to connect it to live data.
