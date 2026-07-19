import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency, statusColor } from "@/lib/budget/derive";

interface BalanceCardProps {
  totalBudget: number;
  totalSpent: number;
}

export function BalanceCard({ totalBudget, totalSpent }: BalanceCardProps) {
  const remaining = totalBudget - totalSpent;
  const pct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const color = statusColor(pct);
  const over = remaining < 0;

  return (
    <Card>
      <p className="font-mono text-3xl font-semibold tabular-nums" style={{ color }}>
        {formatCurrency(Math.abs(remaining))}
      </p>
      <p className="text-sm text-text-2">{over ? "Over budget by" : "Remaining this month"}</p>

      <div className="mt-4">
        <ProgressBar percent={pct} color={color} />
      </div>

      <div className="mt-2 flex items-center justify-between text-sm text-text-2">
        <span>
          {formatCurrency(totalSpent)} spent of {formatCurrency(totalBudget)}
        </span>
        <span className="tabular-nums">{Math.round(pct)}%</span>
      </div>
    </Card>
  );
}
