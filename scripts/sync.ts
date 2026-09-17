/**
 * The write side of the sync layer described in PRD.md: Claude Code parses a
 * debrief/update from chat, then invokes this script with one JSON payload
 * per record to commit it to the shared Postgres database. It always prints
 * a one-line confirmation of exactly what was written — that's the review
 * checkpoint, meant to be echoed back in the same chat turn.
 *
 * Usage:
 *   npx tsx scripts/sync.ts '<json>'
 *
 * Payload shapes (all take an "op" field):
 *   { op: "contact.create", name, firm?, type, warmthTier, cadenceTier, lastTouchDate?, notes? }
 *   { op: "contact.update", contact, ...same fields, all optional }
 *   { op: "opportunity.create", company, role, stage?, status?, source?, nextAction?, nextActionOwner?, notes? }
 *   { op: "opportunity.update", opportunity, stage?, status?, nextAction?, nextActionOwner?, notes? }
 *   { op: "touch", contact, opportunity?, date?, direction, summary }
 *   { op: "actionItem.create", title, dueDate, opportunity?, contact? }
 *   { op: "actionItem.setStatus", id, status }
 *
 * "contact" / "opportunity" / "source" fields accept either a record id or a
 * best-effort name match ("Dana Whitfield", "Brightline Robotics", or
 * "Brightline Robotics / VP Operations").
 */
import { prisma } from "../src/lib/prisma";
import * as mutations from "../src/lib/mutations";

type Json = Record<string, unknown>;

async function findContact(ref: string) {
  const byId = await prisma.contact.findUnique({ where: { id: ref } }).catch(() => null);
  if (byId) return byId;

  const matches = await prisma.contact.findMany({
    where: { name: { contains: ref, mode: "insensitive" } },
  });
  if (matches.length === 1) return matches[0];
  if (matches.length === 0) throw new Error(`No contact matches "${ref}"`);
  throw new Error(`"${ref}" matches multiple contacts: ${matches.map((m) => m.name).join(", ")}`);
}

async function findOpportunity(ref: string) {
  const byId = await prisma.opportunity.findUnique({ where: { id: ref } }).catch(() => null);
  if (byId) return byId;

  const [company, role] = ref.split("/").map((s) => s.trim());
  const matches = await prisma.opportunity.findMany({
    where: {
      company: { contains: company, mode: "insensitive" },
      ...(role ? { role: { contains: role, mode: "insensitive" } } : {}),
    },
  });
  if (matches.length === 1) return matches[0];
  if (matches.length === 0) throw new Error(`No opportunity matches "${ref}"`);
  throw new Error(
    `"${ref}" matches multiple opportunities: ${matches.map((m) => `${m.company} / ${m.role}`).join(", ")}`
  );
}

function str(payload: Json, key: string): string | undefined {
  const v = payload[key];
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

async function run(payload: Json): Promise<string> {
  const op = str(payload, "op");

  switch (op) {
    case "contact.create": {
      const c = await mutations.createContact({
        name: str(payload, "name")!,
        firm: str(payload, "firm") ?? null,
        type: str(payload, "type") as never,
        warmthTier: str(payload, "warmthTier") as never,
        cadenceTier: str(payload, "cadenceTier") as never,
        lastTouchDate: str(payload, "lastTouchDate") ? new Date(str(payload, "lastTouchDate")!) : null,
        notes: str(payload, "notes") ?? null,
      });
      return `Logged: new contact "${c.name}" (${c.type.toLowerCase()}, ${c.cadenceTier.toLowerCase()} cadence).`;
    }

    case "contact.update": {
      const existing = await findContact(str(payload, "contact")!);
      const data: Json = {};
      for (const key of ["firm", "type", "warmthTier", "cadenceTier", "notes"] as const) {
        const v = str(payload, key);
        if (v !== undefined) data[key] = v;
      }
      const lastTouchDate = str(payload, "lastTouchDate");
      if (lastTouchDate) data.lastTouchDate = new Date(lastTouchDate);
      const c = await prisma.contact.update({ where: { id: existing.id }, data });
      return `Logged: updated contact "${c.name}" (${Object.keys(data).join(", ") || "no fields changed"}).`;
    }

    case "opportunity.create": {
      const sourceRef = str(payload, "source");
      const source = sourceRef ? await findContact(sourceRef) : null;
      const o = await mutations.createOpportunity({
        company: str(payload, "company")!,
        role: str(payload, "role")!,
        stage: str(payload, "stage") as never,
        status: str(payload, "status") as never,
        sourceContactId: source?.id ?? null,
        nextAction: str(payload, "nextAction") ?? null,
        nextActionOwner: str(payload, "nextActionOwner") as never,
        notes: str(payload, "notes") ?? null,
      });
      return `Logged: new opportunity "${o.company} / ${o.role}" (stage: ${o.stage.toLowerCase()}).`;
    }

    case "opportunity.update": {
      const existing = await findOpportunity(str(payload, "opportunity")!);
      const data: Json = {};
      for (const key of ["stage", "status", "nextAction", "nextActionOwner", "notes"] as const) {
        const v = str(payload, key);
        if (v !== undefined) data[key] = v;
      }
      const o = await mutations.updateOpportunity(existing.id, data as never);
      return `Logged: updated "${o.company} / ${o.role}" (${Object.keys(data).join(", ") || "no fields changed"}).`;
    }

    case "touch": {
      const contact = await findContact(str(payload, "contact")!);
      const oppRef = str(payload, "opportunity");
      const opportunity = oppRef ? await findOpportunity(oppRef) : null;
      const date = str(payload, "date") ? new Date(str(payload, "date")!) : new Date();
      const touch = await mutations.logTouch({
        contactId: contact.id,
        opportunityId: opportunity?.id ?? null,
        date,
        summary: str(payload, "summary")!,
        direction: str(payload, "direction") as never,
      });
      return `Logged: touch with ${contact.name}${opportunity ? ` on ${opportunity.company} / ${opportunity.role}` : ""} (${date.toISOString().slice(0, 10)}, ${str(payload, "direction")}) — "${touch.summary.slice(0, 80)}${touch.summary.length > 80 ? "…" : ""}"`;
    }

    case "actionItem.create": {
      const oppRef = str(payload, "opportunity");
      const contactRef = str(payload, "contact");
      const opportunity = oppRef ? await findOpportunity(oppRef) : null;
      const contact = contactRef ? await findContact(contactRef) : null;
      const item = await mutations.createActionItem({
        title: str(payload, "title")!,
        dueDate: new Date(str(payload, "dueDate")!),
        opportunityId: opportunity?.id ?? null,
        contactId: contact?.id ?? null,
      });
      return `Logged: action item "${item.title}" due ${item.dueDate.toISOString().slice(0, 10)}.`;
    }

    case "actionItem.setStatus": {
      const id = str(payload, "id")!;
      const status = str(payload, "status") as "OPEN" | "DONE" | "DISMISSED";
      const item = await mutations.updateActionItemStatus(id, status);
      return `Logged: action item "${item.title}" marked ${status.toLowerCase()}.`;
    }

    default:
      throw new Error(`Unknown op "${op}". See the header comment in scripts/sync.ts for valid ops.`);
  }
}

async function main() {
  const raw = process.argv[2];
  if (!raw) {
    console.error("Usage: npx tsx scripts/sync.ts '<json payload>'");
    process.exit(1);
  }

  let payload: Json;
  try {
    payload = JSON.parse(raw);
  } catch {
    console.error("Invalid JSON payload.");
    process.exit(1);
  }

  try {
    const confirmation = await run(payload);
    console.log(confirmation);
  } catch (err) {
    console.error(`Sync failed: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
