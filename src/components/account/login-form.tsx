"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { login } from "@/actions/auth";
import { IDLE_STATE, firstError, formError } from "@/actions/state";
import { Button } from "@/components/ui/button";
import { FormField, PasswordField } from "@/components/account/form-fields";

const DEMO = {
  email: "customer@airova.in",
  password: "Customer@123",
} as const;

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(login, IDLE_STATE);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    const message = formError(state);
    if (state.ok) {
      handled.current = true;
      toast.success("Welcome back", { description: "You're signed in to AIROVA." });
      router.push(next);
      router.refresh();
      return;
    }
    if (message || state.fieldErrors) {
      document.querySelector<HTMLElement>("#login-form [aria-invalid='true']")?.focus();
    }
  }, [state, next, router]);

  const useDemo = () => {
    if (emailRef.current) emailRef.current.value = DEMO.email;
    if (passwordRef.current) passwordRef.current.value = DEMO.password;
    emailRef.current?.focus();
  };

  const message = formError(state);

  return (
    <div>
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-4 text-3xl leading-[1.08] text-ink sm:text-4xl">Sign in</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Track orders, manage addresses and keep your wishlist synced across devices.
      </p>

      <form action={formAction} id="login-form" noValidate className="mt-8 grid gap-5">
        {message && (
          <p
            role="alert"
            className="border border-destructive/40 bg-destructive/8 px-4 py-3 text-[0.78rem] leading-relaxed text-destructive"
          >
            {message}
          </p>
        )}

        <FormField
          id="login-email"
          label="Email"
          type="email"
          name="email"
          ref={emailRef}
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          required
          error={firstError(state, "email")}
        />

        <PasswordField
          id="login-password"
          label="Password"
          name="password"
          ref={passwordRef}
          autoComplete="current-password"
          placeholder="Your password"
          required
          error={firstError(state, "password")}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label
            htmlFor="login-remember"
            className="flex cursor-pointer items-center gap-2.5 text-[0.78rem] text-muted-foreground"
          >
            <input
              id="login-remember"
              type="checkbox"
              name="remember"
              defaultChecked
              className="size-4 shrink-0 accent-[#c8a45d]"
            />
            Keep me signed in
          </label>
          <Link
            href="/contact"
            className="link-underline text-[0.72rem] font-medium tracking-[0.1em] text-ink uppercase hover:text-gold-deep"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="gold" size="lg" disabled={pending} className="w-full">
          {pending ? (
            <>
              <Loader2 data-icon="inline-start" className="size-4 animate-spin" />
              Signing in
            </>
          ) : (
            <>
              Sign in
              <ArrowRight data-icon="inline-end" className="size-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-[0.8rem] text-muted-foreground">
        <p>
          New here?{" "}
          <Link
            href="/account/register"
            className="font-medium text-ink underline decoration-gold underline-offset-4 hover:text-gold-deep"
          >
            Create an account
          </Link>
        </p>
        <Link
          href="/shop"
          className="link-underline text-[0.7rem] font-semibold tracking-[0.16em] uppercase hover:text-gold-deep"
        >
          Continue as guest? Shop without an account
        </Link>
      </div>

      {/* demo credentials — local seed data, handy while reviewing the build */}
      <div className="mt-6 border border-line bg-bone p-4 sm:p-5">
        <p className="flex items-center gap-2 text-[0.64rem] font-semibold tracking-[0.2em] text-gold-deep uppercase">
          <ShieldCheck className="size-3.5" aria-hidden />
          Demo credentials
        </p>
        <dl className="mt-3 space-y-2 text-[0.78rem] text-muted-foreground">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-ink">Customer:</dt>
            <dd className="font-medium break-all">customer@airova.in / Customer@123</dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-ink">Admin:</dt>
            <dd className="font-medium break-all">admin@airova.in / Admin@123</dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" size="sm" onClick={useDemo}>
            Fill customer login
          </Button>
          <Link
            href="/admin/login"
            className="text-[0.7rem] font-semibold tracking-[0.16em] uppercase text-muted-foreground hover:text-ink"
          >
            Admin dashboard →
          </Link>
        </div>
        <p className="mt-3 text-[0.7rem] leading-relaxed text-muted-foreground/80">
          Admin sign-in lives at <span className="text-ink">/admin/login</span>.
        </p>
      </div>
    </div>
  );
}
