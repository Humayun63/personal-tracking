import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/user";
import { getMonthByLabel, getMonthCategories } from "@/lib/budget/queries";
import { currentMonthLabel } from "@/lib/budget/derive";
import { CategoriesManager } from "@/components/budget/CategoriesManager";

export default async function BudgetCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  const { month: monthParam } = await searchParams;
  const month = monthParam ?? currentMonthLabel();

  const monthRow = await getMonthByLabel(user.id, month);
  if (!monthRow) redirect(`/budget?month=${month}`);

  const categories = await getMonthCategories(monthRow.id);

  return <CategoriesManager month={month} monthId={monthRow.id} categories={categories} />;
}
