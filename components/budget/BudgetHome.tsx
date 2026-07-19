"use client";

import { useMemo, useState } from "react";
import { MonthSwitcher } from "./MonthSwitcher";
import { BalanceCard } from "./BalanceCard";
import { AlertBanner } from "./AlertBanner";
import { StatsRow } from "./StatsRow";
import { AddExpenseForm } from "./AddExpenseForm";
import { ByCategoryTab } from "./ByCategoryTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { LogTab } from "./LogTab";
import { SyncIndicator } from "./SyncIndicator";
import { useQueueEntries } from "@/lib/budget/useOfflineQueue";
import { monthTotals, paceStats } from "@/lib/budget/derive";
import type { MonthCategory, BudgetExpense, BudgetMonth } from "@/lib/budget/queries";

type Tab = "add" | "category" | "analytics" | "log";

const TAB_LABELS: Record<Tab, string> = {
  add: "Add Expense",
  category: "By Category",
  analytics: "Analytics",
  log: "Log",
};

interface BudgetHomeProps {
  month: string;
  monthId: string;
  categories: MonthCategory[];
  expenses: BudgetExpense[];
  allMonths: BudgetMonth[];
  isCurrentMonth: boolean;
}

export function BudgetHome({
  month,
  monthId,
  categories,
  expenses: serverExpenses,
  allMonths,
  isCurrentMonth,
}: BudgetHomeProps) {
  const [tab, setTab] = useState<Tab>("add");
  const [editingPast, setEditingPast] = useState(false);
  const editable = isCurrentMonth || editingPast;

  const pendingEntries = useQueueEntries();
  const expenses = useMemo(() => {
    const pendingForMonth = pendingEntries
      .filter((e) => e.monthId === monthId)
      .map((e) => ({
        id: e.id,
        category_id: e.categoryId,
        description: e.description,
        amount: e.amount,
        expense_date: e.expenseDate,
        created_at: e.createdAt,
      }));
    return [...pendingForMonth, ...serverExpenses];
  }, [serverExpenses, pendingEntries, monthId]);

  const { totalBudget, totalSpent } = monthTotals(categories, expenses);
  const pace = paceStats(month, totalBudget, totalSpent);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <MonthSwitcher month={month} monthId={monthId} allMonths={allMonths} />

      {!isCurrentMonth && (
        <div
          className={`mb-4 flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm ${
            editingPast ? "border-budget bg-budget-soft" : "border-border text-text-2"
          }`}
        >
          <span>{editingPast ? "Editing a past month" : "Viewing a past month · read-only"}</span>
          <button
            type="button"
            onClick={() => setEditingPast((v) => !v)}
            className="font-medium text-qaza"
          >
            {editingPast ? "Done" : "Edit"}
          </button>
        </div>
      )}

      <SyncIndicator />

      <AlertBanner
        remaining={pace.remaining}
        totalBudget={totalBudget}
        daysLeft={pace.daysLeft}
        neededPerDay={pace.neededPerDay}
      />

      <BalanceCard totalBudget={totalBudget} totalSpent={totalSpent} />

      <div className="mt-4">
        <StatsRow
          totalSpent={totalSpent}
          totalBudget={totalBudget}
          dailyAvg={pace.dailyAvg}
          daysPassed={pace.daysPassed}
          daysLeft={pace.daysLeft}
          neededPerDay={pace.neededPerDay}
          isCurrentMonth={pace.isCurrentMonth}
        />
      </div>

      <div className="mt-4 flex gap-1 rounded-xl border border-border bg-surface-2 p-1">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-xs font-medium sm:text-sm ${
              tab === t ? "bg-surface shadow-[var(--shadow)]" : "text-text-2"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "add" && (
          <AddExpenseForm monthId={monthId} categories={categories} editable={editable} />
        )}
        {tab === "category" && (
          <ByCategoryTab categories={categories} expenses={expenses} month={month} />
        )}
        {tab === "analytics" && <AnalyticsTab categories={categories} expenses={expenses} />}
        {tab === "log" && (
          <LogTab categories={categories} expenses={expenses} editable={editable} />
        )}
      </div>
    </div>
  );
}
