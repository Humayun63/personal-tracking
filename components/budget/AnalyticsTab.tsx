import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  formatCurrency,
  monthTotals,
  spentByCategory,
  dailySpendingSeries,
  topExpenses,
  categoryStatuses,
} from "@/lib/budget/derive";
import type { BudgetExpense, MonthCategory } from "@/lib/budget/queries";

interface AnalyticsTabProps {
  categories: MonthCategory[];
  expenses: BudgetExpense[];
}

function formatDay(dateStr: string) {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}

export function AnalyticsTab({ categories, expenses }: AnalyticsTabProps) {
  const { totalBudget, totalSpent } = monthTotals(categories, expenses);
  const spentByCat = spentByCategory(expenses);
  const series = dailySpendingSeries(expenses);
  const maxDay = series.reduce((max, d) => (d[1] > max[1] ? d : max), ["", 0] as [string, number]);
  const biggest = expenses.reduce<BudgetExpense | null>(
    (max, e) => (!max || e.amount > max.amount ? e : max),
    null,
  );
  const maxSpark = Math.max(...series.map(([, amt]) => amt), 1);

  const categoryBars = categories
    .map((c) => ({ category: c, spent: spentByCat[c.category_id] ?? 0 }))
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);
  const maxCategorySpend = Math.max(...categoryBars.map((c) => c.spent), 1);

  const statuses = categoryStatuses(categories, spentByCat);
  const top5 = topExpenses(expenses, 5);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-text-2">Total Spent</p>
          <p className="mt-1 font-mono text-xl font-semibold text-danger">{formatCurrency(totalSpent)}</p>
          <p className="mt-1 text-xs text-text-2">
            {totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(1)}% of ${formatCurrency(totalBudget)}` : ""}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-text-2">Transactions</p>
          <p className="mt-1 font-mono text-xl font-semibold text-qaza">{expenses.length}</p>
          <p className="mt-1 text-xs text-text-2">
            {expenses.length > 0 ? `avg ${formatCurrency(totalSpent / expenses.length)} each` : ""}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-text-2">Highest Day</p>
          <p className="mt-1 font-mono text-xl font-semibold" style={{ color: "var(--warning)" }}>
            {formatCurrency(maxDay[1])}
          </p>
          <p className="mt-1 text-xs text-text-2">{maxDay[0] ? formatDay(maxDay[0]) : "—"}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-text-2">Biggest Spend</p>
          <p className="mt-1 font-mono text-xl font-semibold">{formatCurrency(biggest?.amount ?? 0)}</p>
          <p className="mt-1 truncate text-xs text-text-2">{biggest?.description ?? "—"}</p>
        </Card>
      </div>

      <Card>
        <p className="mb-2 text-xs uppercase tracking-wide text-text-2">Daily Spending</p>
        {series.length === 0 ? (
          <p className="py-4 text-center text-sm text-text-2">No data</p>
        ) : (
          <div className="flex h-11 items-end gap-[3px]">
            {series.map(([date, amt]) => (
              <div
                key={date}
                title={`${formatDay(date)}: ${formatCurrency(amt)}`}
                className="flex-1 rounded-t"
                style={{
                  height: `${Math.max((amt / maxSpark) * 100, 4)}%`,
                  background: amt > 5000 ? "var(--danger)" : amt > 2000 ? "var(--warning)" : "var(--qaza)",
                }}
              />
            ))}
          </div>
        )}
      </Card>

      <Card>
        <p className="mb-3 text-xs uppercase tracking-wide text-text-2">Category Breakdown</p>
        {categoryBars.length === 0 ? (
          <p className="py-4 text-center text-sm text-text-2">No data</p>
        ) : (
          <div className="flex flex-col gap-2">
            {categoryBars.map(({ category, spent }) => (
              <div key={category.id} className="flex items-center gap-2">
                <span className="w-24 shrink-0 truncate text-right text-xs text-text-2" title={category.name}>
                  {category.name}
                </span>
                <div className="flex-1">
                  <ProgressBar percent={(spent / maxCategorySpend) * 100} color={category.color} height={7} />
                </div>
                <span className="w-16 shrink-0 text-right text-xs tabular-nums text-text-2">
                  {formatCurrency(spent)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <p className="mb-2 text-xs uppercase tracking-wide text-text-2">Budget Status</p>
        <div className="flex flex-col divide-y divide-border">
          {statuses.map((s) => (
            <div key={s.category.id} className="flex items-center justify-between py-2 text-sm">
              <span>{s.category.name}</span>
              <span
                className="rounded-full px-2.5 py-1 font-mono text-xs font-medium"
                style={{
                  background: s.over ? "color-mix(in srgb, var(--danger) 12%, transparent)" : "color-mix(in srgb, var(--success) 12%, transparent)",
                  color: s.over ? "var(--danger)" : "var(--success)",
                }}
              >
                {s.over ? `+${formatCurrency(s.diff)} over` : `${formatCurrency(Math.abs(s.diff))} left`}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="mb-2 text-xs uppercase tracking-wide text-text-2">Top 5 Expenses</p>
        {top5.length === 0 ? (
          <p className="py-4 text-center text-sm text-text-2">No data</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {top5.map((e, i) => (
              <div key={e.id} className="flex items-center gap-3 py-2 text-sm">
                <span className="w-4 font-mono text-xs text-text-2">{i + 1}</span>
                <span className="flex-1">
                  {e.description}
                  <span className="block text-xs text-text-2">{formatDay(e.expense_date)}</span>
                </span>
                <span className="font-mono text-sm text-danger">{formatCurrency(e.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
