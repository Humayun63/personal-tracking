"use client";

import { useEffect } from "react";

/**
 * Registered globally (root layout) rather than only from Qaza/Budget, so
 * every page you visit gets cached for offline reuse, not just the two
 * modules that also happen to have an offline write-queue.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
