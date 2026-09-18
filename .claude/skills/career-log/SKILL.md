---
name: career-log
description: Use this skill whenever the user shares a call debrief, a follow-up to log, a status/stage change, a new action item, or any other update to this repo's career-tracker pipeline (Opportunities, Contacts, Threads/Touches, ActionItems) -- even if they just say "log this," "update the app," "add an action item," "move X to interviewing," or dictate a rambling voice-to-text debrief. Also use it when they ask to see a pipeline snapshot, a visual summary of where things stand, or "what does the pipeline look like right now." This is the standing sync-layer workflow for this specific project (see PRD.md) -- always follow it here rather than improvising a one-off write or trying to connect to the database directly.
---

# Career tracker: logging updates and snapshots

## Why this workflow exists, not a live DB connection

This session cannot reach the project's Supabase database over the network (an
egress restriction in this environment blocks it -- confirmed repeatedly, it's
not worth re-testing). So "sync layer" here means: turn what the user told you
into a small, reviewable SQL file; commit and push it to GitHub; hand the user
the exact SQL to paste into Supabase's SQL Editor themselves. That paste-and-run
step **is** the write -- and it doubles as the PRD's required review checkpoint
("catch an error here, before it's load-bearing"). Never try `prisma migrate
deploy`, a direct `psql` connection, or a Prisma Client call against the real
`DATABASE_URL` in `.env` from this session -- it will hang or fail, and it's
not the actual mechanism this project uses.

## Step 1 -- Parse the update against the structured shape

PRD.md's "Structured debrief intake" section defines the shape every real call
debrief should normalize to. For a full debrief, work through these and ask
about whatever's missing -- especially **Ben's read**, **next action + owner**,
and **follow-up date**, since those are the fields most likely to get skipped
if you don't ask, and they're the fields the Due list depends on:

- Company / contact
- Scope discussed
- Comp signals (if any)
- Timeline signals
- Org authority / reporting line signals
- Red flags noted
- Ben's read
- Next action + owner
- Follow-up date

Not everything is a full debrief. A quick "add an action item to follow up
with X" or "move Y to Interviewing" doesn't need this whole shape -- use
judgment. But when it clearly is a call debrief and a field like "Ben's read"
is just missing, ask a short, specific question for exactly what's missing
rather than writing an incomplete record or inventing a read that wasn't
given. Real examples of how this went, if useful for calibrating tone -- see
`git log --oneline` and the corresponding files in `prisma/updates/`:
`2026-09-17-cherry-felix-debrief.sql` (asked for Ben's read, next action, and
follow-up date before writing anything), `2026-09-17-ironclad-codemetal-debrief.sql`
(same, plus handled two debriefs in one message), `2026-09-18-ryan-kalember-followup.sql`
(a lighter action-item-only case that still needed two rounds of clarification
because the dictated company names came through garbled).

Voice-dictated debriefs in particular often garble company/person names
("pink ID" -> "Ping Identity", "plan" -> "Anaplan," "our.kalember" ->
"r.kalember"). If a name doesn't match anything in the pipeline and doesn't
sound like a plausible real name, ask rather than guess -- getting a company
name wrong in a permanent record is a worse failure than one extra question.

## Step 2 -- Find or mint IDs

Every record in this project uses explicit, readable IDs instead of Prisma's
`cuid()` default (set at insert time in raw SQL, so there's no auto-generation
to rely on). Before writing anything:

1. Check whether the contact/opportunity already exists. `grep -ri "<name or
   company>" prisma/backfill.ts prisma/updates/*.sql` finds both the original
   record and any later updates to it -- read enough of the match to get the
   exact existing ID (`c-blake-lindgren`, `o-companycam`, `t-cherry-felix`,
   etc.) and the current field values so an UPDATE has correct context (e.g.
   don't overwrite `notes` with something that drops previously-logged detail
   -- append or fold in, don't erase).
2. For a genuinely new contact or opportunity, mint an ID in the same style:
   `c-<firstname-lastname>` for contacts, `o-<company-slug>` for opportunities,
   `t-<company-or-context>-<person>` for threads, and a dated suffix for
   one-off touches/action items (`touch-<slug>-YYYYMMDD`,
   `ai-<slug>-YYYYMMDD`) so IDs stay unique across files without needing to
   check for collisions.

## Step 3 -- Write the SQL file

One file per logged update at `prisma/updates/YYYY-MM-DD-<short-slug>.sql`,
wrapped in a transaction, matching this shape exactly (copy an existing file
in that directory as your starting point -- they're all short and this is
the fastest way to get column names/casing right):

```sql
-- <One-line description of what this logs>
BEGIN;

UPDATE public."Opportunity" SET
  notes = '...',
  "nextAction" = '...',
  "nextActionOwner" = 'BEN',  -- or 'THEM'
  "lastTouchDate" = 'YYYY-MM-DD',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE id = 'o-...';

INSERT INTO public."Touch" (id, "threadId", date, summary, direction, "createdAt")
VALUES ('touch-...', 't-...', 'YYYY-MM-DD', '...', 'FYI', CURRENT_TIMESTAMP);
-- direction is one of: FYI, BEN_OWES, THEY_OWE

INSERT INTO public."ActionItem" (id, kind, title, "dueDate", status, "opportunityId", "contactId", "createdAt", "updatedAt")
VALUES ('ai-...', 'MANUAL', '...', 'YYYY-MM-DD', 'OPEN', 'o-...', 'c-...', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

COMMIT;
```

A few things that matter and are easy to get wrong:

- **Escape apostrophes by doubling them** (`Ben's` -> `Ben''s`) -- this comes
  up constantly since notes/summaries are free text.
- **Column names are camelCase and quoted** (`"nextAction"`, `"lastTouchDate"`)
  because Postgres folds unquoted identifiers to lowercase and Prisma's schema
  uses camelCase columns. Unquoted `nextaction` will just silently fail to
  match.
- Enum values are fixed sets -- check `prisma/schema.prisma` if unsure, but
  the common ones: `Stage` (LEAD, CONTACTED, SCREEN, INTERVIEWING, FINAL,
  OFFER, CLOSED), `OpportunityStatus` (ACTIVE, STALLED, PASSED, WITHDRAWN,
  CLOSED_WON, CLOSED_LOST), `ContactType` (RECRUITER, NETWORK, COMPANY_SIDE),
  `WarmthTier` (HOT, WARM, COLD), `CadenceTier` (THREE_DAYS, TWO_WEEKS,
  FOUR_WEEKS -- Ben's real system, not generic weekly/monthly), `TouchDirection`
  (FYI, BEN_OWES, THEY_OWE), `ActionOwner` (BEN, THEM).
- New Contact rows need all NOT NULL columns: `id, name, type, "warmthTier",
  "cadenceTier", "createdAt", "updatedAt"` at minimum (`firm`, `lastTouchDate`,
  `notes` are nullable).
- If a Contact gets a new touch, update that Contact's own `"lastTouchDate"`
  too (not just the Opportunity's) -- the Due list's overdue calculation reads
  from the Contact row directly, and this is the easiest thing to forget.

## Step 4 -- Commit and push

```bash
cd /home/user/career-tracker
git add prisma/updates/<the-new-file>.sql
git commit -m "$(cat <<'EOF'
<short description>

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: <this session's URL, from the system reminder>
EOF
)"
git push origin main
```

If a schema *migration* is also needed (not just a data update -- e.g. a new
enum value), that's a different, heavier flow: edit `prisma/schema.prisma`,
generate the migration via `prisma migrate diff` against a local shadow DB
(see git history around 2026-09-17 for the cadence-tier migration for the
exact commands), and let Render's build (`prisma migrate deploy` in the
build command) apply it on next deploy -- Render has real network access to
Supabase even though this session doesn't. Don't attempt this for an ordinary
data update; it's only for actual schema changes.

## Step 5 -- Report back

Reply with the full SQL in a fenced code block (so it's copy-pasteable
straight from the message) followed by a **Logged:** line stating in plain
English exactly what will happen when they run it -- this is the review
checkpoint, so be concrete rather than vague ("Logged: Cherry Technologies
opportunity updated with your debrief, a new touch added to Felix's thread,
and an action item due today to send him a follow-up note" -- not "Logged the
update"). Don't tell them it succeeded; you don't know that until they paste
it and tell you.

## Pipeline snapshot artifacts

When asked for a visual summary/snapshot (or a batch of updates makes one
worth offering), reconstruct current state locally rather than guessing at it
from memory of what's been logged in this conversation -- memory drifts,
the replay doesn't:

```bash
bash .claude/skills/career-log/scripts/reconstruct-local-db.sh
export DATABASE_URL="postgresql://postgres:localdev@localhost:5432/career_tracker?schema=public"
```

That script starts a scratch Postgres, runs `prisma/backfill.ts`, then applies
every file in `prisma/updates/` in order -- so the result matches production
exactly (same technique used to answer "give me all the app data" earlier in
this project's history). Query it with Prisma (see
`scripts/export-state.ts` for the query shape if you want raw JSON instead of
an artifact) and hand the data to an artifact.

Before writing the artifact: call the Artifact tool's `quickstart` (intent:
`design` or `other`) and load the `artifact-design` skill, per this session's
standing instructions -- don't skip straight to writing HTML. Show at minimum
the pipeline board (opportunities grouped by stage) and the due list (open
action items + contacts overdue on cadence, using the same 3-day/2-week/
4-week logic as `src/lib/cadence.ts` -- don't reinvent that math, mirror it).

When done, always clean up so a database server isn't left running between
tasks:

```bash
bash .claude/skills/career-log/scripts/cleanup-local-db.sh
```

Never point `.env`'s `DATABASE_URL` at the local scratch DB and forget to
change it back -- always use `export DATABASE_URL=...` for one-off commands
in this flow instead of editing `.env`, so the repo's real Supabase connection
string is never at risk of being left overwritten.
