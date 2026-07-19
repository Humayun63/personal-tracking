"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency } from "@/lib/budget/derive";
import type { MonthCategory, BudgetExpense } from "@/lib/budget/queries";

interface ByCategoryTabProps {
  categories: MonthCategory[];
  expenses: BudgetExpense[];
  month: string;
}

export function ByCategoryTab({ categories, expenses, month }: ByCategoryTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Link href={`/budget/categories?month=${month}`} className="text-sm text-qaza">
          Edit categories
        </Link>
      </div>

      {categories.map((cat) => {
        const catExpenses = expenses.filter((e) => e.category_id === cat.category_id);
        const spent = catExpenses.reduce((sum, e) => sum + e.amount, 0);
        const pct = cat.budget > 0 ? (spent / cat.budget) * 100 : 0;
        const expanded = expandedId === cat.category_id;

        return (
          <Card key={cat.id} className="cursor-pointer" onClick={() => setExpandedId(expanded ? null : cat.category_id)}>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: cat.color }} />
              <span className="flex-1 font-medium">{cat.name}</span>
              <span className="text-sm tabular-nums text-text-2">
                {formatCurrency(spent)} / {formatCurrency(cat.budget)}
              </span>
            </div>
            <div className="mt-2">
              <ProgressBar percent={pct} color={cat.color} height={8} />
            </div>

            {expanded && (
              <div className="mt-3 flex flex-col divide-y divide-border border-t border-border pt-2" onClick={(e) => e.stopPropagation()}>
                {catExpenses.length === 0 ? (
                  <p className="py-2 text-sm text-text-2">No expenses logged in this category yet.</p>
                ) : (
                  catExpenses.map((e) => (
                    <div key={e.id} className="flex items-center justify-between py-2 text-sm">
                      <span>{e.description}</span>
                      <span className="tabular-nums">{formatCurrency(e.amount)}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
