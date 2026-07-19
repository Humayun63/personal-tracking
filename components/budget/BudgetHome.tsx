"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { MonthSwitcher } from "./MonthSwitcher";
import { BalanceCard } from "./BalanceCard";
import { AddExpenseForm } from "./AddExpenseForm";
import { ByCategoryTab } from "./ByCategoryTab";
import { LogTab } from "./LogTab";
import { monthTotals, formatCurrency } from "@/lib/budget/derive";
import type { MonthCategory, BudgetExpense, BudgetMonth } from "@/lib/budget/queries";

type Tab = "add" | "category" | "log";

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
  expenses,
  allMonths,
  isCurrentMonth,
}: BudgetHomeProps) {
  const [tab, setTab] = useState<Tab>("add");
  const [editingPast, setEditingPast] = useState(false);
  const editable = isCurrentMonth || editingPast;

  const { totalBudget, totalSpent } = monthTotals(categories, expenses);

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

      <BalanceCard totalBudget={totalBudget} totalSpent={totalSpent} />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="text-sm text-text-2">Total Spent</p>
          <p className="font-mono text-lg font-semibold tabular-nums">{formatCurrency(totalSpent)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-text-2">Total Budget</p>
          <p className="font-mono text-lg font-semibold tabular-nums">{formatCurrency(totalBudget)}</p>
        </Card>
      </div>

      <div className="mt-4 flex gap-1 rounded-xl border border-border bg-surface-2 p-1">
        {(["add", "category", "log"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${
              tab === t ? "bg-surface shadow-[var(--shadow)]" : "text-text-2"
            }`}
          >
            {t === "add" ? "Add Expense" : t === "category" ? "By Category" : "Log"}
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
        {tab === "log" && (
          <LogTab categories={categories} expenses={expenses} editable={editable} />
        )}
      </div>
    </div>
  );
}
