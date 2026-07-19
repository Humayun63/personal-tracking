"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULES } from "./modules";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-63 shrink-0 flex-col border-r border-border bg-surface p-4 md:flex">
      <div className="px-2 py-3 text-lg font-semibold">Hearth</div>
      <nav className="mt-4 flex flex-col gap-1">
        {MODULES.map((mod) => {
          const active = pathname === mod.href || pathname.startsWith(`${mod.href}/`);
          const Icon = mod.icon;
          return (
            <Link
              key={mod.key}
              href={mod.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-surface-2 text-text" : "text-text-2 hover:bg-surface-2 hover:text-text"
              }`}
            >
              <Icon style={{ color: active && mod.accent !== "text" ? `var(--${mod.accent})` : undefined }} />
              {mod.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
