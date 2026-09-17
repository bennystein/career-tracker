import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isOverdue, daysSince, cadenceDays } from "@/lib/cadence";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage(props: PageProps<"/contacts/[id]">) {
  const { id } = await props.params;

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      opportunities: true,
      threads: {
        include: { touches: { orderBy: { date: "desc" } }, opportunity: true },
      },
    },
  });

  if (!contact) notFound();

  const overdue = isOverdue(contact.lastTouchDate, contact.cadenceTier);
  const since = daysSince(contact.lastTouchDate);
  const cadence = cadenceDays(contact.cadenceTier);

  const touches = contact.threads
    .flatMap((t) =>
      t.touches.map((touch) => ({
        ...touch,
        opportunityLabel: t.opportunity ? `${t.opportunity.company} — ${t.opportunity.role}` : null,
      }))
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="max-w-2xl">
      <Link href="/contacts" className="text-sm text-muted hover:underline">
        &larr; Contacts
      </Link>
      <h1 className="mt-1 text-xl font-semibold">{contact.name}</h1>
      {contact.firm && <p className="text-sm text-muted">{contact.firm}</p>}

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded bg-surface-muted px-1.5 py-0.5">{contact.type.replace("_", " ").toLowerCase()}</span>
        <span className="rounded bg-surface-muted px-1.5 py-0.5">warmth: {contact.warmthTier.toLowerCase()}</span>
        <span className="rounded bg-surface-muted px-1.5 py-0.5">cadence: every {cadence}d</span>
        {overdue ? (
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
            overdue{since !== null ? ` (${since}d since last touch)` : ""}
          </span>
        ) : (
          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300">
            on cadence
          </span>
        )}
      </div>

      {contact.notes && (
        <div className="mt-4 rounded-lg border border-border bg-surface p-3 text-sm text-muted">
          {contact.notes}
        </div>
      )}

      <h2 className="mt-6 text-sm font-medium text-muted">Linked opportunities</h2>
      <ul className="mt-2 space-y-2">
        {contact.opportunities.map((o) => (
          <li key={o.id}>
            <Link
              href={`/pipeline/${o.id}`}
              className="block rounded-lg border border-border bg-surface p-3 text-sm hover:border-border-strong"
            >
              <span className="font-medium">{o.company}</span> — {o.role}
              <span className="ml-2 text-xs text-subtle">{o.stage.toLowerCase()}</span>
            </Link>
          </li>
        ))}
        {contact.opportunities.length === 0 && <p className="text-sm text-subtle">No linked opportunities.</p>}
      </ul>

      <h2 className="mt-6 text-sm font-medium text-muted">Touch history</h2>
      <ul className="mt-2 space-y-2">
        {touches.map((touch) => (
          <li key={touch.id} className="rounded-lg border border-border bg-surface p-3 text-sm">
            <div className="flex justify-between text-xs text-subtle">
              <span>{touch.opportunityLabel ?? "general"}</span>
              <span>{touch.date.toISOString().slice(0, 10)}</span>
            </div>
            <p className="mt-1">{touch.summary}</p>
            <span className="mt-1 inline-block text-xs text-subtle">
              {touch.direction.replace("_", " ").toLowerCase()}
            </span>
          </li>
        ))}
        {touches.length === 0 && <p className="text-sm text-subtle">No touches logged yet.</p>}
      </ul>
    </div>
  );
}
