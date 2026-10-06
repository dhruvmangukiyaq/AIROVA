"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, LogOut, Save, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { changePassword, logoutEverywhere } from "@/actions/auth";
import { updateProfile } from "@/actions/account";
import { IDLE_STATE, firstError, formError } from "@/actions/state";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/account/confirm-dialog";
import {
  FormField,
  PasswordField,
  PasswordStrength,
  fieldInput,
} from "@/components/account/form-fields";
import type { ActionState } from "@/actions/state";

interface ProfileValues {
  name: string;
  email: string;
  phone: string;
}

/* ------------------------------------------------------------------ */
/* Details                                                              */
/* ------------------------------------------------------------------ */

function DetailsForm({ values }: { values: ProfileValues }) {
  const [state, formAction, pending] = useActionState(updateProfile, IDLE_STATE);
  const seen = useRef<ActionState | null>(null);

  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    const message = formError(state);
    if (state.ok) {
      toast.success("Profile updated", { description: "Your details are saved." });
      return;
    }
    if (message || state.fieldErrors) {
      document.querySelector<HTMLElement>("#profile-form [aria-invalid='true']")?.focus();
    }
  }, [state]);

  const message = formError(state);

  return (
    <form action={formAction} id="profile-form" noValidate className="grid gap-5">
      {message && (
        <p
          role="alert"
          className="border border-destructive/40 bg-destructive/8 px-4 py-3 text-[0.78rem] leading-relaxed text-destructive"
        >
          {message}
        </p>
      )}

      <FormField
        id="profile-name"
        label="Full name"
        name="name"
        autoComplete="name"
        defaultValue={values.name}
        required
        error={firstError(state, "name")}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="profile-phone"
          label="Mobile number"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="10-digit mobile number"
          defaultValue={values.phone}
          error={firstError(state, "phone")}
          hint="Used for delivery updates over WhatsApp."
        />

        <div className="grid gap-2">
          <label
            htmlFor="profile-email"
            className="text-[0.68rem] font-semibold tracking-[0.2em] uppercase"
          >
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            name="email"
            value={values.email}
            readOnly
            disabled
            className={`${fieldInput} cursor-not-allowed text-muted-foreground`}
            aria-describedby="profile-email-hint"
          />
          <p id="profile-email-hint" className="mt-1.5 text-[0.72rem] text-muted-foreground">
            Your sign-in email cannot be changed here — message support to update it.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="gold" size="sm" disabled={pending} aria-busy={pending}>
          {pending ? <Loader2 data-icon="inline-start" className="size-3.5 animate-spin" /> : null}
          Save details
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Password                                                             */
/* ------------------------------------------------------------------ */

function PasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const seen = useRef<ActionState | null>(null);

  /**
   * Wrapped so the field can be cleared inside the action (an event context)
   * rather than from an effect after the state lands.
   */
  const submit = (prev: ActionState, formData: FormData) =>
    changePassword(prev, formData).then((result) => {
      if (result.ok) setNewPassword("");
      return result;
    });

  const [state, formAction, pending] = useActionState(submit, IDLE_STATE);

  useEffect(() => {
    if (state === seen.current) return;
    seen.current = state;
    const message = formError(state);
    if (state.ok) {
      toast.success("Password changed", {
        description: "Use your new password the next time you sign in.",
      });
      return;
    }
    if (message || state.fieldErrors) {
      document.querySelector<HTMLElement>("#password-form [aria-invalid='true']")?.focus();
    }
  }, [state]);

  const message = formError(state);

  return (
    <form action={formAction} id="password-form" noValidate className="grid gap-5">
      {message && (
        <p
          role="alert"
          className="border border-destructive/40 bg-destructive/8 px-4 py-3 text-[0.78rem] leading-relaxed text-destructive"
        >
          {message}
        </p>
      )}

      <PasswordField
        id="password-current"
        label="Current password"
        name="currentPassword"
        autoComplete="current-password"
        required
        error={firstError(state, "currentPassword")}
      />

      <div className="grid gap-2">
        <PasswordField
          id="password-new"
          label="New password"
          name="newPassword"
          autoComplete="new-password"
          placeholder="8+ characters"
          required
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          error={firstError(state, "newPassword")}
        />
        <PasswordStrength password={newPassword} />
      </div>

      <PasswordField
        id="password-confirm"
        label="Confirm new password"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="Repeat the new password"
        required
        error={firstError(state, "confirmPassword")}
      />

      <div className="flex justify-end">
        <Button type="submit" variant="ink" size="sm" disabled={pending} aria-busy={pending}>
          {pending ? <Loader2 data-icon="inline-start" className="size-3.5 animate-spin" /> : null}
          Update password
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Page sections                                                        */
/* ------------------------------------------------------------------ */

export function ProfileForms({ values }: { values: ProfileValues }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const signOutEverywhere = () => {
    startTransition(async () => {
      const result = await logoutEverywhere();
      if (!result.ok) {
        toast.error(result.error ?? "Could not sign out everywhere.");
        return;
      }
      toast.success("Signed out everywhere", {
        description: "This device has been signed out too.",
      });
      router.push("/account/login");
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      <section aria-labelledby="profile-details" className="border border-line bg-paper p-5 sm:p-6">
        <h2
          id="profile-details"
          className="mb-5 flex items-center gap-2 text-[0.66rem] font-semibold tracking-[0.2em] text-ink uppercase"
        >
          <UserRound className="size-3.5 text-gold" aria-hidden /> Your details
        </h2>
        <DetailsForm values={values} />
      </section>

      <section aria-labelledby="profile-password" className="border border-line bg-paper p-5 sm:p-6">
        <h2
          id="profile-password"
          className="mb-5 flex items-center gap-2 text-[0.66rem] font-semibold tracking-[0.2em] text-ink uppercase"
        >
          <KeyRound className="size-3.5 text-gold" aria-hidden /> Change password
        </h2>
        <PasswordForm />
      </section>

      <section aria-labelledby="profile-security" className="border border-line bg-paper p-5 sm:p-6">
        <h2
          id="profile-security"
          className="flex items-center gap-2 text-[0.66rem] font-semibold tracking-[0.2em] text-ink uppercase"
        >
          <ShieldCheck className="size-3.5 text-gold" aria-hidden /> Security
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Changed your password on a shared machine? Sign out on every browser and
          device that is currently using this account.
        </p>
        <div className="mt-4">
          <ConfirmDialog
            title="Sign out everywhere?"
            description="Every session for this account ends immediately, including this device. You will be returned to the sign-in page."
            confirmLabel="Sign out everywhere"
            destructive
            onConfirm={signOutEverywhere}
            trigger={
              <Button type="button" variant="outline" size="sm" disabled={pending}>
                <LogOut data-icon="inline-start" className="size-3.5" />
                {pending ? "Signing out…" : "Sign out everywhere"}
              </Button>
            }
          />
        </div>
      </section>

      <section aria-labelledby="profile-save" className="border border-line bg-bone p-5 sm:p-6">
        <h2
          id="profile-save"
          className="flex items-center gap-2 text-[0.66rem] font-semibold tracking-[0.2em] text-gold-deep uppercase"
        >
          <Save className="size-3.5" aria-hidden /> Good to know
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Order confirmations, shipping updates and invoices all go to{" "}
          <span className="font-medium text-ink">{values.email}</span>. Keep your mobile
          number current so our delivery partner can reach you.
        </p>
      </section>
    </div>
  );
}
