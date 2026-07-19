import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/user";
import { getMonths, getMonthByLabel, getMonthCategories, getExpenses } from "@/lib/budget/queries";
import { currentMonthLabel } from "@/lib/budget/derive";
import { ImportExportPanel } from "@/components/budget/ImportExportPanel";

export default async function ImportExportPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  const { month: monthParam } = await searchParams;
  const month = monthParam ?? currentMonthLabel();

  const months = await getMonths(user.id);
  const currentMonthRow = await getMonthByLabel(user.id, month);

  const allData = await Promise.all(
    months.map(async (m) => {
      const [categories, expenses] = await Promise.all([
        getMonthCategories(m.id),
        getExpenses(m.id),
      ]);
      return { month: m.month, categories, expenses };
    }),
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <ImportExportPanel
        month={month}
        monthId={currentMonthRow?.id ?? null}
        months={months.map((m) => m.month)}
        allData={allData}
      />
    </div>
  );
}
