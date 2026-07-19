import { createClient } from "@/lib/supabase/client";

export interface QueueEntry {
  id: string;
  monthId: string;
  categoryId: string;
  description: string;
  amount: number;
  expenseDate: string;
  createdAt: string;
}

const DB_NAME = "hearth-budget-queue";
const STORE = "pending-expenses";

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

export async function enqueue(entry: Omit<QueueEntry, "id" | "createdAt"> & { id?: string }) {
  await ensureReady();
  const full: QueueEntry = {
    id: entry.id ?? crypto.randomUUID(),
    monthId: entry.monthId,
    categoryId: entry.categoryId,
    description: entry.description,
    amount: entry.amount,
    expenseDate: entry.expenseDate,
    createdAt: new Date().toISOString(),
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
    await syncCapable.sync?.register("budget-sync");
  } catch {
    // Background Sync unsupported (Safari/Firefox) — the foreground listeners cover it.
  }
}

/** True if this id is still queued locally (not yet synced to Supabase). */
export function isQueued(id: string): boolean {
  return cache.some((e) => e.id === id);
}

/** Removes a queued-but-unsynced expense (used when deleting before it syncs). */
export async function removeQueued(id: string) {
  await ensureReady();
  cache = cache.filter((e) => e.id !== id);
  notify();
  await evict(id);
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getSnapshot() {
  return cache;
}

let flushing = false;

/** Returns true if the queue is fully synced afterward (nothing left pending). */
export async function flush(userId?: string): Promise<boolean> {
  await ensureReady();
  if (cache.length === 0) return true;
  if (flushing) return false;
  if (typeof navigator !== "undefined" && !navigator.onLine) return false;

  let uid = userId;
  const supabase = createClient();
  if (!uid) {
    const { data } = await supabase.auth.getUser();
    uid = data.user?.id;
  }
  if (!uid) return false;

  flushing = true;
  try {
    for (const entry of [...cache]) {
      const { error } = await supabase.from("budget_expenses").upsert(
        {
          id: entry.id,
          user_id: uid,
          month_id: entry.monthId,
          category_id: entry.categoryId,
          description: entry.description,
          amount: entry.amount,
          expense_date: entry.expenseDate,
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
  return cache.length === 0;
}
