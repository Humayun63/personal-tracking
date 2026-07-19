"use client";

import { useMemo, useState } from "react";
import { dayDetail } from "@/lib/qaza/derive";
import { activePrayers } from "@/lib/qaza/calculate";
import type { QazaLogRow } from "@/lib/qaza/queries";

interface HeatmapProps {
  dailyActivity: Record<string, number>;
  logs: QazaLogRow[];
  includeWitr: boolean;
}

const WEEKS = 26;
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function level(count: number) {
  if (count <= 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}

const LEVEL_OPACITY = [0, 0.3, 0.52, 0.74, 1];

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function Heatmap({ dailyActivity, logs, includeWitr }: HeatmapProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const totalDays = WEEKS * 7;
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - (totalDays - 1) - today.getUTCDay());

    const days: { key: string; date: Date; count: number }[] = [];
    for (let i = 0; i < totalDays + today.getUTCDay(); i++) {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      const key = dateKey(d);
      days.push({ key, date: d, count: dailyActivity[key] ?? 0 });
    }

    const weeks: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    const monthLabels = weeks.map((week) => {
      const first = week[0].date;
      return first.getUTCDate() <= 7 ? MONTH_NAMES[first.getUTCMonth()] : "";
    });

    return { weeks, monthLabels };
  }, [dailyActivity]);

  const detail = selected ? dayDetail(logs, selected) : null;
  const prayers = activePrayers(includeWitr);

  return (
    <div>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            <span className="block h-3 text-[10px] text-text-2">{monthLabels[wi]}</span>
            {week.map((day) => (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelected(day.key === selected ? null : day.key)}
                aria-label={`${day.key}: ${day.count} logged`}
                className="h-3 w-3 rounded-[2px]"
                style={{
                  background: "var(--qaza)",
                  opacity: LEVEL_OPACITY[level(day.count)],
                  outline: day.key === selected ? "2px solid var(--gold)" : undefined,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-1 text-[10px] text-text-2">
        <span>Less</span>
        {LEVEL_OPACITY.map((op, i) => (
          <span key={i} className="h-3 w-3 rounded-[2px]" style={{ background: "var(--qaza)", opacity: op }} />
        ))}
        <span>More</span>
      </div>

      {selected && detail && (
        <div className="mt-4 rounded-xl border border-border p-4">
          <p className="mb-2 text-sm font-medium">{selected}</p>
          <div className="flex flex-col gap-1">
            {prayers.map((p) => (
              <div key={p.key} className="flex items-center justify-between text-sm">
                <span className="text-text-2">{p.name}</span>
                <span className={detail[p.key] ? "font-medium" : "text-text-2"}>
                  {detail[p.key] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
