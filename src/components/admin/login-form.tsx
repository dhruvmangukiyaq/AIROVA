"use client";

import * as React from "react";
import { useActionState } from "react";
import { AlertTriangle, KeyRound } from "lucide-react";
import { loginAdmin } from "@/app/(admin)/actions";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/admin/fields";

const DEMO_EMAIL = "admin@airova.in";
const DEMO_PASSWORD = "Admin@123";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, null);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  };

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-4">
        <TextField
          label="Email address"
          name="email"
          type="email"
          required
          autoComplete="username"
          placeholder="admin@airova.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-cream/60">
        <input
          type="checkbox"
          name="remember"
          defaultChecked
          className="size-4 accent-[#c8a45d]"
        />
        Keep me signed in for 30 days
      </label>

      {state?.error ? (
        <p
          role="alert"
          className="flex items-start gap-2 border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-[#f0a49d]"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      ) : null}

      <Button type="submit" variant="gold" size="lg" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Enter control room"}
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-line pt-4">
        <p className="text-xs text-cream/40">
          Demo · <span className="text-cream/65">{DEMO_EMAIL}</span> /{" "}
          <span className="text-cream/65">{DEMO_PASSWORD}</span>
        </p>
        <Button type="button" variant="gold-outline" size="xs" onClick={fillDemo}>
          <KeyRound className="size-3.5" aria-hidden />
          Fill demo
        </Button>
      </div>
    </form>
  );
}
