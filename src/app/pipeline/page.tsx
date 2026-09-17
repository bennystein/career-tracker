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
  ACTIVE: "bg-emerald-100 text-emerald-800",
  STALLED: "bg-amber-100 text-amber-800",
  PASSED: "bg-neutral-200 text-neutral-600",
  WITHDRAWN: "bg-neutral-200 text-neutral-600",
  CLOSED_WON: "bg-emerald-100 text-emerald-800",
  CLOSED_LOST: "bg-neutral-200 text-neutral-600",
};

const RECOMMENDATION_STYLES: Record<string, string> = {
  PURSUE: "bg-blue-100 text-blue-800",
  PASS: "bg-rose-100 text-rose-800",
  UNSCORED: "bg-neutral-100 text-neutral-500",
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
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGE_ORDER.map((stage) => {
          const items = byStage.get(stage) ?? [];
          return (
            <div key={stage} className="w-72 shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="text-sm font-medium text-neutral-700">
                  {STAGE_LABELS[stage]}
                </h2>
                <span className="text-xs text-neutral-400">{items.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((opp) => (
                  <Link
                    key={opp.id}
                    href={`/pipeline/${opp.id}`}
                    className="block rounded-lg border border-neutral-200 bg-white p-3 shadow-sm hover:border-neutral-300"
                  >
                    <div className="font-medium">{opp.company}</div>
                    <div className="text-sm text-neutral-600">{opp.role}</div>
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
                      <div className="mt-2 text-xs text-neutral-500">
                        Next: {opp.nextAction}
                        {opp.nextActionOwner && ` (${opp.nextActionOwner.toLowerCase()})`}
                      </div>
                    )}
                  </Link>
                ))}
                {items.length === 0 && (
                  <div className="rounded-lg border border-dashed border-neutral-200 p-3 text-center text-xs text-neutral-400">
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
