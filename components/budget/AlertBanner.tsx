import { formatCurrency } from "@/lib/budget/derive";

interface AlertBannerProps {
  remaining: number;
  totalBudget: number;
  daysLeft: number;
  neededPerDay: number;
}

export function AlertBanner({ remaining, totalBudget, daysLeft, neededPerDay }: AlertBannerProps) {
  const lowBalance = totalBudget > 0 && remaining < totalBudget * 0.1;
  if (!lowBalance || daysLeft <= 0) return null;

  return (
    <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
      Only {formatCurrency(remaining)} left for {daysLeft} {daysLeft === 1 ? "day" : "days"} —{" "}
      {formatCurrency(neededPerDay)}/day needed
    </div>
  );
}
