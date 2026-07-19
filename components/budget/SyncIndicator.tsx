"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { usePendingCount, useOfflineSync } from "@/lib/budget/useOfflineQueue";
import { flush } from "@/lib/budget/offline-queue";
import { useToast } from "@/components/ui/Toast";
import { SyncIcon } from "@/components/icons";

export function SyncIndicator() {
  useOfflineSync();
  const pending = usePendingCount();
  const router = useRouter();
  const [syncing, startTransition] = useTransition();
  const [spinning, setSpinning] = useState(false);
  const showToast = useToast();

  if (pending === 0) return null;

  function handleSyncNow() {
    setSpinning(true);
    startTransition(async () => {
      const synced = await flush();
      setSpinning(false);
      if (synced) router.refresh();
      showToast({
        message: synced ? "Synced" : "Still offline — will keep retrying",
      });
    });
  }

  return (
    <div className="mb-4 flex items-center justify-center gap-2 text-xs text-text-2">
      <span>
        {pending} {pending === 1 ? "expense" : "expenses"} will sync when you&apos;re back online
      </span>
      <button
        type="button"
        onClick={handleSyncNow}
        disabled={syncing || spinning}
        aria-label="Sync now"
        className="flex items-center gap-1 rounded-full border border-border px-2 py-1 font-medium text-text hover:bg-surface-2 disabled:opacity-60"
      >
        <SyncIcon className={`h-3.5 w-3.5 ${spinning ? "animate-spin" : ""}`} />
        Sync now
      </button>
    </div>
  );
}
