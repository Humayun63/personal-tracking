import {
  HomeIcon,
  QazaIcon,
  BudgetIcon,
  FinanceIcon,
  CoachingIcon,
  HabitsIcon,
  BlogIcon,
} from "@/components/icons";

export const MODULES = [
  { key: "dashboard", label: "Dashboard", shortLabel: "Home", href: "/dashboard", icon: HomeIcon, accent: "text" as const, primary: true },
  { key: "qaza", label: "Qaza Tracker", shortLabel: "Qaza", href: "/qaza", icon: QazaIcon, accent: "qaza" as const, primary: true },
  { key: "budget", label: "Budget", shortLabel: "Budget", href: "/budget", icon: BudgetIcon, accent: "budget" as const, primary: true },
  { key: "finance", label: "Finance", shortLabel: "Finance", href: "/finance", icon: FinanceIcon, accent: "finance" as const, primary: false },
  { key: "coaching", label: "Coaching", shortLabel: "Coaching", href: "/coaching", icon: CoachingIcon, accent: "coaching" as const, primary: false },
  { key: "habits", label: "Habit Tracker", shortLabel: "Habits", href: "/habits", icon: HabitsIcon, accent: "habits" as const, primary: false },
  { key: "blog", label: "Blog", shortLabel: "Blog", href: "/blog", icon: BlogIcon, accent: "blog" as const, primary: false },
];

export const PRIMARY_MODULES = MODULES.filter((m) => m.primary);
export const MORE_MODULES = MODULES.filter((m) => !m.primary);
