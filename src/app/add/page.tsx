import { prisma } from "@/lib/prisma";
import {
  createActionItemAction,
  createContactAction,
  createOpportunityAction,
  logTouchAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function QuickAddPage() {
  const [contacts, opportunities] = await Promise.all([
    prisma.contact.findMany({ orderBy: { name: "asc" } }),
    prisma.opportunity.findMany({ orderBy: { company: "asc" } }),
  ]);

  return (
    <div className="grid max-w-4xl gap-6 md:grid-cols-2">
      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 font-medium">New contact</h2>
        <form action={createContactAction} className="space-y-2 text-sm">
          <input name="name" placeholder="Name" required className="w-full rounded border border-neutral-300 p-1.5" />
          <input name="firm" placeholder="Firm" className="w-full rounded border border-neutral-300 p-1.5" />
          <div className="flex gap-2">
            <select name="type" required className="w-full rounded border border-neutral-300 p-1.5">
              <option value="RECRUITER">Recruiter</option>
              <option value="NETWORK">Network</option>
              <option value="COMPANY_SIDE">Company-side</option>
            </select>
            <select name="warmthTier" required className="w-full rounded border border-neutral-300 p-1.5">
              <option value="HOT">Hot</option>
              <option value="WARM">Warm</option>
              <option value="COLD">Cold</option>
            </select>
          </div>
          <select name="cadenceTier" required className="w-full rounded border border-neutral-300 p-1.5">
            <option value="THREE_DAYS">3 business days (hot)</option>
            <option value="TWO_WEEKS">2 weeks (warm)</option>
            <option value="FOUR_WEEKS">4 weeks (cold)</option>
          </select>
          <textarea name="notes" placeholder="Notes" className="w-full rounded border border-neutral-300 p-1.5" />
          <button className="rounded bg-neutral-900 px-3 py-1.5 text-white hover:bg-neutral-700">
            Add contact
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 font-medium">New opportunity</h2>
        <form action={createOpportunityAction} className="space-y-2 text-sm">
          <input name="company" placeholder="Company" required className="w-full rounded border border-neutral-300 p-1.5" />
          <input name="role" placeholder="Role" required className="w-full rounded border border-neutral-300 p-1.5" />
          <select name="sourceContactId" className="w-full rounded border border-neutral-300 p-1.5">
            <option value="">No source contact</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input name="nextAction" placeholder="Next action" className="w-full rounded border border-neutral-300 p-1.5" />
          <select name="nextActionOwner" className="w-full rounded border border-neutral-300 p-1.5">
            <option value="">Owner —</option>
            <option value="BEN">Ben</option>
            <option value="THEM">Them</option>
          </select>
          <textarea name="notes" placeholder="Notes" className="w-full rounded border border-neutral-300 p-1.5" />
          <button className="rounded bg-neutral-900 px-3 py-1.5 text-white hover:bg-neutral-700">
            Add opportunity
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 font-medium">Log a touch / debrief</h2>
        <form action={logTouchAction} className="space-y-2 text-sm">
          <select name="contactId" required className="w-full rounded border border-neutral-300 p-1.5">
            <option value="">Contact...</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select name="opportunityId" className="w-full rounded border border-neutral-300 p-1.5">
            <option value="">No linked opportunity</option>
            {opportunities.map((o) => (
              <option key={o.id} value={o.id}>
                {o.company} — {o.role}
              </option>
            ))}
          </select>
          <input type="date" name="date" className="w-full rounded border border-neutral-300 p-1.5" />
          <select name="direction" required className="w-full rounded border border-neutral-300 p-1.5">
            <option value="FYI">FYI</option>
            <option value="BEN_OWES">Ben owes them</option>
            <option value="THEY_OWE">They owe Ben</option>
          </select>
          <textarea
            name="summary"
            placeholder="Summary"
            required
            className="w-full rounded border border-neutral-300 p-1.5"
          />
          <button className="rounded bg-neutral-900 px-3 py-1.5 text-white hover:bg-neutral-700">
            Log touch
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 font-medium">New action item</h2>
        <form action={createActionItemAction} className="space-y-2 text-sm">
          <input name="title" placeholder="Title" required className="w-full rounded border border-neutral-300 p-1.5" />
          <input type="date" name="dueDate" required className="w-full rounded border border-neutral-300 p-1.5" />
          <select name="opportunityId" className="w-full rounded border border-neutral-300 p-1.5">
            <option value="">No linked opportunity</option>
            {opportunities.map((o) => (
              <option key={o.id} value={o.id}>
                {o.company} — {o.role}
              </option>
            ))}
          </select>
          <select name="contactId" className="w-full rounded border border-neutral-300 p-1.5">
            <option value="">No linked contact</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button className="rounded bg-neutral-900 px-3 py-1.5 text-white hover:bg-neutral-700">
            Add action item
          </button>
        </form>
      </section>
    </div>
  );
}
