"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "cn";

/** Squared, store-coloured input that matches the contact/newsletter forms. */
export const fieldInput =
  "h-11 rounded-none border-line bg-background text-base placeholder:text-muted-foreground/70";

const labelClass = "text-[0.68rem] font-semibold tracking-[0.2em] uppercase";

export function FieldError({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-[0.75rem] text-destructive">
      {children}
    </p>
  );
}

function HintOrError({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  if (error) return <FieldError id={`${id}-error`}>{error}</FieldError>;
  if (!hint) return null;
  return (
    <p id={`${id}-hint`} className="mt-1.5 text-[0.72rem] leading-relaxed text-muted-foreground">
      {hint}
    </p>
  );
}

/** Label + input + hint/error with the ARIA wiring already connected. */
export function FormField({
  id,
  label,
  hint,
  error,
  className,
  ...inputProps
}: ComponentProps<typeof Input> & {
  id: string;
  label: ReactNode;
  hint?: string;
  error?: string;
}) {
  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id} className={labelClass}>
        {label}
      </Label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(fieldInput, error && "border-destructive")}
        {...inputProps}
      />
      <HintOrError id={id} hint={hint} error={error} />
    </div>
  );
}

/** Password input with a keyboard-reachable show/hide toggle. */
export function PasswordField({
  id,
  label = "Password",
  hint,
  error,
  toggleLabel,
  className,
  ...inputProps
}: ComponentProps<typeof Input> & {
  id: string;
  label?: ReactNode;
  hint?: string;
  error?: string;
  toggleLabel?: string;
}) {
  const [visible, setVisible] = useState(false);
  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id} className={labelClass}>
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(fieldInput, "pr-12", error && "border-destructive")}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={`${visible ? "Hide" : "Show"} ${toggleLabel ?? "password"}`}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-ink"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <HintOrError id={id} hint={hint} error={error} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Password strength                                                   */
/* ------------------------------------------------------------------ */

const STRENGTH_LABEL = ["Too short", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COPY = [
  "Use 8+ characters with a number and a capital.",
  "Add a number or a longer phrase.",
  "Add a symbol to make it stronger.",
  "Solid — add a symbol for extra strength.",
  "Strong password.",
];

/** 0 (too short) → 4 (strong). Pure so it can render on every keystroke. */
export function passwordScore(password: string): number {
  if (password.length < 8) return 0;
  let score = 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^\w\s]/.test(password)) score += 1;
  return Math.min(4, score);
}

const STRENGTH_TONE = ["bg-line", "bg-destructive", "bg-[#c98a1f]", "bg-gold", "bg-green-700"];

export function PasswordStrength({ password }: { password: string }) {
  const score = passwordScore(password);
  return (
    <div aria-live="polite">
      <div className="flex gap-1.5" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn("h-1 flex-1 transition-colors duration-300", i < score ? STRENGTH_TONE[score] : "bg-line")}
          />
        ))}
      </div>
      <p className="mt-1.5 text-[0.72rem] text-muted-foreground">
        <span className="font-medium text-ink">{STRENGTH_LABEL[score]}</span>
        {" — "}
        {STRENGTH_COPY[score]}
      </p>
    </div>
  );
}
