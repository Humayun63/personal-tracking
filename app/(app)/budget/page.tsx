import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/user";
import { getMonths, getMonthByLabel, getMonthCategories, getExpenses } from "@/lib/budget/queries";
import { currentMonthLabel } from "@/lib/budget/derive";
import { BudgetHome } from "@/components/budget/BudgetHome";
import { NewMonthSetup } from "@/components/budget/NewMonthSetup";

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  const { month: monthParam } = await searchParams;
  const month = monthParam ?? currentMonthLabel();

  const allMonths = await getMonths(user.id);
  const monthRow = await getMonthByLabel(user.id, month);

  if (!monthRow) {
    const mostRecent = allMonths[0];
    return (
      <NewMonthSetup
        month={month}
        sourceMonthId={mostRecent?.id}
        sourceLabel={mostRecent?.month}
      />
    );
  }

  const [categories, expenses] = await Promise.all([
    getMonthCategories(monthRow.id),
    getExpenses(monthRow.id),
  ]);

  return (
    <BudgetHome
      month={month}
      monthId={monthRow.id}
      categories={categories}
      expenses={expenses}
      allMonths={allMonths}
      isCurrentMonth={month === currentMonthLabel()}
    />
  );
}
