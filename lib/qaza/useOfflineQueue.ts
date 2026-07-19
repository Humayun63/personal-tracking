"use client";

import { useSyncExternalStore, useEffect } from "react";
import { subscribe, getSnapshot, flush } from "./offline-queue";

/** Queued-but-not-yet-synced log entries, e.g. to fold into optimistic totals. */
export function useQueueEntries() {
  return useSyncExternalStore(subscribe, getSnapshot, () => []);
}

/** Pending (unsynced) log count — drives the "will sync" indicator. */
export function usePendingCount() {
  return useQueueEntries().length;
}

/**
 * Wires up all the ways a flush can be triggered: immediately on mount, on
 * reconnect, periodically while something is pending, when the tab regains
 * focus, and when the service worker wakes up from a Background Sync event
 * (Chromium only — the SW just asks any open page to flush; see public/sw.js).
 */
export function useOfflineSync() {
  useEffect(() => {
    void flush();

    const onOnline = () => void flush();
    const onVisible = () => {
      if (document.visibilityState === "visible") void flush();
    };
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "hearth-sync") void flush();
    };

    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);
    navigator.serviceWorker?.addEventListener("message", onMessage);
    const interval = setInterval(() => void flush(), 20_000);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
      navigator.serviceWorker?.removeEventListener("message", onMessage);
      clearInterval(interval);
    };
  }, []);
}
