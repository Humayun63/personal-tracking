import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/user";
import { getQazaSettings, getExclusionPeriods } from "@/lib/qaza/queries";
import { SetupWizard } from "@/components/qaza/SetupWizard";

export default async function QazaSetupPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const [settings, exclusions] = await Promise.all([
    getQazaSettings(user.id),
    getExclusionPeriods(user.id),
  ]);

  return (
    <div className="px-4 py-8">
      <SetupWizard
        initial={
          settings
            ? {
                bulughDate: settings.bulugh_date,
                qazaEndDate: settings.qaza_end_date,
                includeWitr: settings.include_witr,
                exclusions,
              }
            : undefined
        }
      />
    </div>
  );
}
