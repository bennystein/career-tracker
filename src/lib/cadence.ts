import type { CadenceTier } from "@/generated/prisma/enums";

const CADENCE_DAYS: Record<CadenceTier, number> = {
  WEEKLY: 7,
  BIWEEKLY: 14,
  MONTHLY: 30,
  QUARTERLY: 90,
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
