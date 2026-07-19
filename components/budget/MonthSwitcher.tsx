"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, MoreIcon } from "@/components/icons";
import { previousMonth, nextMonth, formatMonthLabel, currentMonthLabel } from "@/lib/budget/derive";
import { createMonth } from "@/app/(app)/budget/actions";
import type { BudgetMonth } from "@/lib/budget/queries";

interface MonthSwitcherProps {
  month: string;
  monthId: string;
  allMonths: BudgetMonth[];
}

export function MonthSwitcher({ month, monthId, allMonths }: MonthSwitcherProps) {
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  function go(target: string) {
    router.push(`/budget?month=${target}`);
  }

  function handleDuplicate() {
    setMenuOpen(false);
    const target = window.prompt("Duplicate this month's categories to which month? (YYYY-MM)");
    if (!target || !/^\d{4}-\d{2}$/.test(target)) return;
    void createMonth({ month: target, copyFromMonthId: monthId });
  }

  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={() => go(previousMonth(month))}
        aria-label="Previous month"
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-border"
      >
        <ChevronLeftIcon />
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          className="rounded-xl border border-border px-4 py-2 text-sm font-semibold"
        >
          {formatMonthLabel(month)}
        </button>
        {pickerOpen && (
          <div className="absolute left-1/2 z-10 mt-2 w-56 -translate-x-1/2 rounded-xl border border-border bg-surface p-1 shadow-[var(--shadow-lg)]">
            {allMonths.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setPickerOpen(false);
                  go(m.month);
                }}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2 ${
                  m.month === month ? "font-semibold" : ""
                }`}
              >
                {formatMonthLabel(m.month)}
                {m.month === currentMonthLabel() ? " · Current" : ""}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setPickerOpen(false);
                go(nextMonth(allMonths[0]?.month ?? month));
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-qaza hover:bg-surface-2"
            >
              + Create next month
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => go(nextMonth(month))}
          aria-label="Next month"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border"
        >
          <ChevronRightIcon />
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More month actions"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border"
          >
            <MoreIcon />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-border bg-surface p-1 shadow-[var(--shadow-lg)]">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  router.push(`/budget/categories?month=${month}`);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2"
              >
                Edit this month&apos;s categories
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  router.push(`/budget/import-export?month=${month}`);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2"
              >
                Export this month
              </button>
              <button
                type="button"
                onClick={handleDuplicate}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2"
              >
                Duplicate to new month
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
