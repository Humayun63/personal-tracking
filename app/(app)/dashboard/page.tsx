import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { MODULES } from "@/components/shell/modules";

export default function DashboardPage() {
  const cards = MODULES.filter((m) => m.key !== "dashboard");

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.key} href={mod.href}>
              <Card className="flex h-full flex-col gap-3 transition-shadow hover:shadow-[var(--shadow-lg)]">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `color-mix(in srgb, var(--${mod.accent}) 15%, transparent)`, color: `var(--${mod.accent})` }}
                >
                  <Icon />
                </div>
                <span className="font-semibold">{mod.label}</span>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
