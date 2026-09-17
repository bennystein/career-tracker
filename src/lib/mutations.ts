import { prisma } from "@/lib/prisma";
import type {
  ActionOwner,
  CadenceTier,
  ContactType,
  OpportunityStatus,
  Stage,
  TouchDirection,
  WarmthTier,
} from "@/generated/prisma/enums";

export async function createContact(data: {
  name: string;
  firm?: string | null;
  type: ContactType;
  warmthTier: WarmthTier;
  cadenceTier: CadenceTier;
  lastTouchDate?: Date | null;
  notes?: string | null;
}) {
  return prisma.contact.create({ data });
}

export async function createOpportunity(data: {
  company: string;
  role: string;
  stage?: Stage;
  status?: OpportunityStatus;
  sourceContactId?: string | null;
  nextAction?: string | null;
  nextActionOwner?: ActionOwner | null;
  lastTouchDate?: Date | null;
  notes?: string | null;
}) {
  return prisma.opportunity.create({ data });
}

export async function updateOpportunity(
  id: string,
  data: Partial<{
    stage: Stage;
    status: OpportunityStatus;
    nextAction: string | null;
    nextActionOwner: ActionOwner | null;
    notes: string | null;
  }>
) {
  return prisma.opportunity.update({ where: { id }, data });
}

/**
 * Structured debrief intake. Logs one touch on the Thread linking a Contact
 * to an (optional) Opportunity, creating the Thread if it doesn't exist yet,
 * and bumps last-touch dates on both sides.
 */
export async function logTouch(input: {
  contactId: string;
  opportunityId?: string | null;
  date: Date;
  summary: string;
  direction: TouchDirection;
}) {
  const { contactId, opportunityId, date, summary, direction } = input;

  let thread = await prisma.thread.findFirst({
    where: { contactId, opportunityId: opportunityId ?? null },
  });
  if (!thread) {
    thread = await prisma.thread.create({
      data: { contactId, opportunityId: opportunityId ?? null },
    });
  }

  const touch = await prisma.touch.create({
    data: { threadId: thread.id, date, summary, direction },
  });

  await prisma.contact.update({ where: { id: contactId }, data: { lastTouchDate: date } });
  if (opportunityId) {
    await prisma.opportunity.update({ where: { id: opportunityId }, data: { lastTouchDate: date } });
  }

  return touch;
}

export async function createActionItem(data: {
  title: string;
  dueDate: Date;
  opportunityId?: string | null;
  contactId?: string | null;
  kind?: "MANUAL" | "DERIVED";
}) {
  return prisma.actionItem.create({ data });
}

export async function updateActionItemStatus(id: string, status: "OPEN" | "DONE" | "DISMISSED") {
  return prisma.actionItem.update({ where: { id }, data: { status } });
}
