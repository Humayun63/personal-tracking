"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ChevronDownIcon, ChevronUpIcon } from "@/components/icons";
import { totalDaysOwed, activePrayers, type ExclusionPeriod } from "@/lib/qaza/calculate";
import { saveQazaSetup } from "@/app/(app)/qaza/actions";

interface SetupWizardProps {
  initial?: {
    bulughDate: string;
    qazaEndDate: string;
    includeWitr: boolean;
    exclusions: ExclusionPeriod[];
  };
}

type Step = 1 | 2 | "confirm";

export function SetupWizard({ initial }: SetupWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [bulughDate, setBulughDate] = useState(initial?.bulughDate ?? "");
  const [qazaEndDate, setQazaEndDate] = useState(initial?.qazaEndDate ?? "");
  const [includeWitr, setIncludeWitr] = useState(initial?.includeWitr ?? true);
  const [exclusions, setExclusions] = useState<ExclusionPeriod[]>(initial?.exclusions ?? []);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function addExclusion() {
    setExclusions((prev) => [...prev, { start_date: "", end_date: "" }]);
  }

  function updateExclusion(index: number, patch: Partial<ExclusionPeriod>) {
    setExclusions((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }

  function removeExclusion(index: number) {
    setExclusions((prev) => prev.filter((_, i) => i !== index));
  }

  const validExclusions = exclusions.filter((e) => e.start_date && e.end_date);
  const total =
    bulughDate && qazaEndDate ? totalDaysOwed(bulughDate, qazaEndDate, validExclusions) : 0;
  const prayers = activePrayers(includeWitr);

  function handleCommit() {
    startTransition(async () => {
      await saveQazaSetup({
        bulughDate,
        qazaEndDate,
        includeWitr,
        exclusions: validExclusions.map((e) => ({ startDate: e.start_date, endDate: e.end_date })),
      });
    });
  }

  if (step === "confirm") {
    return (
      <Card className="mx-auto max-w-md text-center">
        <h2 className="text-lg font-semibold">Here&apos;s where you&apos;re starting</h2>
        <p className="mt-1 text-sm text-text-2">A starting point — not a deadline.</p>

        <p className="mt-6 text-4xl font-semibold tabular-nums">{total.toLocaleString()}</p>
        <p className="text-sm text-text-2">total days in your qaza period</p>

        <div className="mt-6 flex flex-col divide-y divide-border rounded-xl border border-border">
          {prayers.map((p) => (
            <div key={p.key} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span>{p.name}</span>
              <span className="font-medium tabular-nums">{total.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-text-2">
          This is just a starting point — you can adjust these dates anytime in settings.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={handleCommit} disabled={pending} className="w-full">
            {pending ? "Starting…" : "Start Tracking"}
          </Button>
          <Button variant="secondary" onClick={() => setStep(2)} className="w-full">
            Back
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-md">
      <div className="mb-4">
        <p className="mb-2 text-sm text-text-2">Step {step} of 2</p>
        <ProgressBar percent={step === 1 ? 50 : 100} />
      </div>

      {step === 1 ? (
        <>
          <h2 className="text-lg font-semibold">
            When did you reach the age of religious responsibility (bulugh)?
          </h2>
          <input
            type="date"
            value={bulughDate}
            onChange={(e) => setBulughDate(e.target.value)}
            className="mt-4 h-12 w-full rounded-xl border border-border bg-surface px-4 text-base"
          />
          <p className="mt-2 text-sm text-text-2">
            Not sure of the exact date? Enter your best estimate — you can always edit this later.
          </p>
          <Button
            onClick={() => setStep(2)}
            disabled={!bulughDate}
            className="mt-6 w-full"
          >
            Next →
          </Button>
        </>
      ) : (
        <>
          <h2 className="text-lg font-semibold">
            When did you start praying regularly (the point you consider your qaza period to
            end)?
          </h2>
          <input
            type="date"
            value={qazaEndDate}
            onChange={(e) => setQazaEndDate(e.target.value)}
            min={bulughDate}
            className="mt-4 h-12 w-full rounded-xl border border-border bg-surface px-4 text-base"
          />
          <p className="mt-2 text-sm text-text-2">
            Not sure of the exact date? Enter your best estimate — you can always edit this
            later.
          </p>

          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            className="mt-6 flex w-full items-center justify-between text-sm font-medium text-text-2"
          >
            Advanced settings
            {advancedOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>

          {advancedOpen && (
            <div className="mt-3 flex flex-col gap-4 rounded-xl border border-border p-4">
              <label className="flex items-center justify-between gap-4 text-sm">
                <span>
                  Include Witr in daily count
                  <span className="block text-text-2">
                    On by default (treated as wajib in the Hanafi view). Turn off if you
                    don&apos;t count it.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={includeWitr}
                  onChange={(e) => setIncludeWitr(e.target.checked)}
                  className="h-5 w-5 shrink-0 accent-qaza"
                />
              </label>

              <div>
                <p className="text-sm font-medium">Exclude periods (optional)</p>
                <div className="mt-2 flex flex-col gap-2">
                  {exclusions.map((ex, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="date"
                        value={ex.start_date}
                        onChange={(e) => updateExclusion(i, { start_date: e.target.value })}
                        className="h-10 flex-1 rounded-lg border border-border bg-surface px-2 text-sm"
                      />
                      <input
                        type="date"
                        value={ex.end_date}
                        onChange={(e) => updateExclusion(i, { end_date: e.target.value })}
                        className="h-10 flex-1 rounded-lg border border-border bg-surface px-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeExclusion(i)}
                        aria-label="Remove exclusion period"
                        className="text-text-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addExclusion}
                  className="mt-2 text-sm font-medium text-qaza"
                >
                  + Add exclusion period
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
              ← Back
            </Button>
            <Button
              onClick={() => setStep("confirm")}
              disabled={!qazaEndDate}
              className="flex-1"
            >
              Calculate
            </Button>
          </div>

          {initial && (
            <button
              type="button"
              onClick={() => router.back()}
              className="mt-4 w-full text-center text-sm text-text-2"
            >
              Cancel
            </button>
          )}
        </>
      )}
    </Card>
  );
}
