import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/user";
import { getQazaSettings, getExclusionPeriods, getAllLogs } from "@/lib/qaza/queries";
import { totalDaysOwed } from "@/lib/qaza/calculate";
import { computePrayerTotals, computeDailyActivity } from "@/lib/qaza/derive";
import { Tracker } from "@/components/qaza/Tracker";

export default async function QazaPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const settings = await getQazaSettings(user.id);
  if (!settings) redirect("/qaza/setup");

  const [exclusions, logs] = await Promise.all([
    getExclusionPeriods(user.id),
    getAllLogs(user.id),
  ]);

  const totalOwed = totalDaysOwed(settings.bulugh_date, settings.qaza_end_date, exclusions);
  const doneCounts = computePrayerTotals(logs);
  const dailyActivity = Object.fromEntries(computeDailyActivity(logs));

  return (
    <Tracker
      userId={user.id}
      totalOwed={totalOwed}
      doneCounts={doneCounts}
      dailyActivity={dailyActivity}
      recentLogs={logs}
      includeWitr={settings.include_witr}
    />
  );
}
