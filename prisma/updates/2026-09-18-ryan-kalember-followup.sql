-- New contact + action item: Ryan Kalember / Proofpoint, Thoma Bravo intro outreach
BEGIN;

INSERT INTO public."Contact" (id, name, firm, type, "warmthTier", "cadenceTier", "lastTouchDate", notes, "createdAt", "updatedAt")
VALUES (
  'c-ryan-kalember',
  'Ryan Kalember',
  'Proofpoint',
  'NETWORK',
  'COLD',
  'FOUR_WEEKS',
  NULL,
  'Cold outreach planned. Email: r.kalember@proofpoint.com.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO public."ActionItem" (id, kind, title, "dueDate", status, "opportunityId", "contactId", "createdAt", "updatedAt")
VALUES (
  'ai-ryan-kalember-followup-20260918',
  'MANUAL',
  'Email Ryan Kalember (r.kalember@proofpoint.com, Proofpoint) re: Thoma Bravo opportunities (Darktrace, Anaplan, Ping Identity) -- ask if he knows Thoma Bravo contacts for intros to learn more about their portfolio and approach',
  '2026-09-18',
  'OPEN',
  NULL,
  'c-ryan-kalember',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

COMMIT;
