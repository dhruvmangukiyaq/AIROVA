"use server";

import { redirect } from "next/navigation";
import type { User } from "@prisma/client";
import { z } from "zod";
import {
  createSession,
  destroySession,
  getSession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { loginSchema, registerSchema, sanitizeText } from "@/lib/validators";
import {
  guardRateLimit,
  normalizePhone,
  toFieldErrors,
} from "@/actions/common";
import type { ActionState } from "@/actions/state";

/* ------------------------------------------------------------------ */
/* Local schemas — password rules live here because `src/lib/validators`*/
/* is shared with routes that don't need them.                          */
/* ------------------------------------------------------------------ */

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Use at least 8 characters").max(72, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "Choose a password you haven't used here before",
    path: ["newPassword"],
  });

/* ------------------------------------------------------------------ */
/* Sign in                                                             */
/* ------------------------------------------------------------------ */

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const blocked = await guardRateLimit("auth:login", 8);
  if (blocked) return blocked;

  const parsed = loginSchema.safeParse({
    email: sanitizeText(String(formData.get("email") ?? "")),
    password: String(formData.get("password") ?? ""),
    remember: formData.get("remember") === "on",
  });
  if (!parsed.success) return { ok: false, fieldErrors: toFieldErrors(parsed.error) };

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user?.passwordHash
    ? await verifyPassword(parsed.data.password, user.passwordHash)
    : false;

  // One message for both failures so the form can't be used to probe emails.
  if (!user || !valid) {
    return {
      ok: false,
      error: "Email or password is incorrect.",
      fieldErrors: { _form: ["Email or password is incorrect."] },
    };
  }

  await createSession(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    parsed.data.remember,
  );
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Create account                                                      */
/* ------------------------------------------------------------------ */

export async function register(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const blocked = await guardRateLimit("auth:register", 5);
  if (blocked) return blocked;

  const parsed = registerSchema.safeParse({
    name: sanitizeText(String(formData.get("name") ?? "")),
    email: sanitizeText(String(formData.get("email") ?? "")),
    phone: normalizePhone(String(formData.get("phone") ?? "")),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) return { ok: false, fieldErrors: toFieldErrors(parsed.error) };

  if (formData.get("terms") !== "on") {
    return {
      ok: false,
      fieldErrors: { terms: ["Please accept the terms of service and privacy policy"] },
    };
  }

  const email = parsed.data.email;
  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return {
      ok: false,
      fieldErrors: { email: ["An account with this email already exists — sign in instead."] },
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  let user: User;
  try {
    user = await db.user.create({
      data: {
        email,
        name: parsed.data.name,
        phone: parsed.data.phone,
        passwordHash,
      },
    });
  } catch {
    // Unique-email race: two submits landing together.
    return {
      ok: false,
      fieldErrors: { email: ["An account with this email already exists — sign in instead."] },
    };
  }

  await createSession(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    true,
  );

  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Sign out                                                            */
/* ------------------------------------------------------------------ */

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}

/** Signs out everywhere: wipes the user's session rows *and* this cookie. */
export async function logoutEverywhere(): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Your session has already ended." };

  await db.session.deleteMany({ where: { userId: session.id } });
  await destroySession();
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Change password                                                     */
/* ------------------------------------------------------------------ */

export async function changePassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in again to change your password." };

  const blocked = await guardRateLimit("auth:password", 5);
  if (blocked) return blocked;

  const parsed = changePasswordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) return { ok: false, fieldErrors: toFieldErrors(parsed.error) };

  const user = await db.user.findUnique({ where: { id: session.id } });
  if (!user) return { ok: false, error: "Please sign in again." };

  const valid = user.passwordHash
    ? await verifyPassword(parsed.data.currentPassword, user.passwordHash)
    : false;
  if (!valid) {
    return {
      ok: false,
      error: "Your current password is not correct.",
      fieldErrors: { currentPassword: ["Your current password is not correct."] },
    };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await db.user.update({ where: { id: user.id }, data: { passwordHash } });
  return { ok: true };
}
