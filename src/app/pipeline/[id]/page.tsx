import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateOpportunityAction } from "@/app/add/actions";

export const dynamic = "force-dynamic";

const STAGES = ["LEAD", "CONTACTED", "SCREEN", "INTERVIEWING", "FINAL", "OFFER", "CLOSED"] as const;
const STATUSES = ["ACTIVE", "STALLED", "PASSED", "WITHDRAWN", "CLOSED_WON", "CLOSED_LOST"] as const;

export default async function OpportunityDetailPage(props: PageProps<"/pipeline/[id]">) {
  const { id } = await props.params;

  const opp = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      source: true,
      threads: {
        include: { touches: { orderBy: { date: "desc" } }, contact: true },
      },
    },
  });

  if (!opp) notFound();

  const touches = opp.threads
    .flatMap((t) => t.touches.map((touch) => ({ ...touch, contactName: t.contact.name })))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="max-w-2xl">
      <Link href="/pipeline" className="text-sm text-muted hover:underline">
        &larr; Pipeline
      </Link>
      <h1 className="mt-1 text-xl font-semibold">
        {opp.company} — {opp.role}
      </h1>
      {opp.source && (
        <p className="text-sm text-muted">
          Source:{" "}
          <Link href={`/contacts/${opp.source.id}`} className="hover:underline">
            {opp.source.name}
          </Link>
        </p>
      )}

      <form
        action={updateOpportunityAction}
        className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2"
      >
        <input type="hidden" name="id" value={opp.id} />
        <label className="text-sm">
          Stage
          <select
            name="stage"
            defaultValue={opp.stage}
            className="mt-1 w-full rounded border border-border-strong bg-transparent p-2 text-foreground"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Status
          <select
            name="status"
            defaultValue={opp.status}
            className="mt-1 w-full rounded border border-border-strong bg-transparent p-2 text-foreground"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm sm:col-span-2">
          Next action
          <input
            name="nextAction"
            defaultValue={opp.nextAction ?? ""}
            className="mt-1 w-full rounded border border-border-strong bg-transparent p-2 text-foreground"
          />
        </label>
        <label className="text-sm">
          Owner
          <select
            name="nextActionOwner"
            defaultValue={opp.nextActionOwner ?? ""}
            className="mt-1 w-full rounded border border-border-strong bg-transparent p-2 text-foreground"
          >
            <option value="">—</option>
            <option value="BEN">Ben</option>
            <option value="THEM">Them</option>
          </select>
        </label>
        <div className="flex justify-end sm:col-span-2">
          <button className="w-full rounded bg-accent px-3 py-2 text-sm text-accent-foreground hover:opacity-90 sm:w-auto">
            Save
          </button>
        </div>
      </form>

      {opp.notes && (
        <div className="mt-4 rounded-lg border border-border bg-surface p-4 text-sm text-muted">{opp.notes}</div>
      )}

      {opp.scoringModelVersion && (
        <div className="mt-4 rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-medium">
            Scoring (model v{opp.scoringModelVersion}) — {opp.computedScore?.toFixed(2)} /{" "}
            {opp.recommendation.toLowerCase()}
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {Array.isArray(opp.criterionScores) &&
              (opp.criterionScores as { name: string; value: number }[]).map((c) => (
                <li key={c.name} className="flex justify-between">
                  <span>{c.name}</span>
                  <span>{c.value}</span>
                </li>
              ))}
          </ul>
          {Array.isArray(opp.redFlagsTriggered) && opp.redFlagsTriggered.length > 0 && (
            <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
              Red flags: {(opp.redFlagsTriggered as string[]).join(", ")}
            </p>
          )}
        </div>
      )}

      <h2 className="mt-6 text-sm font-medium text-muted">Touch history</h2>
      <ul className="mt-2 space-y-2">
        {touches.map((touch) => (
          <li key={touch.id} className="rounded-lg border border-border bg-surface p-3 text-sm">
            <div className="flex justify-between text-xs text-subtle">
              <span>{touch.contactName}</span>
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
