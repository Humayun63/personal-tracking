"use client";

import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Button } from "@/components/ui/Button";

interface PrayerCardProps {
  name: string;
  done: number;
  total: number;
  onLogOne: () => void;
}

export function PrayerCard({ name, done, total, onLogOne }: PrayerCardProps) {
  const percent = total > 0 ? (done / total) * 100 : 0;
  const remaining = Math.max(0, total - done);

  return (
    <Card className="flex flex-col items-center gap-2 text-center">
      <span className="font-medium">{name}</span>
      <ProgressRing percent={percent} size={80} />
      <span className="text-xs text-text-2">{remaining.toLocaleString()} left</span>
      <Button
        onClick={onLogOne}
        aria-label={`Log one ${name} prayer`}
        className="mt-1 h-11 w-full"
      >
        +1
      </Button>
    </Card>
  );
}
