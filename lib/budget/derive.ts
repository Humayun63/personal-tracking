import type { BudgetExpense, MonthCategory } from "./queries";

export function spentByCategory(expenses: BudgetExpense[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const e of expenses) {
    map[e.category_id] = (map[e.category_id] ?? 0) + e.amount;
  }
  return map;
}

export function monthTotals(categories: MonthCategory[], expenses: BudgetExpense[]) {
  const totalBudget = categories.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  return { totalBudget, totalSpent, pct, remaining: totalBudget - totalSpent };
}

export function statusColor(pct: number) {
  if (pct > 100) return "var(--danger)";
  if (pct >= 70) return "var(--warning)";
  return "var(--success)";
}

/** Previous calendar month label for a given YYYY-MM string. */
export function previousMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 - 1, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function nextMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + 1, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function currentMonthLabel(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const CURRENCY = "৳";

export function formatCurrency(amount: number): string {
  return `${CURRENCY}${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Spending pace for the month: daily average so far, days left, and the
 * daily rate needed for the rest of the month to stay within budget. */
export function paceStats(month: string, totalBudget: number, totalSpent: number) {
  const total = daysInMonth(month);
  const isCurrentMonth = month === currentMonthLabel();
  const now = new Date();
  const daysPassed = isCurrentMonth ? now.getUTCDate() : total;
  const daysLeft = isCurrentMonth ? total - now.getUTCDate() : 0;
  const dailyAvg = daysPassed > 0 ? totalSpent / daysPassed : 0;
  const remaining = totalBudget - totalSpent;
  const neededPerDay = daysLeft > 0 ? remaining / daysLeft : 0;
  return { daysPassed, daysLeft, dailyAvg, neededPerDay, isCurrentMonth, remaining };
}

/** Spending grouped by calendar date, ascending — for the daily sparkline. */
export function dailySpendingSeries(expenses: BudgetExpense[]) {
  const byDate = new Map<string, number>();
  for (const e of expenses) {
    byDate.set(e.expense_date, (byDate.get(e.expense_date) ?? 0) + e.amount);
  }
  return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function topExpenses(expenses: BudgetExpense[], n = 5) {
  return [...expenses].sort((a, b) => b.amount - a.amount).slice(0, n);
}

export interface CategoryStatus {
  category: MonthCategory;
  spent: number;
  diff: number;
  over: boolean;
}

export function categoryStatuses(
  categories: MonthCategory[],
  spentByCat: Record<string, number>,
): CategoryStatus[] {
  return categories.map((c) => {
    const spent = spentByCat[c.category_id] ?? 0;
    return { category: c, spent, diff: spent - c.budget, over: spent > c.budget };
  });
}
