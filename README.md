# Impact Miami 2.0

Website and operator console for **Impact Miami 2.0**, a youth hackathon presented by the Young Coders Initiative in partnership with Big Red Education.

**Sunday, October 25, 2026 · 9:30 AM to 5:30 PM · The Cushman School (Middle School), 592 NE 60th Street, Miami, FL 33137**

| Where | What |
| --- | --- |
| `/` (repo root) | Impact Miami 2.0, served at **youngcodersimpact.com** |
| `spring-2026/` | The archived Spring 2026 site, served at **spring2026.youngcodersimpact.com** |
| `supabase/migrations/` | Backend schema for 2.0 (tables, row-level security, registration RPC) |

Deployment steps (Vercel projects, domains, Supabase, first operator) are in [DEPLOYMENT.md](./DEPLOYMENT.md).

## Stack

Vite, React 18, TypeScript, Tailwind CSS, TanStack Query, and Supabase (Postgres, Auth, RLS).

## Local development

```sh
npm install
cp .env.example .env.local   # optional: add Supabase URL + anon key
npm run dev
```

Without Supabase credentials the public site still renders, using the facts from the event flyer (`src/lib/defaults.ts`). Registration and the operator console need the backend.

## What's where

- `src/pages/public/`: the homepage, team registration, and 404 page.
- `src/pages/ops/`: the operator console at `/ops`. Operators sign in with Supabase Auth and can:
  - approve, waitlist, or reject teams
  - edit teams and members
  - run check-in on event day
  - export the roster to CSV
  - flip registration between coming soon, open, waitlist, and closed
  - edit tracks, schedule, FAQ, and announcements
  - manage other operators (owners only)
- `src/lib/api.ts`: public data hooks. `src/lib/ops.ts`: console data hooks.
- `src/components/ui.tsx`: design primitives. The tokens in `tailwind.config.ts` come from the flyer: near-black grid, off-white ink, and a green `#3DEB8F` → cyan `#16D4F0` gradient.

## Security model

Team and member data (including guardian contact info) is readable only by operators, which is enforced by Postgres row-level security. The public can read published event content and call just two functions: `register_team` and `event_public_stats`, which returns aggregate counts only.

## Scripts

- `npm run dev`: dev server
- `npm run build`: typecheck and production build
- `npm run test`: Vitest
- `npm run lint`: ESLint
