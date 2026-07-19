interface ProgressRingProps {
  percent: number;
  color?: string;
  completeColor?: string;
  size?: number;
}

const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({
  percent,
  color = "var(--qaza)",
  completeColor = "var(--gold)",
  size = 96,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;
  const strokeColor = clamped >= 100 ? completeColor : color;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 96 96"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle cx="48" cy="48" r={RADIUS} fill="none" stroke="var(--track)" strokeWidth="8" />
        <circle
          cx="48"
          cy="48"
          r={RADIUS}
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <span className="absolute text-sm font-semibold tabular-nums">{Math.round(clamped)}%</span>
    </div>
  );
}
