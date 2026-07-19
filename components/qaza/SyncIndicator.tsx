"use client";

import { usePendingCount, useOfflineSync } from "@/lib/qaza/useOfflineQueue";

export function SyncIndicator() {
  useOfflineSync();
  const pending = usePendingCount();

  if (pending === 0) return null;

  return (
    <p className="mb-4 text-center text-xs text-text-2">
      {pending} {pending === 1 ? "log" : "logs"} will sync when you&apos;re back online
    </p>
  );
}
