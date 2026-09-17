import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isOverdue, daysSince, dueDateFor, CADENCE_LABELS } from "@/lib/cadence";
import { setActionItemStatusAction } from "@/app/add/actions";

export const dynamic = "force-dynamic";

export default async function DuePage() {
  const [contacts, actionItems] = await Promise.all([
    prisma.contact.findMany({ orderBy: { lastTouchDate: "asc" } }),
    prisma.actionItem.findMany({
      where: { status: "OPEN" },
      include: { opportunity: true, contact: true },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  const overdueContacts = contacts
    .filter((c) => isOverdue(c.lastTouchDate, c.cadenceTier))
    .map((c) => ({
      contact: c,
      since: daysSince(c.lastTouchDate),
      due: dueDateFor(c.lastTouchDate, c.cadenceTier),
    }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold">Due</h1>

      <h2 className="text-sm font-medium text-muted">Cadence overdue</h2>
      <p className="mb-2 text-xs text-subtle">
        Computed automatically from each contact&apos;s cadence tier and last touch date.
      </p>
      <ul className="space-y-2">
        {overdueContacts.map(({ contact, since }) => (
          <li key={contact.id}>
            <Link
              href={`/contacts/${contact.id}`}
              className="flex flex-wrap items-center justify-between gap-1 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm hover:border-amber-300 dark:border-amber-400/20 dark:bg-amber-400/10"
            >
              <span>
                <span className="font-medium">{contact.name}</span>
                <span className="ml-2 text-muted">{CADENCE_LABELS[contact.cadenceTier]} cadence</span>
              </span>
              <span className="text-amber-800 dark:text-amber-300">
                {since === null ? "never touched" : `${since}d since last touch`}
              </span>
            </Link>
          </li>
        ))}
        {overdueContacts.length === 0 && <p className="text-sm text-subtle">Nobody is overdue right now.</p>}
      </ul>

      <h2 className="mt-6 text-sm font-medium text-muted">Action items</h2>
      <ul className="mt-2 space-y-2">
        {actionItems.map((item) => {
          const overdue = item.dueDate < today;
          return (
            <li
              key={item.id}
              className={`rounded-lg border p-3 text-sm ${
                overdue
                  ? "border-rose-200 bg-rose-50 dark:border-rose-400/20 dark:bg-rose-400/10"
                  : "border-border bg-surface"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted">
                    due {item.dueDate.toISOString().slice(0, 10)}
                    {item.opportunity && (
                      <>
                        {" · "}
                        <Link href={`/pipeline/${item.opportunity.id}`} className="hover:underline">
                          {item.opportunity.company}
                        </Link>
                      </>
                    )}
                    {item.contact && (
                      <>
                        {" · "}
                        <Link href={`/contacts/${item.contact.id}`} className="hover:underline">
                          {item.contact.name}
                        </Link>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <form action={setActionItemStatusAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value="DONE" />
                    <button className="rounded border border-border-strong px-2.5 py-1.5 text-xs hover:bg-surface-muted">
                      done
                    </button>
                  </form>
                  <form action={setActionItemStatusAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value="DISMISSED" />
                    <button className="rounded border border-border-strong px-2.5 py-1.5 text-xs hover:bg-surface-muted">
                      dismiss
                    </button>
                  </form>
                </div>
              </div>
            </li>
          );
        })}
        {actionItems.length === 0 && <p className="text-sm text-subtle">No open action items.</p>}
      </ul>
    </div>
  );
}
