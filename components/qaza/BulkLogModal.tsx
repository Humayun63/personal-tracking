"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { MinusIcon, PlusIcon } from "@/components/icons";
import type { PrayerKey } from "@/lib/qaza/calculate";

interface BulkLogModalProps {
  open: boolean;
  onClose: () => void;
  prayers: { key: PrayerKey; name: string; remaining: number }[];
  onSubmit: (prayer: PrayerKey, amount: number) => void;
}

const QUICK_AMOUNTS = [1, 5, 10, 30];

export function BulkLogModal({ open, onClose, prayers, onSubmit }: BulkLogModalProps) {
  const [prayerKey, setPrayerKey] = useState<PrayerKey>(prayers[0]?.key ?? "fajr");
  const [amount, setAmount] = useState(1);

  const prayer = prayers.find((p) => p.key === prayerKey) ?? prayers[0];

  function handleSubmit() {
    if (!prayer || amount <= 0) return;
    onSubmit(prayer.key, amount);
    setAmount(1);
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Log multiple">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="bulk-prayer" className="text-sm font-medium text-text-2">
            Prayer
          </label>
          <select
            id="bulk-prayer"
            value={prayerKey}
            onChange={(e) => setPrayerKey(e.target.value as PrayerKey)}
            className="h-12 rounded-xl border border-border bg-surface px-4 text-base"
          >
            {prayers.map((p) => (
              <option key={p.key} value={p.key}>
                {p.name} — {p.remaining.toLocaleString()} remaining
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setAmount((a) => Math.max(1, a - 1))}
            aria-label="Decrease amount"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border"
          >
            <MinusIcon />
          </button>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 1))}
            className="h-12 w-24 rounded-xl border border-border bg-surface text-center text-lg tabular-nums"
          />
          <button
            type="button"
            onClick={() => setAmount((a) => a + 1)}
            aria-label="Increase amount"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border"
          >
            <PlusIcon />
          </button>
        </div>

        <div className="flex justify-center gap-2">
          {QUICK_AMOUNTS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setAmount(n)}
              className={`rounded-full border px-3 py-1 text-sm ${
                amount === n ? "border-qaza bg-qaza-soft text-qaza" : "border-border text-text-2"
              }`}
            >
              +{n}
            </button>
          ))}
        </div>

        <Button onClick={handleSubmit} className="w-full">
          Log {amount} {prayer?.name}
        </Button>
      </div>
    </BottomSheet>
  );
}
