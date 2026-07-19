import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/user";
import { getRecentLogs } from "@/lib/qaza/queries";
import { HistoryList } from "@/components/qaza/HistoryList";

export default async function QazaHistoryPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const logs = await getRecentLogs(user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <HistoryList logs={logs} />
    </div>
  );
}
