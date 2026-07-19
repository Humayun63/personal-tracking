"use client";

import { usePathname } from "next/navigation";
import { MODULES } from "./modules";
import { ThemeToggle } from "./ThemeToggle";
import { LogoutIcon } from "@/components/icons";
import { logout } from "@/app/login/actions";

function titleFor(pathname: string) {
  if (pathname === "/more") return "More";
  const mod = MODULES.find((m) => pathname === m.href || pathname.startsWith(`${m.href}/`));
  return mod?.label ?? "Hearth";
}

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:px-6">
      <h1 className="text-lg font-semibold">{titleFor(pathname)}</h1>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <form action={logout}>
          <button
            type="submit"
            aria-label="Log out"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-text-2 hover:bg-surface-2"
          >
            <LogoutIcon />
          </button>
        </form>
      </div>
    </header>
  );
}
