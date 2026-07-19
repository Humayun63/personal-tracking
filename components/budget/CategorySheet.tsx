"use client";

import { useState, useTransition } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { addCategory, updateCategory, deleteCategory } from "@/app/(app)/budget/actions";
import type { MonthCategory } from "@/lib/budget/queries";

const SWATCHES = [
  "#B4553E", "#5F8D7E", "#4B4FA6", "#C08A2D", "#B07B3A",
  "#8A5BA6", "#2A8C82", "#3E8E5A", "#5A6B8C", "#6E675E",
];

interface CategorySheetProps {
  open: boolean;
  onClose: () => void;
  monthId: string;
  editing: MonthCategory | null;
  otherCategories: MonthCategory[];
}

export function CategorySheet({ open, onClose, monthId, editing, otherCategories }: CategorySheetProps) {
  const [name, setName] = useState(editing?.name ?? "");
  const [color, setColor] = useState(editing?.color ?? SWATCHES[0]);
  const [budget, setBudget] = useState(String(editing?.budget ?? ""));
  const [nameError, setNameError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [reassignTo, setReassignTo] = useState(otherCategories[0]?.category_id ?? "");
  const [pending, startTransition] = useTransition();

  function reset() {
    setName(editing?.name ?? "");
    setColor(editing?.color ?? SWATCHES[0]);
    setBudget(String(editing?.budget ?? ""));
    setNameError("");
    setConfirmingDelete(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSave() {
    if (!name.trim()) {
      setNameError("Give the category a name");
      return;
    }
    startTransition(async () => {
      const budgetNum = Number(budget) || 0;
      if (editing) {
        await updateCategory({ categoryId: editing.category_id, monthId, name: name.trim(), color, budget: budgetNum });
      } else {
        await addCategory({ monthId, name: name.trim(), color, budget: budgetNum });
      }
      handleClose();
    });
  }

  function handleDelete() {
    if (!editing) return;
    startTransition(async () => {
      await deleteCategory({ categoryId: editing.category_id, reassignTo: reassignTo || undefined });
      handleClose();
    });
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title={editing ? "Edit category" : "Add category"}>
      {confirmingDelete ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm">Delete this category?</p>
          {otherCategories.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reassign" className="text-sm font-medium text-text-2">
                Reassign those expenses to
              </label>
              <select
                id="reassign"
                value={reassignTo}
                onChange={(e) => setReassignTo(e.target.value)}
                className="h-12 rounded-xl border border-border bg-surface px-4 text-base"
              >
                {otherCategories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setConfirmingDelete(false)} className="flex-1">
              Keep
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={pending} className="flex-1">
              {pending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cat-name" className="text-sm font-medium text-text-2">
              Name
            </label>
            <input
              id="cat-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              placeholder="e.g. Groceries"
              className="h-12 rounded-xl border border-border bg-surface px-4 text-base"
            />
            {nameError && <p className="text-sm text-danger">{nameError}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="cat-budget" className="text-sm font-medium text-text-2">
              Budget for this month
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-2">
                ৳
              </span>
              <input
                id="cat-budget"
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="h-12 w-full rounded-xl border border-border bg-surface pl-8 pr-4 text-base"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-text-2">Colour tag</p>
            <div className="flex flex-wrap gap-2">
              {SWATCHES.map((sw) => (
                <button
                  key={sw}
                  type="button"
                  onClick={() => setColor(sw)}
                  aria-label={`Colour ${sw}`}
                  className="h-8 w-8 rounded-full"
                  style={{
                    background: sw,
                    outline: color === sw ? `3px solid ${sw}` : undefined,
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </div>

          <Button onClick={handleSave} disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>

          {editing && (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-sm text-danger"
            >
              Delete category
            </button>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
