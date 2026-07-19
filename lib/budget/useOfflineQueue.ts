"use client";

import { useSyncExternalStore, useEffect } from "react";
import { useRouter } from "next/navigation";
import { subscribe, getSnapshot, flush } from "./offline-queue";

/** Queued-but-not-yet-synced expenses, e.g. to fold into optimistic totals/lists. */
export function useQueueEntries() {
  return useSyncExternalStore(subscribe, getSnapshot, () => []);
}

/** Pending (unsynced) expense count — drives the "will sync" indicator. */
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
  const router = useRouter();

  useEffect(() => {
    // A background flush removes entries from the queue once Supabase has
    // them, but the server-fetched expenses on this page were read before
    // that — without a refresh, a synced entry would vanish from view the
    // moment it drops out of the optimistic merge, until the next navigation.
    const flushAndRefresh = async () => {
      const before = getSnapshot().length;
      await flush();
      if (getSnapshot().length !== before) router.refresh();
    };

    void flushAndRefresh();

    const onOnline = () => void flushAndRefresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") void flushAndRefresh();
    };
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "hearth-sync") void flushAndRefresh();
    };

    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);
    navigator.serviceWorker?.addEventListener("message", onMessage);
    const interval = setInterval(() => void flushAndRefresh(), 20_000);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
      navigator.serviceWorker?.removeEventListener("message", onMessage);
      clearInterval(interval);
    };
  }, [router]);
}
