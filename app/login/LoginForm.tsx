"use client";

import { useActionState, useState, useTransition } from "react";
import { login, requestPasswordReset } from "./actions";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [resetState, setResetState] = useState<"idle" | "sending" | "sent">("idle");
  const [, startResetTransition] = useTransition();

  function handleForgotPassword(event: React.MouseEvent) {
    event.preventDefault();
    if (!email || resetState !== "idle") return;
    setResetState("sending");
    startResetTransition(async () => {
      await requestPasswordReset(email);
      setResetState("sent");
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className="relative">
        <TextField
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          className="pr-12"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-3 top-[34px] text-text-2"
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Logging in…" : "Log in"}
      </Button>

      <div className="text-center text-sm">
        {resetState === "sent" ? (
          <span className="text-text-2">If that email exists, we&apos;ve sent a reset link.</span>
        ) : (
          <a href="#" onClick={handleForgotPassword} className="text-qaza">
            {resetState === "sending" ? "Sending…" : "Forgot password?"}
          </a>
        )}
      </div>
    </form>
  );
}
