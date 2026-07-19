"use client";

import { SunIcon, MoonIcon } from "@/components/icons";

function toggleTheme() {
  const root = document.documentElement;
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("hearth-theme", next);
}

/**
 * Icon visibility is driven by [data-theme] via CSS (see globals.css), not
 * React state — the bootstrap script in layout.tsx sets data-theme before
 * hydration, so deriving it in a client-side effect would just cause an
 * unnecessary extra render (and a flash of the wrong icon).
 */
export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-text hover:bg-surface-2"
    >
      <SunIcon className="theme-icon-sun" />
      <MoonIcon className="theme-icon-moon" />
    </button>
  );
}
