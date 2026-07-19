"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_MODULES } from "./modules";
import { MoreIcon } from "@/components/icons";

export function BottomTabBar() {
  const pathname = usePathname();
  const onMore = pathname === "/more" || pathname.startsWith("/more/");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-surface md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {PRIMARY_MODULES.map((mod) => {
        const active = pathname === mod.href || pathname.startsWith(`${mod.href}/`);
        const Icon = mod.icon;
        return (
          <Link
            key={mod.key}
            href={mod.href}
            className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-text-2"
          >
            <Icon style={{ color: active ? `var(--${mod.accent})` : undefined }} />
            <span style={{ color: active ? "var(--text)" : undefined }}>{mod.shortLabel}</span>
          </Link>
        );
      })}
      <Link
        href="/more"
        className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-text-2"
      >
        <MoreIcon style={{ color: onMore ? "var(--text)" : undefined }} />
        <span style={{ color: onMore ? "var(--text)" : undefined }}>More</span>
      </Link>
    </nav>
  );
}
