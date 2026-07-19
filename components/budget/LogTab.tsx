"use client";

import { useMemo, useState, useTransition } from "react";
import { TrashIcon } from "@/components/icons";
import { formatCurrency } from "@/lib/budget/derive";
import { deleteExpense } from "@/app/(app)/budget/actions";
import { isQueued, removeQueued } from "@/lib/budget/offline-queue";
import type { BudgetExpense, MonthCategory } from "@/lib/budget/queries";

interface LogTabProps {
  categories: MonthCategory[];
  expenses: BudgetExpense[];
  editable: boolean;
}

export function LogTab({ categories, expenses, editable }: LogTabProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [, startTransition] = useTransition();

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.category_id, c])),
    [categories],
  );

  const filtered = expenses.filter((e) => {
    const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || e.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  function handleDelete(id: string) {
    // Not-yet-synced expenses only exist in the local queue — remove there
    // instead of calling the server action, which wouldn't find the row.
    startTransition(() => (isQueued(id) ? removeQueued(id) : deleteExpense(id)));
  }

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by description"
          className="h-11 flex-1 rounded-xl border border-border bg-surface px-3 text-sm"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-11 rounded-xl border border-border bg-surface px-2 text-sm"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-2">No expenses match your filter.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
          {filtered.map((e) => {
            const cat = categoryById.get(e.category_id);
            return (
              <div key={e.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: cat?.color ?? "#6E675E" }}
                />
                <span className="flex-1">
                  {e.description}
                  <span className="block text-xs text-text-2">
                    {cat?.name ?? "Unknown"} · {e.expense_date}
                  </span>
                </span>
                <span className="tabular-nums">{formatCurrency(e.amount)}</span>
                {editable && (
                  <button
                    type="button"
                    aria-label="Delete expense"
                    onClick={() => handleDelete(e.id)}
                    className="text-text-2 hover:text-danger"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
