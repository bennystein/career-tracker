
-- AlterEnum
BEGIN;
CREATE TYPE "CadenceTier_new" AS ENUM ('THREE_DAYS', 'TWO_WEEKS', 'FOUR_WEEKS');
ALTER TABLE "Contact" ALTER COLUMN "cadenceTier" TYPE "CadenceTier_new" USING ("cadenceTier"::text::"CadenceTier_new");
ALTER TYPE "CadenceTier" RENAME TO "CadenceTier_old";
ALTER TYPE "CadenceTier_new" RENAME TO "CadenceTier";
DROP TYPE "public"."CadenceTier_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "WarmthTier_new" AS ENUM ('HOT', 'WARM', 'COLD');
ALTER TABLE "Contact" ALTER COLUMN "warmthTier" TYPE "WarmthTier_new" USING ("warmthTier"::text::"WarmthTier_new");
ALTER TYPE "WarmthTier" RENAME TO "WarmthTier_old";
ALTER TYPE "WarmthTier_new" RENAME TO "WarmthTier";
DROP TYPE "public"."WarmthTier_old";
COMMIT;

