-- Debriefs: Helen Wang / Ironclad coffee, and Charlie Harrison / CodeMetal call, Sep 17, 2026
BEGIN;

-- Ironclad / Helen Wang
UPDATE public."Opportunity" SET
  notes = 'CFO Helen Wang, not the hiring exec (Elise Bergeron holds Chief Marketing & Strategy Officer). Coffee held in Menlo Park. Role would be titled Go-to-Market Operations, likely VP level, reporting directly to Helen -- starts with revenue operations and customer operations. This is a full turnaround: the GTM ops function is moving back into the finance org for the third time, after two prior rounds of changes failed to take hold. Business is doing well down-market/SMB; enterprise segment has struggled with growth and heavy turnover on the enterprise seller side. Helen expects significant personnel turnover as part of the rebuild, plus needs financial visibility restored in her FP&A team and an analytics rebuild. Dan Streetman''s pitch emphasized the positives; Helen was more candid about the turnaround scope. Ben''s read: went well personally, good rapport with Helen, but not sure the role scope is wide enough to be compelling.',
  "nextAction" = 'Send Helen a follow-up note',
  "nextActionOwner" = 'BEN',
  "lastTouchDate" = '2026-09-17',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE id = 'o-ironclad';

UPDATE public."Contact" SET
  "lastTouchDate" = '2026-09-17',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE id = 'c-helen-wang';

INSERT INTO public."Touch" (id, "threadId", date, summary, direction, "createdAt")
VALUES (
  'touch-ironclad-helen-20260917',
  't-ironclad-helen',
  '2026-09-17',
  'Coffee held. Full turnaround: GTM ops moving back into finance org for the third time after two prior attempts failed to stick. Role = Go-to-Market Operations, likely VP, reporting to Helen. Strong down-market/SMB, struggling in enterprise with heavy seller turnover. Helen expects more personnel turnover, needs FP&A visibility rebuilt and an analytics rebuild. Ben''s read: good rapport, not sure role scope is wide enough to be compelling.',
  'BEN_OWES',
  CURRENT_TIMESTAMP
);

INSERT INTO public."ActionItem" (id, kind, title, "dueDate", status, "opportunityId", "contactId", "createdAt", "updatedAt")
VALUES (
  'ai-ironclad-followup-note-20260917',
  'MANUAL',
  'Send Helen Wang a follow-up note',
  '2026-09-17',
  'OPEN',
  'o-ironclad',
  'c-helen-wang',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- CodeMetal / Charlie Harrison
UPDATE public."Opportunity" SET
  notes = 'Call held Sep 17, went well. They have a board meeting today; Charlie will follow up next week on whether they can create a role for Ben at all -- role is not yet confirmed to exist.',
  "nextAction" = 'Wait for Charlie''s follow-up next week on whether they can create a role',
  "nextActionOwner" = 'THEM',
  "lastTouchDate" = '2026-09-17',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE id = 'o-codemetal';

UPDATE public."Contact" SET
  "lastTouchDate" = '2026-09-17',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE id = 'c-charlie-harrison';

INSERT INTO public."Touch" (id, "threadId", date, summary, direction, "createdAt")
VALUES (
  'touch-codemetal-charlie-20260917',
  't-codemetal-charlie',
  '2026-09-17',
  'Call held, went well. They have a board meeting today. Charlie will follow up next week on whether they can create a role -- not yet confirmed a role exists. No action needed on Ben''s side until then.',
  'THEY_OWE',
  CURRENT_TIMESTAMP
);

COMMIT;
