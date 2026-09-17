-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('RECRUITER', 'NETWORK', 'COMPANY_SIDE');

-- CreateEnum
CREATE TYPE "WarmthTier" AS ENUM ('HOT', 'WARM', 'COOL', 'COLD');

-- CreateEnum
CREATE TYPE "CadenceTier" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('LEAD', 'CONTACTED', 'SCREEN', 'INTERVIEWING', 'FINAL', 'OFFER', 'CLOSED');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('ACTIVE', 'STALLED', 'PASSED', 'WITHDRAWN', 'CLOSED_WON', 'CLOSED_LOST');

-- CreateEnum
CREATE TYPE "ActionOwner" AS ENUM ('BEN', 'THEM');

-- CreateEnum
CREATE TYPE "TouchDirection" AS ENUM ('BEN_OWES', 'THEY_OWE', 'FYI');

-- CreateEnum
CREATE TYPE "ActionItemKind" AS ENUM ('DERIVED', 'MANUAL');

-- CreateEnum
CREATE TYPE "ActionItemStatus" AS ENUM ('OPEN', 'DONE', 'DISMISSED');

-- CreateEnum
CREATE TYPE "Recommendation" AS ENUM ('PURSUE', 'PASS', 'UNSCORED');

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firm" TEXT,
    "type" "ContactType" NOT NULL,
    "warmthTier" "WarmthTier" NOT NULL,
    "cadenceTier" "CadenceTier" NOT NULL,
    "lastTouchDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "stage" "Stage" NOT NULL DEFAULT 'LEAD',
    "status" "OpportunityStatus" NOT NULL DEFAULT 'ACTIVE',
    "sourceContactId" TEXT,
    "nextAction" TEXT,
    "nextActionOwner" "ActionOwner",
    "lastTouchDate" TIMESTAMP(3),
    "notes" TEXT,
    "scoringModelVersion" INTEGER,
    "criterionScores" JSONB,
    "redFlagsTriggered" JSONB,
    "computedScore" DOUBLE PRECISION,
    "recommendation" "Recommendation" NOT NULL DEFAULT 'UNSCORED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thread" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Touch" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "direction" "TouchDirection" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Touch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionItem" (
    "id" TEXT NOT NULL,
    "kind" "ActionItemKind" NOT NULL DEFAULT 'MANUAL',
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "ActionItemStatus" NOT NULL DEFAULT 'OPEN',
    "opportunityId" TEXT,
    "contactId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringModel" (
    "version" INTEGER NOT NULL,
    "criteria" JSONB NOT NULL,
    "redFlags" JSONB NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoringModel_pkey" PRIMARY KEY ("version")
);

-- CreateIndex
CREATE INDEX "Thread_contactId_idx" ON "Thread"("contactId");

-- CreateIndex
CREATE INDEX "Thread_opportunityId_idx" ON "Thread"("opportunityId");

-- CreateIndex
CREATE INDEX "Touch_threadId_idx" ON "Touch"("threadId");

-- CreateIndex
CREATE INDEX "ActionItem_dueDate_idx" ON "ActionItem"("dueDate");

-- CreateIndex
CREATE INDEX "ActionItem_opportunityId_idx" ON "ActionItem"("opportunityId");

-- CreateIndex
CREATE INDEX "ActionItem_contactId_idx" ON "ActionItem"("contactId");

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_sourceContactId_fkey" FOREIGN KEY ("sourceContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_scoringModelVersion_fkey" FOREIGN KEY ("scoringModelVersion") REFERENCES "ScoringModel"("version") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Touch" ADD CONSTRAINT "Touch_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
