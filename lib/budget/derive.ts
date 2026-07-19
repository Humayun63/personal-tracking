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
