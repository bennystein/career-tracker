# Career Search Tracker

Structured tracker for an active job search — see `PRD.md` for the full spec.
Stack: Next.js (App Router, TypeScript) + Prisma 7 + hosted Postgres, styled
with Tailwind. Claude Code owns all writes (see "Sync layer" below); the app
itself is mostly a read surface plus a manual quick-add path.

## Setup

1. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — a hosted Postgres connection string (Supabase or Render
     Postgres both have free tiers). Must be reachable both from wherever
     Claude Code runs and from the deployed app.
   - `APP_PASSWORD` — the shared password gating the whole app.
2. Install dependencies: `npm install`
3. Apply the schema: `npm run db:migrate` (creates `prisma/migrations/`)
4. Seed sample data: `npm run db:seed`
5. Run locally: `npm run dev`, then log in at `/login` with `APP_PASSWORD`.

## Views

- `/pipeline` — opportunities by stage, ranked
- `/due` — cadence-overdue contacts (computed live from cadence tier + last
  touch date) and open action items
- `/contacts`, `/contacts/[id]` — contact list and detail (linked
  opportunities + full touch history)
- `/add` — manual quick-add/update forms for contacts, opportunities,
  touches/debriefs, and action items

## Sync layer

`scripts/sync.ts` is the write path Claude Code uses from chat: parse a
debrief/update against the structured shape in `PRD.md`, then run

```bash
npx tsx scripts/sync.ts '{"op":"touch","contact":"Dana Whitfield","opportunity":"Brightline Robotics","direction":"THEY_OWE","summary":"..."}'
```

The script prints a one-line confirmation of exactly what it wrote — that's
the review checkpoint, meant to be echoed back in the same chat turn. See the
header comment in `scripts/sync.ts` for all supported `op` payloads
(`contact.create`, `contact.update`, `opportunity.create`,
`opportunity.update`, `touch`, `actionItem.create`, `actionItem.setStatus`).
`contact` / `opportunity` / `source` fields accept either a record id or a
best-effort name match.

## Scoring model

The rubric lives in the `ScoringModel` table as versioned, config-driven
data (see `PRD.md`), not hardcoded app logic. `prisma/seed.ts` seeds the v1
rubric. Editing weights/criteria means writing a new `ScoringModel` row (or
updating the current one) — the scoring UI itself is a v2 item per the PRD's
build sequence.

## Deploying

Deploy to Render, Fly.io, or Railway, pointed at the same `DATABASE_URL` used
above, with `APP_PASSWORD` set as an environment variable. `npm run build`
then `npm run start`.

## Fallback

The existing `Network_Map.md` and HTML dashboard keep running in parallel
until this system has proven itself over a few weeks of real use — don't
delete them yet.
