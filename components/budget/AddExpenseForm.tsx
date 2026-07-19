"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { addExpense } from "@/app/(app)/budget/actions";
import type { MonthCategory } from "@/lib/budget/queries";

interface AddExpenseFormProps {
  monthId: string;
  categories: MonthCategory[];
  editable: boolean;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function AddExpenseForm({ monthId, categories, editable }: AddExpenseFormProps) {
  const [categoryId, setCategoryId] = useState(categories[0]?.category_id ?? "");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  if (!editable) {
    return (
      <p className="rounded-xl border border-border p-4 text-sm text-text-2">
        This is a past month. Tap <span className="font-medium text-text">Edit</span> above to
        add or correct expenses.
      </p>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!categoryId || !amountNum || amountNum <= 0) {
      showToast({ message: "Enter a category and amount." });
      return;
    }
    startTransition(async () => {
      await addExpense({
        monthId,
        categoryId,
        description: description.trim() || "Expense",
        amount: amountNum,
        expenseDate: todayKey(),
      });
      setDescription("");
      setAmount("");
      showToast({ message: "Expense added" });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="expense-category" className="text-sm font-medium text-text-2">
          Category
        </label>
        <select
          id="expense-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="h-12 rounded-xl border border-border bg-surface px-4 text-base"
        >
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="expense-desc" className="text-sm font-medium text-text-2">
          Description
        </label>
        <input
          id="expense-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Weekly bazar"
          className="h-12 rounded-xl border border-border bg-surface px-4 text-base"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="expense-amount" className="text-sm font-medium text-text-2">
          Amount
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-2">
            ৳
          </span>
          <input
            id="expense-amount"
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-12 w-full rounded-xl border border-border bg-surface pl-8 pr-4 text-base"
          />
        </div>
      </div>

      <Button type="submit" disabled={pending || categories.length === 0} className="mt-1">
        {pending ? "Adding…" : "Add expense"}
      </Button>
    </form>
  );
}
