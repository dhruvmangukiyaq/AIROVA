"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { register } from "@/actions/auth";
import { IDLE_STATE, firstError, formError } from "@/actions/state";
import { Button } from "@/components/ui/button";
import { FormField, PasswordField, PasswordStrength } from "@/components/account/form-fields";

export function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(register, IDLE_STATE);
  const [password, setPassword] = useState("");
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    if (state.ok) {
      handled.current = true;
      toast.success("Account created", { description: "Welcome to AIROVA FOOTWEAR." });
      router.push(next);
      router.refresh();
      return;
    }
    if (formError(state) || state.fieldErrors) {
      document.querySelector<HTMLElement>("#register-form [aria-invalid='true']")?.focus();
    }
  }, [state, next, router]);

  const message = formError(state);

  return (
    <div>
      <p className="eyebrow">Join AIROVA</p>
      <h1 className="mt-4 text-3xl leading-[1.08] text-ink sm:text-4xl">Create your account</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Faster checkout, order tracking, saved addresses and a wishlist that follows you.
      </p>

      <form action={formAction} id="register-form" noValidate className="mt-8 grid gap-5">
        {message && (
          <p
            role="alert"
            className="border border-destructive/40 bg-destructive/8 px-4 py-3 text-[0.78rem] leading-relaxed text-destructive"
          >
            {message}
          </p>
        )}

        <FormField
          id="register-name"
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Priya Sharma"
          required
          error={firstError(state, "name")}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="register-email"
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            required
            error={firstError(state, "email")}
          />
          <FormField
            id="register-phone"
            label="Mobile number"
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="numeric"
            placeholder="98765 43210"
            hint="10-digit Indian mobile"
            required
            error={firstError(state, "phone")}
          />
        </div>

        <PasswordField
          id="register-password"
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={firstError(state, "password")}
        />
        <PasswordStrength password={password} />

        <PasswordField
          id="register-confirm"
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Repeat your password"
          required
          error={firstError(state, "confirmPassword")}
        />

        <div className="grid gap-2">
          <label
            htmlFor="register-terms"
            className="flex cursor-pointer items-start gap-2.5 text-[0.78rem] leading-relaxed text-muted-foreground"
          >
            <input
              id="register-terms"
              type="checkbox"
              name="terms"
              className="mt-0.5 size-4 shrink-0 accent-[#c8a45d]"
              aria-invalid={firstError(state, "terms") ? true : undefined}
            />
            <span>
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-ink underline decoration-gold underline-offset-4 hover:text-gold-deep"
              >
                terms of service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-ink underline decoration-gold underline-offset-4 hover:text-gold-deep"
              >
                privacy policy
              </Link>
              .
            </span>
          </label>
          {firstError(state, "terms") && (
            <p role="alert" className="text-[0.75rem] text-destructive">
              {firstError(state, "terms")}
            </p>
          )}
        </div>

        <Button type="submit" variant="gold" size="lg" disabled={pending} className="w-full">
          {pending ? (
            <>
              <Loader2 data-icon="inline-start" className="size-4 animate-spin" />
              Creating account
            </>
          ) : (
            <>
              Create account
              <ArrowRight data-icon="inline-end" className="size-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-[0.8rem] text-muted-foreground">
        <p>
          Already have an account?{" "}
          <Link
            href="/account/login"
            className="font-medium text-ink underline decoration-gold underline-offset-4 hover:text-gold-deep"
          >
            Sign in
          </Link>
        </p>
        <Link
          href="/shop"
          className="link-underline text-[0.7rem] font-semibold tracking-[0.16em] uppercase hover:text-gold-deep"
        >
          Continue as guest? Shop without an account
        </Link>
      </div>

      <p className="mt-6 flex items-start gap-2 text-[0.72rem] leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-gold-deep" aria-hidden />
        We only use your number for order updates — never for spam.
      </p>
    </div>
  );
}
