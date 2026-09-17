# Career Search Tracker — PRD

## Problem

Search state (opportunities, recruiters, network contacts, cadence) lives in prose: a markdown file and a hand-edited HTML dashboard. Every status check requires re-reading paragraphs. Cadence math (who's overdue, by tier) is manual. No cross-cutting views (everything tied to one recruiter, everything due this week). Debriefs are stream-of-consciousness and inconsistently complete.

## Goal

Structured data instead of prose. Automated staleness/cadence logic instead of manual tracking. A hosted view reachable from any browser (Chromebook included), kept current mostly through conversation with Claude, with a review checkpoint before anything is written.

## Non-goals (v1)

- Not a general CRM. Scoped to this search only.
- Not multi-user.
- Not a replacement for Gmail/Calendar as ground truth for thread status — those stay authoritative per existing verification protocol.
- Not a research engine. The app displays research notes; it doesn't fetch or synthesize them itself. Research happens in chat, the summary gets logged through the same sync path as everything else.

## Data model

**Opportunity**
- company, role, stage, status
- source (recruiter/contact reference)
- next action, next action owner (Ben / them)
- last touch date
- notes
- scores (see Scoring model below)
- computed recommendation (pass / pursue)

**Contact**
- name, firm, type (recruiter / network / company-side)
- warmth tier, cadence tier
- last touch date

**Thread**
- links a Contact to one or more Opportunities
- touch history (date, summary, direction — who owes whom)

**ActionItem**
- derived (from cadence rules) or manual
- due date
- linked Opportunity or Contact
- status (open / done / dismissed)

## Scoring model — config-driven, versioned

Do not hardcode criteria into app logic. Store the rubric itself as data:

```
ScoringModel {
  version: int
  criteria: [
    { name, weight, scale (e.g. 1-5) }
  ]
  red_flags: [
    { name, override_behavior }  // e.g. "force pass regardless of score"
  ]
}
```

Each Opportunity's scores reference the ScoringModel version used. Changing weights or adding/removing criteria means editing the config record, not the code. Old scores stay tagged with their model version so they're never silently compared against a different rubric. Current v1 rubric (carry over from existing practice): scope/authority, equity/comp upside, company trajectory/capital position, leadership/culture, narrative fit, logistics — plus red flags (undefined mandate, toxic leadership, no comp structure, no-thesis turnaround) that can force a pass regardless of score.

## Structured debrief intake

Every call debrief, whether typed as free text or prompted field-by-field, gets normalized to this shape before it's committed to a Thread entry. Claude Code asks for whatever's missing rather than accepting an incomplete debrief silently:

- Company / contact
- Scope discussed
- Comp signals (if any)
- Timeline signals
- Org authority / reporting line signals
- Red flags noted
- Ben's read
- Next action + owner
- Follow-up date

## Views (v1)

1. **Pipeline board** — opportunities by stage, ranked
2. **Due list** — auto-fires: computed from cadence tier + last touch date, no need to ask for it. Surfaces both in-app and as a prompt back in chat when relevant ("X is now overdue")
3. **Contact view** — a recruiter or network contact with every linked opportunity and full touch history
4. **Quick add/update** — manual entry path for use directly in the app

## Sync layer (the part that isn't just "a web app")

Claude Code owns all writes. Flow:

1. Ben types a debrief or update in chat, as usual.
2. Claude Code parses it against the structured debrief shape above, asks for missing fields if needed.
3. Claude Code writes the record to the shared database.
4. Claude Code echoes back a one-line confirmation of exactly what was logged, in the same turn — this is the review checkpoint. Catch an error here, before it's load-bearing, rather than discovering it later in the app.

This is a per-message sync with an inline confirmation, not a separate "sync now" step and not silent real-time writes with no review moment.

## Storage — hosted Postgres, not local SQLite

Because writes come from Claude Code (wherever it's invoked from) and reads happen from a hosted app reachable by URL from the Chromebook, the database has to live somewhere both sides can reach over the network. A local SQLite file only works if everything runs on one machine — it won't work here. Use a small hosted Postgres instance (Supabase or Render's managed Postgres both have free tiers that are plenty for this). Claude Code gets the connection string as a credential it uses to write; the hosted app uses the same connection string to read.

## Hosting

- Deploy the app itself (Render, Fly.io, or Railway — any works for a first Claude Code project)
- Basic password auth in front of it, non-negotiable given what's in here: separation terms, comp figures, personnel names tied to a confidential search
- Reachable by URL from the Chromebook; broader "from anywhere" access is nice-to-have, not required for v1

## Fallback

Keep the existing markdown file and HTML dashboard running in parallel until the new system has proven itself over a few weeks of real use. Don't delete the fallback on day one.

## Periodic import — connection scrubbing

Not real-time (LinkedIn doesn't offer a live feed). Batch job: Ben exports the LinkedIn connections CSV periodically, the app cross-references company names already in the pipeline against it, and surfaces unused warm paths. Build this after v1 core is stable, not blocking it.

---

## Getting this live — sequence for Claude Code

1. **Set up the project.** Create a new local folder / git repo for the app. Save this PRD into it as `PRD.md` — that's the spec Claude Code works from.

2. **Pick the stack.** Ask Claude Code to propose a minimal stack given the requirements above (a small backend with Postgres access, a simple frontend — doesn't need to be fancy). Let it choose something it can scaffold quickly rather than over-engineering.

3. **Stand up the database first.** Sign up for Supabase (or Render Postgres), create a database, get the connection string. Do this before writing app code — the schema (Opportunity, Contact, Thread, ActionItem, ScoringModel) gets created here.

4. **Scaffold the app.** Have Claude Code build the four v1 views against that schema, using seed/sample data first so you can see it work before real data goes in.

5. **Backfill from the current Network_Map.md.** Once the schema exists, import your current pipeline as seed data instead of starting from zero. Claude Code can parse the markdown into the new structure — check the output carefully, this is the one-time step where errors are easiest to introduce.

6. **Deploy the app.** Push it to Render/Fly/Railway, point it at the same Postgres connection string, add password auth as an environment variable. Confirm it loads from the Chromebook.

7. **Wire the sync layer.** This is the piece to test hardest: type a real debrief here in chat, confirm Claude Code parses it against the structured shape, writes it, and echoes back what it logged. Then refresh the hosted app and confirm the same record shows up there.

8. **Run both systems in parallel** for a couple weeks. Only retire the markdown/HTML fallback once the new system has caught everything it should have across a few real update cycles.

9. **Scoring model second.** Get the tracker and sync loop solid first; layer in the config-driven scoring model and connection-scrubbing import once the core loop is trustworthy.
