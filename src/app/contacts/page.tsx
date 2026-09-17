import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isOverdue, CADENCE_LABELS } from "@/lib/cadence";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Contacts</h1>

      {/* Mobile: card list */}
      <div className="flex flex-col gap-2 md:hidden">
        {contacts.map((c) => {
          const overdue = isOverdue(c.lastTouchDate, c.cadenceTier);
          return (
            <Link
              key={c.id}
              href={`/contacts/${c.id}`}
              className="rounded-lg border border-border bg-surface p-3 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{c.name}</div>
                  {c.firm && <div className="text-xs text-subtle">{c.firm}</div>}
                </div>
                {overdue ? (
                  <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
                    overdue
                  </span>
                ) : (
                  <span className="shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300">
                    on cadence
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1 text-xs text-muted">
                <span className="rounded bg-surface-muted px-1.5 py-0.5">
                  {c.type.replace("_", " ").toLowerCase()}
                </span>
                <span className="rounded bg-surface-muted px-1.5 py-0.5">{c.warmthTier.toLowerCase()}</span>
                <span className="rounded bg-surface-muted px-1.5 py-0.5">{CADENCE_LABELS[c.cadenceTier]}</span>
              </div>
              <div className="mt-1 text-xs text-subtle">
                Last touch: {c.lastTouchDate ? c.lastTouchDate.toISOString().slice(0, 10) : "never"}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-muted text-left text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Warmth</th>
              <th className="px-3 py-2 font-medium">Cadence</th>
              <th className="px-3 py-2 font-medium">Last touch</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => {
              const overdue = isOverdue(c.lastTouchDate, c.cadenceTier);
              return (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2">
                    <Link href={`/contacts/${c.id}`} className="font-medium hover:underline">
                      {c.name}
                    </Link>
                    {c.firm && <span className="ml-1 text-subtle">· {c.firm}</span>}
                  </td>
                  <td className="px-3 py-2 text-muted">{c.type.replace("_", " ").toLowerCase()}</td>
                  <td className="px-3 py-2 text-muted">{c.warmthTier.toLowerCase()}</td>
                  <td className="px-3 py-2 text-muted">{CADENCE_LABELS[c.cadenceTier]}</td>
                  <td className="px-3 py-2 text-muted">
                    {c.lastTouchDate ? c.lastTouchDate.toISOString().slice(0, 10) : "never"}
                  </td>
                  <td className="px-3 py-2">
                    {overdue ? (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
                        overdue
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300">
                        on cadence
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
