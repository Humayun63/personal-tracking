"use client";

import { useMemo, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatMonthLabel } from "@/lib/budget/derive";
import { importExpenses, type ImportRow } from "@/app/(app)/budget/actions";
import type { MonthCategory, BudgetExpense } from "@/lib/budget/queries";

interface MonthData {
  month: string;
  categories: MonthCategory[];
  expenses: BudgetExpense[];
}

interface ImportExportPanelProps {
  month: string;
  monthId: string | null;
  months: string[];
  allData: MonthData[];
}

type Range = "current" | "all" | string;
type Format = "csv" | "json";

interface FlatRow {
  month: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

function toFlatRows(data: MonthData[]): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const m of data) {
    const byId = new Map(m.categories.map((c) => [c.category_id, c.name]));
    for (const e of m.expenses) {
      rows.push({
        month: m.month,
        date: e.expense_date,
        category: byId.get(e.category_id) ?? "Unknown",
        description: e.description,
        amount: e.amount,
      });
    }
  }
  return rows;
}

function toCsv(rows: FlatRow[]): string {
  const header = "month,date,category,description,amount";
  const lines = rows.map((r) =>
    [r.month, r.date, csvField(r.category), csvField(r.description), r.amount].join(","),
  );
  return [header, ...lines].join("\n");
}

function csvField(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function parseCsv(text: string): FlatRow[] {
  const lines = text.trim().split(/\r?\n/);
  const [, ...body] = lines; // skip header
  return body
    .filter(Boolean)
    .map((line) => {
      const fields: string[] = [];
      let cur = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
          if (ch === '"' && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else if (ch === '"') {
            inQuotes = false;
          } else {
            cur += ch;
          }
        } else if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          fields.push(cur);
          cur = "";
        } else {
          cur += ch;
        }
      }
      fields.push(cur);
      const [month, date, category, description, amount] = fields;
      return { month, date, category, description, amount: Number(amount) || 0 };
    });
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ImportExportPanel({ month, monthId, months, allData }: ImportExportPanelProps) {
  const [range, setRange] = useState<Range>("current");
  const [format, setFormat] = useState<Format>("csv");
  const [importRows, setImportRows] = useState<FlatRow[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [pending, startTransition] = useTransition();

  const existingCategoryNames = useMemo(() => {
    const names = new Set<string>();
    for (const m of allData) for (const c of m.categories) names.add(c.name.trim().toLowerCase());
    return names;
  }, [allData]);

  function handleExport() {
    const scoped =
      range === "all" ? allData : allData.filter((m) => m.month === (range === "current" ? month : range));
    const rows = toFlatRows(scoped);
    const label = range === "all" ? "all-time" : range === "current" ? month : range;

    if (format === "csv") {
      download(`hearth-budget-${label}.csv`, toCsv(rows), "text/csv");
    } else {
      download(`hearth-budget-${label}.json`, JSON.stringify(rows, null, 2), "application/json");
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    file.text().then((text) => {
      try {
        const rows = file.name.endsWith(".json") ? JSON.parse(text) : parseCsv(text);
        setImportRows(rows);
      } catch {
        setImportRows([]);
      }
    });
  }

  const newCategories = importRows
    ? [...new Set(importRows.map((r) => r.category))].filter(
        (name) => !existingCategoryNames.has(name.trim().toLowerCase()),
      )
    : [];

  function handleImport() {
    if (!importRows || !monthId) return;
    const rows: ImportRow[] = importRows.map((r) => ({
      categoryName: r.category,
      description: r.description,
      amount: r.amount,
      expenseDate: r.date,
    }));
    startTransition(async () => {
      await importExpenses({ monthId, rows });
      setImportRows(null);
      setFileName("");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h2 className="mb-3 font-semibold">Export</h2>
        <div className="flex flex-col gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="h-11 rounded-xl border border-border bg-surface px-3 text-sm"
          >
            <option value="current">{formatMonthLabel(month)} (current view)</option>
            {months
              .filter((m) => m !== month)
              .map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            <option value="all">All time</option>
          </select>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormat("csv")}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm ${format === "csv" ? "border-qaza bg-qaza-soft text-qaza" : "border-border"}`}
            >
              Spreadsheet (CSV)
            </button>
            <button
              type="button"
              onClick={() => setFormat("json")}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm ${format === "json" ? "border-qaza bg-qaza-soft text-qaza" : "border-border"}`}
            >
              Full backup (JSON)
            </button>
          </div>

          <Button onClick={handleExport}>Export</Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold">Import</h2>
        <input type="file" accept=".csv,.json" onChange={handleFile} className="text-sm" />
        {fileName && <p className="mt-2 text-sm text-text-2">{fileName}</p>}

        {importRows && (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-sm">
              {importRows.length} expense(s) will be added to {formatMonthLabel(month)}.
              {newCategories.length > 0 && (
                <>
                  {" "}
                  {newCategories.length} new categor{newCategories.length === 1 ? "y" : "ies"} will
                  be created: {newCategories.join(", ")}.
                </>
              )}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setImportRows(null);
                  setFileName("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={pending || !monthId} className="flex-1">
                {pending ? "Importing…" : "Import"}
              </Button>
            </div>
          </div>
        )}

        <p className="mt-4 flex items-start gap-2 text-xs text-text-2">
          ⚠ Importing adds to your existing data — it won&apos;t overwrite anything automatically.
        </p>
      </Card>
    </div>
  );
}
