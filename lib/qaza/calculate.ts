export type PrayerKey = "fajr" | "zuhr" | "asr" | "maghrib" | "isha" | "witr";

export const PRAYERS: { key: PrayerKey; name: string }[] = [
  { key: "fajr", name: "Fajr" },
  { key: "zuhr", name: "Zuhr" },
  { key: "asr", name: "Asr" },
  { key: "maghrib", name: "Maghrib" },
  { key: "isha", name: "Isha" },
  { key: "witr", name: "Witr" },
];

export function activePrayers(includeWitr: boolean) {
  return includeWitr ? PRAYERS : PRAYERS.filter((p) => p.key !== "witr");
}

export interface ExclusionPeriod {
  start_date: string;
  end_date: string;
}

function parseDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00Z`);
}

/** Whole days elapsed between two YYYY-MM-DD dates (Gregorian day-count, per PRD). */
export function daysBetween(startDate: string, endDate: string): number {
  const ms = parseDate(endDate).getTime() - parseDate(startDate).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

function daysInPeriod(period: ExclusionPeriod): number {
  return daysBetween(period.start_date, period.end_date) + 1;
}

export function totalExcludedDays(periods: ExclusionPeriod[]): number {
  return periods.reduce((sum, p) => sum + daysInPeriod(p), 0);
}

/**
 * Total days owed per prayer — derived live from the settings dates and any
 * exclusion periods rather than persisted, so editing the bulugh date later
 * only changes this denominator and never touches logged `done` counts.
 */
export function totalDaysOwed(
  bulughDate: string,
  qazaEndDate: string,
  exclusions: ExclusionPeriod[] = [],
): number {
  const total = daysBetween(bulughDate, qazaEndDate);
  const excluded = totalExcludedDays(exclusions);
  return Math.max(0, total - excluded);
}
