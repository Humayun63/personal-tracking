"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CheckIcon } from "@/components/icons";

interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

interface ToastState extends ToastOptions {
  id: number;
}

const ToastContext = createContext<((options: ToastOptions) => void) | null>(null);

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used within a ToastProvider");
  return show;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const show = useCallback((options: ToastOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const id = ++idRef.current;
    setToast({ id, ...options });
    timerRef.current = setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, options.durationMs ?? 4000);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full bg-text px-4 py-2.5 text-sm text-bg shadow-[var(--shadow-lg)] animate-[toastin_.25s_ease]"
        >
          <CheckIcon className="h-4 w-4 shrink-0" style={{ color: "var(--qaza)" }} />
          <span>{toast.message}</span>
          {toast.onAction && (
            <button
              type="button"
              onClick={() => {
                toast.onAction?.();
                setToast(null);
              }}
              className="font-semibold underline underline-offset-2"
            >
              {toast.actionLabel ?? "Undo"}
            </button>
          )}
        </div>
      )}
    </ToastContext.Provider>
  );
}
