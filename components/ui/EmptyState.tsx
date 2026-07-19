import { type ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  accentColor?: string;
}

export function EmptyState({ icon, title, description, action, accentColor }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: accentColor ? `var(--${accentColor}-soft, var(--surface-2))` : "var(--surface-2)", color: accentColor ? `var(--${accentColor})` : "var(--text-2)" }}
      >
        {icon}
      </div>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="max-w-xs text-sm text-text-2">{description}</p>
      {action}
    </div>
  );
}
