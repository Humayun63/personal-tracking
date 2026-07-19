import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/shell/ThemeToggle";

export default function LandingPage() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <h1 className="text-3xl font-semibold">Hearth</h1>
      <p className="max-w-xs text-text-2">
        Your finances, habits, and prayers — gathered in one calm place.
      </p>

      <Link href="/login" className={buttonClasses("primary", "px-8")}>
        Log in
      </Link>

      <p className="mt-4 text-xs text-text-2">
        Add to Home Screen to install Hearth as an app.
      </p>
    </main>
  );
}
