import { EmptyState } from "@/components/ui/EmptyState";
import { HistoryIcon } from "@/components/icons";
import { PRAYERS, type PrayerKey } from "@/lib/qaza/calculate";
import type { QazaLogRow } from "@/lib/qaza/queries";

const PRAYER_NAMES = Object.fromEntries(PRAYERS.map((p) => [p.key, p.name])) as Record<
  PrayerKey,
  string
>;

function dayLabel(dateKey: string) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (dateKey === today) return "Today";
  if (dateKey === yesterday) return "Yesterday";
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function HistoryList({ logs }: { logs: QazaLogRow[] }) {
  if (logs.length === 0) {
    return (
      <EmptyState
        icon={<HistoryIcon />}
        title="Nothing logged yet"
        description="When you log a prayer, it'll appear here so you can look back."
      />
    );
  }

  const sorted = [...logs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const groups = new Map<string, QazaLogRow[]>();
  for (const log of sorted) {
    const key = log.created_at.slice(0, 10);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(log);
  }

  return (
    <div className="flex flex-col gap-6">
      {[...groups.entries()].map(([dateKey, entries]) => (
        <div key={dateKey}>
          <p className="mb-2 text-sm font-medium text-text-2">{dayLabel(dateKey)}</p>
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
            {entries.map((log) => (
              <div key={log.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span>
                  {PRAYER_NAMES[log.prayer]} {log.delta > 0 ? "+" : ""}
                  {log.delta}
                </span>
                <span className="text-text-2">{timeLabel(log.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
