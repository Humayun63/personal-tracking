import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "icon" | "danger";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-qaza";

const variants: Record<Variant, string> = {
  primary: "bg-qaza text-white hover:opacity-90 px-5 py-3 text-base",
  secondary:
    "bg-transparent border border-border text-text hover:bg-surface-2 px-5 py-3 text-base",
  danger: "bg-danger text-white hover:opacity-90 px-5 py-3 text-base",
  icon: "h-11 w-11 border border-border bg-surface text-text hover:bg-surface-2",
};

/** Shared classes so non-<button> elements (e.g. next/link) can look like a Button. */
export function buttonClasses(variant: Variant = "primary", className = "") {
  return `${base} ${variants[variant]} ${className}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", className = "", ...props },
  ref,
) {
  return <button ref={ref} className={buttonClasses(variant, className)} {...props} />;
});
