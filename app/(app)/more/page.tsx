import Link from "next/link";
import { MORE_MODULES } from "@/components/shell/modules";

export default function MorePage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex flex-col gap-2">
        {MORE_MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.key}
              href={mod.href}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow)]"
            >
              <Icon style={{ color: `var(--${mod.accent})` }} />
              <span className="font-medium">{mod.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
