"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatMonthLabel } from "@/lib/budget/derive";
import { createMonth } from "@/app/(app)/budget/actions";

interface NewMonthSetupProps {
  month: string;
  sourceMonthId?: string;
  sourceLabel?: string;
}

export function NewMonthSetup({ month, sourceMonthId, sourceLabel }: NewMonthSetupProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"copy" | "empty">(sourceMonthId ? "copy" : "empty");
  const [pending, startTransition] = useTransition();

  function handleContinue() {
    startTransition(async () => {
      await createMonth({
        month,
        copyFromMonthId: mode === "copy" ? sourceMonthId : undefined,
      });
    });
  }

  return (
    <Card className="mx-auto mt-8 max-w-md">
      <h2 className="text-lg font-semibold">Start {formatMonthLabel(month)}</h2>
      <p className="mt-1 text-sm text-text-2">This month doesn&apos;t have data yet.</p>

      <div className="mt-4 flex flex-col gap-2">
        {sourceMonthId && (
          <label
            className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${
              mode === "copy" ? "border-qaza bg-qaza-soft" : "border-border"
            }`}
          >
            <input
              type="radio"
              name="mode"
              checked={mode === "copy"}
              onChange={() => setMode("copy")}
              className="mt-1 accent-qaza"
            />
            <span>
              <span className="font-medium">Copy categories & budgets from {formatMonthLabel(sourceLabel!)}</span>
              <span className="block text-text-2">Recommended — keeps your usual budget structure.</span>
            </span>
          </label>
        )}
        <label
          className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${
            mode === "empty" ? "border-qaza bg-qaza-soft" : "border-border"
          }`}
        >
          <input
            type="radio"
            name="mode"
            checked={mode === "empty"}
            onChange={() => setMode("empty")}
            className="mt-1 accent-qaza"
          />
          <span>
            <span className="font-medium">Start with an empty list</span>
            <span className="block text-text-2">For a genuine reset.</span>
          </span>
        </label>
      </div>

      <div className="mt-6 flex gap-2">
        <Button variant="secondary" onClick={() => router.back()} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleContinue} disabled={pending} className="flex-1">
          {pending ? "Setting up…" : "Continue"}
        </Button>
      </div>
    </Card>
  );
}
