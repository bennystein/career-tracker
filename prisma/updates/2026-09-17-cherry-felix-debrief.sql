-- Debrief: Felix Steinmeyer / Cherry Technologies call, Sep 17, 2026
BEGIN;

UPDATE public."Opportunity" SET
  notes = 'Felix''s thesis: displace CareCredit within Synchrony, then Synchrony overall, then expand beyond healthcare. ~$800M run-rate revenue, growing 60-80%/year, 700 employees, ~450 sellers, historically 80% inbound now ~50/50 inbound/outbound. Core mandate: single-product to multi-product transformation, organize the sales org to cross-sell at renewal. Strong in SMB, needs mid-market/enterprise build-out plus partnerships/integrations (channel conflict will be live). Felix has run marketing himself, wants it folded into the revenue org under this hire. Current CRO has been there since a 4-person sales team.',
  "nextAction" = 'Send Felix a follow-up note recapping the call, expressing excitement to continue',
  "nextActionOwner" = 'BEN',
  "lastTouchDate" = '2026-09-17',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE id = 'o-cherry';

UPDATE public."Contact" SET
  "lastTouchDate" = '2026-09-17',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE id = 'c-felix-steinmeyer';

INSERT INTO public."Touch" (id, "threadId", date, summary, direction, "createdAt")
VALUES (
  'touch-cherry-felix-20260917',
  't-cherry-felix',
  '2026-09-17',
  'First call held. Ben''s read: warm -- will need to overcome lack of direct sales/customer org leadership experience, but ops focus and design thinking resonated. Process ahead: several more intro calls over the next week or so, then a smaller group does a 1-1.5hr resume walkthrough, 1-5hr case work on prior Cherry business problems, then finals with two more interviewers.',
  'BEN_OWES',
  CURRENT_TIMESTAMP
);

INSERT INTO public."ActionItem" (id, kind, title, "dueDate", status, "opportunityId", "contactId", "createdAt", "updatedAt")
VALUES (
  'ai-cherry-followup-note-20260917',
  'MANUAL',
  'Send Felix Steinmeyer a follow-up note recapping the call + excitement to continue',
  '2026-09-17',
  'OPEN',
  'o-cherry',
  'c-felix-steinmeyer',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

COMMIT;
