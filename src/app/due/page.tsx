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

      <h2 className="text-sm font-medium text-neutral-700">Cadence overdue</h2>
      <p className="mb-2 text-xs text-neutral-400">
        Computed automatically from each contact&apos;s cadence tier and last touch date.
      </p>
      <ul className="space-y-2">
        {overdueContacts.map(({ contact, since }) => (
          <li key={contact.id}>
            <Link
              href={`/contacts/${contact.id}`}
              className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm hover:border-amber-300"
            >
              <span>
                <span className="font-medium">{contact.name}</span>
                <span className="ml-2 text-neutral-500">
                  {CADENCE_LABELS[contact.cadenceTier]} cadence
                </span>
              </span>
              <span className="text-amber-800">{since}d since last touch</span>
            </Link>
          </li>
        ))}
        {overdueContacts.length === 0 && (
          <p className="text-sm text-neutral-400">Nobody is overdue right now.</p>
        )}
      </ul>

      <h2 className="mt-6 text-sm font-medium text-neutral-700">Action items</h2>
      <ul className="mt-2 space-y-2">
        {actionItems.map((item) => {
          const overdue = item.dueDate < today;
          return (
            <li
              key={item.id}
              className={`rounded-lg border p-3 text-sm ${overdue ? "border-rose-200 bg-rose-50" : "border-neutral-200 bg-white"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-neutral-500">
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
                <div className="flex shrink-0 gap-1">
                  <form action={setActionItemStatusAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value="DONE" />
                    <button className="rounded border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100">
                      done
                    </button>
                  </form>
                  <form action={setActionItemStatusAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value="DISMISSED" />
                    <button className="rounded border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100">
                      dismiss
                    </button>
                  </form>
                </div>
              </div>
            </li>
          );
        })}
        {actionItems.length === 0 && <p className="text-sm text-neutral-400">No open action items.</p>}
      </ul>
    </div>
  );
}
