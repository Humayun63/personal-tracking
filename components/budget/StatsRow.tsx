import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/budget/derive";

interface StatsRowProps {
  totalSpent: number;
  totalBudget: number;
  dailyAvg: number;
  daysPassed: number;
  daysLeft: number;
  neededPerDay: number;
  isCurrentMonth: boolean;
}

function neededColor(amount: number) {
  if (amount < 1000) return "var(--success)";
  if (amount < 1500) return "var(--warning)";
  return "var(--danger)";
}

export function StatsRow({
  totalSpent,
  totalBudget,
  dailyAvg,
  daysPassed,
  daysLeft,
  neededPerDay,
  isCurrentMonth,
}: StatsRowProps) {
  const pct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card>
        <p className="text-xs uppercase tracking-wide text-text-2">Spent</p>
        <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-danger">
          {formatCurrency(totalSpent)}
        </p>
        <p className="mt-1 text-xs text-text-2">{pct.toFixed(1)}% of budget</p>
      </Card>
      <Card>
        <p className="text-xs uppercase tracking-wide text-text-2">Daily Avg</p>
        <p className="mt-1 font-mono text-lg font-semibold tabular-nums" style={{ color: "var(--warning)" }}>
          {formatCurrency(dailyAvg)}
        </p>
        <p className="mt-1 text-xs text-text-2">avg over {daysPassed} days</p>
      </Card>
      <Card>
        <p className="text-xs uppercase tracking-wide text-text-2">Days Left</p>
        <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-qaza">{daysLeft}</p>
        <p className="mt-1 text-xs text-text-2">{isCurrentMonth ? "days remaining" : "month ended"}</p>
      </Card>
      <Card>
        <p className="text-xs uppercase tracking-wide text-text-2">Needed/Day</p>
        <p
          className="mt-1 font-mono text-lg font-semibold tabular-nums"
          style={{ color: daysLeft > 0 ? neededColor(neededPerDay) : undefined }}
        >
          {daysLeft > 0 ? formatCurrency(neededPerDay) : "—"}
        </p>
        <p className="mt-1 text-xs text-text-2">{daysLeft > 0 ? "to stay on track" : ""}</p>
      </Card>
    </div>
  );
}
