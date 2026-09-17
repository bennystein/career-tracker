import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isOverdue, CADENCE_LABELS } from "@/lib/cadence";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Contacts</h1>
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-500">
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
                <tr key={c.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-3 py-2">
                    <Link href={`/contacts/${c.id}`} className="font-medium hover:underline">
                      {c.name}
                    </Link>
                    {c.firm && <span className="ml-1 text-neutral-400">· {c.firm}</span>}
                  </td>
                  <td className="px-3 py-2 text-neutral-600">{c.type.replace("_", " ").toLowerCase()}</td>
                  <td className="px-3 py-2 text-neutral-600">{c.warmthTier.toLowerCase()}</td>
                  <td className="px-3 py-2 text-neutral-600">{CADENCE_LABELS[c.cadenceTier]}</td>
                  <td className="px-3 py-2 text-neutral-600">
                    {c.lastTouchDate ? c.lastTouchDate.toISOString().slice(0, 10) : "never"}
                  </td>
                  <td className="px-3 py-2">
                    {overdue ? (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">overdue</span>
                    ) : (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800">on cadence</span>
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
