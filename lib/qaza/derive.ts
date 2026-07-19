import type { PrayerKey } from "./calculate";
import type { QazaLogRow } from "./queries";

export function computePrayerTotals(logs: { prayer: PrayerKey; delta: number }[]) {
  const totals: Record<PrayerKey, number> = {
    fajr: 0,
    zuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
    witr: 0,
  };
  for (const log of logs) {
    totals[log.prayer] += log.delta;
  }
  for (const key of Object.keys(totals) as PrayerKey[]) {
    totals[key] = Math.max(0, totals[key]);
  }
  return totals;
}

/** date (YYYY-MM-DD) -> total prayers logged that day, for the heatmap. */
export function computeDailyActivity(logs: { log_date: string; delta: number }[]) {
  const map = new Map<string, number>();
  for (const log of logs) {
    map.set(log.log_date, (map.get(log.log_date) ?? 0) + log.delta);
  }
  return map;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function computeStreak(dailyActivity: Map<string, number>, today = new Date()) {
  const activeDays = [...dailyActivity.values()].filter((n) => n > 0).length;

  let current = 0;
  const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  while ((dailyActivity.get(toDateKey(cursor)) ?? 0) > 0) {
    current += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return { current, activeDays };
}

/** Per-prayer breakdown for a single day, for the heatmap's day-detail panel. */
export function dayDetail(logs: QazaLogRow[], dateKey: string) {
  const totals: Partial<Record<PrayerKey, number>> = {};
  for (const log of logs) {
    if (log.log_date !== dateKey) continue;
    totals[log.prayer] = (totals[log.prayer] ?? 0) + log.delta;
  }
  return totals;
}
