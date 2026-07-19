import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/user";
import { getMonths, getMonthCategories, getExpenses } from "@/lib/budget/queries";
import { monthTotals, formatCurrency, formatMonthLabel, currentMonthLabel, statusColor } from "@/lib/budget/derive";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default async function BudgetMonthsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const months = await getMonths(user.id);
  const summaries = await Promise.all(
    months.map(async (m) => {
      const [categories, expenses] = await Promise.all([
        getMonthCategories(m.id),
        getExpenses(m.id),
      ]);
      return { ...m, ...monthTotals(categories, expenses) };
    }),
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex flex-col gap-3">
        {summaries.map((m) => {
          const pct = m.totalBudget > 0 ? (m.totalSpent / m.totalBudget) * 100 : 0;
          return (
            <Link key={m.id} href={`/budget?month=${m.month}`}>
              <Card className="transition-shadow hover:shadow-[var(--shadow-lg)]">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {formatMonthLabel(m.month)}
                    {m.month === currentMonthLabel() && (
                      <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-xs text-text-2">
                        Current
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: statusColor(pct) }}>
                    {Math.round(pct)}%
                  </span>
                </div>
                <p className="mt-1 font-mono text-sm tabular-nums text-text-2">
                  {formatCurrency(m.totalSpent)} / {formatCurrency(m.totalBudget)}
                </p>
                <div className="mt-2">
                  <ProgressBar percent={pct} color={statusColor(pct)} height={6} />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
