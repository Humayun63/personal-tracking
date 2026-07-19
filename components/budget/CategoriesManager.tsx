"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChevronUpIcon, ChevronDownIcon, PlusIcon } from "@/components/icons";
import { CategorySheet } from "./CategorySheet";
import { reorderCategories } from "@/app/(app)/budget/actions";
import { formatMonthLabel } from "@/lib/budget/derive";
import type { MonthCategory } from "@/lib/budget/queries";

interface CategoriesManagerProps {
  month: string;
  monthId: string;
  categories: MonthCategory[];
}

export function CategoriesManager({ month, monthId, categories: initial }: CategoriesManagerProps) {
  const [categories, setCategories] = useState(initial);
  const [prevInitial, setPrevInitial] = useState(initial);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<MonthCategory | null>(null);
  const [, startTransition] = useTransition();

  // Re-sync when the server component re-fetches after a revalidated action
  // (add/edit/delete) — adjusting state during render (not in an effect) per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setCategories(initial);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next);
    startTransition(() =>
      reorderCategories({ monthId, orderedCategoryIds: next.map((c) => c.category_id) }),
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-text-2">
          Budgets shown for {formatMonthLabel(month)}. Reorder to change the order in Add & By
          Category.
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            setEditing(null);
            setSheetOpen(true);
          }}
          className="h-11 shrink-0 px-4"
        >
          <PlusIcon className="h-4 w-4" /> Add
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {categories.map((cat, i) => (
          <Card key={cat.id} className="flex items-center gap-3">
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={`Move ${cat.name} up`}
                className="flex h-5.5 w-11 items-center justify-center text-text-2 disabled:opacity-30"
              >
                <ChevronUpIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === categories.length - 1}
                aria-label={`Move ${cat.name} down`}
                className="flex h-5.5 w-11 items-center justify-center text-text-2 disabled:opacity-30"
              >
                <ChevronDownIcon className="h-4 w-4" />
              </button>
            </div>
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: cat.color }} />
            <span className="flex-1 font-medium">{cat.name}</span>
            <span className="text-sm tabular-nums text-text-2">৳{cat.budget}/mo</span>
            <button
              type="button"
              onClick={() => {
                setEditing(cat);
                setSheetOpen(true);
              }}
              className="text-sm font-medium text-qaza"
            >
              Edit
            </button>
          </Card>
        ))}
      </div>

      <CategorySheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        monthId={monthId}
        editing={editing}
        otherCategories={categories.filter((c) => c.category_id !== editing?.category_id)}
      />
    </div>
  );
}
