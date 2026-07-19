"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PrayerCard } from "./PrayerCard";
import { BulkLogModal } from "./BulkLogModal";
import { Heatmap } from "./Heatmap";
import { SyncIndicator } from "./SyncIndicator";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { SettingsIcon, HistoryIcon } from "@/components/icons";
import { activePrayers, type PrayerKey } from "@/lib/qaza/calculate";
import { computeStreak } from "@/lib/qaza/derive";
import { useQueueEntries } from "@/lib/qaza/useOfflineQueue";
import { enqueue, removeById } from "@/lib/qaza/offline-queue";
import { useToast } from "@/components/ui/Toast";
import type { QazaLogRow } from "@/lib/qaza/queries";

interface TrackerProps {
  userId: string;
  totalOwed: number;
  doneCounts: Record<PrayerKey, number>;
  dailyActivity: Record<string, number>;
  recentLogs: QazaLogRow[];
  includeWitr: boolean;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function Tracker({
  userId,
  totalOwed,
  doneCounts,
  dailyActivity,
  recentLogs,
  includeWitr,
}: TrackerProps) {
  const [bulkOpen, setBulkOpen] = useState(false);
  const pendingEntries = useQueueEntries();
  const showToast = useToast();
  const prayers = activePrayers(includeWitr);

  const effectiveDone = useMemo(() => {
    const merged = { ...doneCounts };
    for (const entry of pendingEntries) {
      merged[entry.prayer] = (merged[entry.prayer] ?? 0) + entry.delta;
    }
    return merged;
  }, [doneCounts, pendingEntries]);

  const effectiveDailyActivity = useMemo(() => {
    const merged = { ...dailyActivity };
    for (const entry of pendingEntries) {
      merged[entry.log_date] = (merged[entry.log_date] ?? 0) + entry.delta;
    }
    return merged;
  }, [dailyActivity, pendingEntries]);

  const streak = useMemo(() => {
    const map = new Map(Object.entries(effectiveDailyActivity));
    return computeStreak(map);
  }, [effectiveDailyActivity]);

  const overallDone = prayers.reduce((sum, p) => sum + (effectiveDone[p.key] ?? 0), 0);
  const overallTotal = totalOwed * prayers.length;
  const overallPercent = overallTotal > 0 ? (overallDone / overallTotal) * 100 : 0;

  async function log(prayer: PrayerKey, amount: number) {
    const id = await enqueue({ prayer, log_date: todayKey(), delta: amount });
    const label = prayers.find((p) => p.key === prayer)?.name ?? prayer;
    showToast({
      message: amount === 1 ? `${label} logged` : `Logged ${amount} ${label}`,
      actionLabel: "Undo",
      onAction: () => void removeById(id, userId),
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4 flex items-center justify-end">
        <Link
          href="/qaza/setup"
          aria-label="Qaza settings"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-text-2 hover:bg-surface-2"
        >
          <SettingsIcon />
        </Link>
      </div>

      <SyncIndicator />

      <Card className="mb-4">
        <p className="text-sm text-text-2">Overall Progress</p>
        <div className="mt-2">
          <ProgressBar percent={overallPercent} />
        </div>
        <p className="mt-2 text-sm tabular-nums text-text-2">
          {overallDone.toLocaleString()} of {overallTotal.toLocaleString()} completed
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {prayers.map((p) => (
          <PrayerCard
            key={p.key}
            name={p.name}
            done={effectiveDone[p.key] ?? 0}
            total={totalOwed}
            onLogOne={() => log(p.key, 1)}
          />
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="secondary" onClick={() => setBulkOpen(true)} className="flex-1">
          Log multiple…
        </Button>
        <Link
          href="/qaza/history"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-base font-medium hover:bg-surface-2"
        >
          <HistoryIcon className="h-5 w-5" /> View history
        </Link>
      </div>

      <Card className="mt-6">
        <p className="mb-3 text-sm font-medium">
          Daily activity
          <span className="ml-2 font-normal text-text-2">
            {streak.current > 0
              ? `${streak.current} days in a row · ${streak.activeDays} active days`
              : "Log today to start a streak"}
          </span>
        </p>
        <Heatmap dailyActivity={effectiveDailyActivity} logs={recentLogs} includeWitr={includeWitr} />
      </Card>

      <BulkLogModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        prayers={prayers.map((p) => ({
          key: p.key,
          name: p.name,
          remaining: Math.max(0, totalOwed - (effectiveDone[p.key] ?? 0)),
        }))}
        onSubmit={log}
      />
    </div>
  );
}
