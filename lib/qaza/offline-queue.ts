import { createClient } from "@/lib/supabase/client";
import type { PrayerKey } from "./calculate";

export interface QueueEntry {
  id: string;
  prayer: PrayerKey;
  log_date: string;
  delta: number;
  created_at: string;
}

const DB_NAME = "hearth-qaza-queue";
const STORE = "pending-logs";

let cache: QueueEntry[] = [];
let ready: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadCache(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDB();
  cache = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as QueueEntry[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
}

function ensureReady(): Promise<void> {
  if (!ready) ready = loadCache();
  return ready;
}

async function persist(entry: QueueEntry): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function evict(id: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function enqueue(entry: Omit<QueueEntry, "id" | "created_at"> & { id?: string }) {
  await ensureReady();
  const full: QueueEntry = {
    id: entry.id ?? crypto.randomUUID(),
    prayer: entry.prayer,
    log_date: entry.log_date,
    delta: entry.delta,
    created_at: new Date().toISOString(),
  };
  cache = [...cache, full];
  notify();
  await persist(full);
  void flush();
  void registerBackgroundSync();
  return full.id;
}

/** Best-effort: Chromium-only, and only wakes the service worker (see public/sw.js). */
async function registerBackgroundSync() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const syncCapable = registration as ServiceWorkerRegistration & {
      sync?: { register(tag: string): Promise<void> };
    };
    await syncCapable.sync?.register("qaza-sync");
  } catch {
    // Background Sync unsupported (Safari/Firefox) — the foreground listeners cover it.
  }
}

/** Removes a queued or already-synced log (used for the Undo toast action). */
export async function removeById(id: string, userId: string) {
  await ensureReady();
  const wasQueued = cache.some((e) => e.id === id);
  cache = cache.filter((e) => e.id !== id);
  notify();
  if (wasQueued) await evict(id);

  const supabase = createClient();
  await supabase.from("qaza_logs").delete().eq("id", id).eq("user_id", userId);
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getSnapshot() {
  return cache;
}

let flushing = false;

export async function flush(userId?: string) {
  await ensureReady();
  if (flushing || cache.length === 0) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  let uid = userId;
  const supabase = createClient();
  if (!uid) {
    const { data } = await supabase.auth.getUser();
    uid = data.user?.id;
  }
  if (!uid) return;

  flushing = true;
  try {
    for (const entry of [...cache]) {
      const { error } = await supabase.from("qaza_logs").upsert(
        {
          id: entry.id,
          user_id: uid,
          prayer: entry.prayer,
          log_date: entry.log_date,
          delta: entry.delta,
        },
        { onConflict: "id" },
      );
      if (error) break; // likely offline again — stop and retry later
      cache = cache.filter((e) => e.id !== entry.id);
      notify();
      await evict(entry.id);
    }
  } finally {
    flushing = false;
  }
}
