import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Opportunity, Stage } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const STAGE_ORDER: Stage[] = [
  "LEAD",
  "CONTACTED",
  "SCREEN",
  "INTERVIEWING",
  "FINAL",
  "OFFER",
  "CLOSED",
];

const STAGE_LABELS: Record<Stage, string> = {
  LEAD: "Lead",
  CONTACTED: "Contacted",
  SCREEN: "Screen",
  INTERVIEWING: "Interviewing",
  FINAL: "Final",
  OFFER: "Offer",
  CLOSED: "Closed",
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300",
  STALLED: "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300",
  PASSED: "bg-surface-muted text-muted",
  WITHDRAWN: "bg-surface-muted text-muted",
  CLOSED_WON: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300",
  CLOSED_LOST: "bg-surface-muted text-muted",
};

const RECOMMENDATION_STYLES: Record<string, string> = {
  PURSUE: "bg-blue-100 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300",
  PASS: "bg-rose-100 text-rose-800 dark:bg-rose-400/10 dark:text-rose-300",
  UNSCORED: "bg-surface-muted text-subtle",
};

export default async function PipelinePage() {
  const opportunities = await prisma.opportunity.findMany({
    include: { source: true },
    orderBy: [{ computedScore: "desc" }, { lastTouchDate: "desc" }],
  });

  const byStage = new Map<Stage, Opportunity[]>();
  for (const stage of STAGE_ORDER) byStage.set(stage, []);
  for (const opp of opportunities) {
    byStage.get(opp.stage)?.push(opp);
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Pipeline</h1>
      <div className="flex flex-col gap-6 sm:flex-row sm:gap-4 sm:overflow-x-auto sm:pb-4">
        {STAGE_ORDER.map((stage) => {
          const items = byStage.get(stage) ?? [];
          return (
            <div
              key={stage}
              className={`w-full sm:w-72 sm:shrink-0 ${items.length === 0 ? "hidden sm:block" : ""}`}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="text-sm font-medium text-muted">{STAGE_LABELS[stage]}</h2>
                <span className="text-xs text-subtle">{items.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((opp) => (
                  <Link
                    key={opp.id}
                    href={`/pipeline/${opp.id}`}
                    className="block rounded-lg border border-border bg-surface p-3 shadow-sm hover:border-border-strong"
                  >
                    <div className="font-medium">{opp.company}</div>
                    <div className="text-sm text-muted">{opp.role}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs ${STATUS_STYLES[opp.status] ?? ""}`}
                      >
                        {opp.status.replace("_", " ").toLowerCase()}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs ${RECOMMENDATION_STYLES[opp.recommendation]}`}
                      >
                        {opp.recommendation.toLowerCase()}
                      </span>
                    </div>
                    {opp.nextAction && (
                      <div className="mt-2 text-xs text-subtle">
                        Next: {opp.nextAction}
                        {opp.nextActionOwner && ` (${opp.nextActionOwner.toLowerCase()})`}
                      </div>
                    )}
                  </Link>
                ))}
                {items.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-subtle">
                    empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
