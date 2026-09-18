-- Move Anaplan and CompanyCam to Interviewing stage
BEGIN;

UPDATE public."Opportunity" SET stage = 'INTERVIEWING', "updatedAt" = CURRENT_TIMESTAMP WHERE id = 'o-anaplan';
UPDATE public."Opportunity" SET stage = 'INTERVIEWING', "updatedAt" = CURRENT_TIMESTAMP WHERE id = 'o-companycam';

COMMIT;
