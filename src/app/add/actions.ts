"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as mutations from "@/lib/mutations";
import type {
  ActionOwner,
  CadenceTier,
  ContactType,
  OpportunityStatus,
  Stage,
  TouchDirection,
  WarmthTier,
} from "@/generated/prisma/enums";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

export async function createContactAction(formData: FormData) {
  await mutations.createContact({
    name: str(formData, "name")!,
    firm: str(formData, "firm"),
    type: str(formData, "type") as ContactType,
    warmthTier: str(formData, "warmthTier") as WarmthTier,
    cadenceTier: str(formData, "cadenceTier") as CadenceTier,
    lastTouchDate: str(formData, "lastTouchDate") ? new Date(str(formData, "lastTouchDate")!) : null,
    notes: str(formData, "notes"),
  });
  revalidatePath("/contacts");
  redirect("/contacts");
}

export async function createOpportunityAction(formData: FormData) {
  await mutations.createOpportunity({
    company: str(formData, "company")!,
    role: str(formData, "role")!,
    stage: (str(formData, "stage") as Stage) ?? undefined,
    status: (str(formData, "status") as OpportunityStatus) ?? undefined,
    sourceContactId: str(formData, "sourceContactId"),
    nextAction: str(formData, "nextAction"),
    nextActionOwner: str(formData, "nextActionOwner") as ActionOwner | null,
    notes: str(formData, "notes"),
  });
  revalidatePath("/pipeline");
  redirect("/pipeline");
}

export async function updateOpportunityAction(formData: FormData) {
  const id = str(formData, "id")!;
  await mutations.updateOpportunity(id, {
    stage: str(formData, "stage") as Stage,
    status: str(formData, "status") as OpportunityStatus,
    nextAction: str(formData, "nextAction"),
    nextActionOwner: str(formData, "nextActionOwner") as ActionOwner | null,
  });
  revalidatePath("/pipeline");
  revalidatePath(`/pipeline/${id}`);
  redirect(`/pipeline/${id}`);
}

export async function logTouchAction(formData: FormData) {
  await mutations.logTouch({
    contactId: str(formData, "contactId")!,
    opportunityId: str(formData, "opportunityId"),
    date: str(formData, "date") ? new Date(str(formData, "date")!) : new Date(),
    summary: str(formData, "summary")!,
    direction: str(formData, "direction") as TouchDirection,
  });
  revalidatePath("/pipeline");
  revalidatePath("/contacts");
  revalidatePath("/due");
  redirect("/due");
}

export async function createActionItemAction(formData: FormData) {
  await mutations.createActionItem({
    title: str(formData, "title")!,
    dueDate: new Date(str(formData, "dueDate")!),
    opportunityId: str(formData, "opportunityId"),
    contactId: str(formData, "contactId"),
  });
  revalidatePath("/due");
  redirect("/due");
}

export async function setActionItemStatusAction(formData: FormData) {
  const id = str(formData, "id")!;
  const status = str(formData, "status") as "OPEN" | "DONE" | "DISMISSED";
  await mutations.updateActionItemStatus(id, status);
  revalidatePath("/due");
}
