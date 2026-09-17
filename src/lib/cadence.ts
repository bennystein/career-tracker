import type { CadenceTier } from "@/generated/prisma/enums";

// THREE_DAYS approximates "3 business days" as 4 calendar days, splitting
// the difference between a same-week touch (3 days) and one spanning a
// weekend (5 days), rather than pulling in a business-day calendar for v1.
const CADENCE_DAYS: Record<CadenceTier, number> = {
  THREE_DAYS: 4,
  TWO_WEEKS: 14,
  FOUR_WEEKS: 28,
};

export const CADENCE_LABELS: Record<CadenceTier, string> = {
  THREE_DAYS: "3 business days",
  TWO_WEEKS: "2 weeks",
  FOUR_WEEKS: "4 weeks",
};

export function cadenceDays(tier: CadenceTier): number {
  return CADENCE_DAYS[tier];
}

export function daysSince(date: Date | null, now: Date = new Date()): number | null {
  if (!date) return null;
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function isOverdue(
  lastTouchDate: Date | null,
  cadenceTier: CadenceTier,
  now: Date = new Date()
): boolean {
  const since = daysSince(lastTouchDate, now);
  if (since === null) return true;
  return since > cadenceDays(cadenceTier);
}

export function dueDateFor(lastTouchDate: Date | null, cadenceTier: CadenceTier): Date {
  const base = lastTouchDate ?? new Date();
  const due = new Date(base);
  due.setDate(due.getDate() + cadenceDays(cadenceTier));
  return due;
}
