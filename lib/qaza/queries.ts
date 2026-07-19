import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ExclusionPeriod, PrayerKey } from "./calculate";

export interface QazaSettings {
  bulugh_date: string;
  qaza_end_date: string;
  include_witr: boolean;
  accent_color: string | null;
}

export async function getQazaSettings(userId: string): Promise<QazaSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("qaza_settings")
    .select("bulugh_date, qaza_end_date, include_witr, accent_color")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function getExclusionPeriods(userId: string): Promise<ExclusionPeriod[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("qaza_exclusion_periods")
    .select("start_date, end_date")
    .eq("user_id", userId)
    .order("start_date", { ascending: true });
  return data ?? [];
}

export interface QazaLogRow {
  id: string;
  prayer: PrayerKey;
  log_date: string;
  delta: number;
  created_at: string;
}

/** All logs for the user — used to derive per-prayer totals, the heatmap, and streaks. */
export async function getAllLogs(userId: string): Promise<QazaLogRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("qaza_logs")
    .select("id, prayer, log_date, delta, created_at")
    .eq("user_id", userId);
  return data ?? [];
}

export async function getRecentLogs(userId: string, limit = 150): Promise<QazaLogRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("qaza_logs")
    .select("id, prayer, log_date, delta, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
