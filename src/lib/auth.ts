import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cache } from "react";
import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/types";

export const SESSION_COOKIE = "airova_session";
const SESSION_DAYS = 30;

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) {
    return new TextEncoder().encode("airova-secure-default-fallback-secret-2026");
  }
  return new TextEncoder().encode(value);
}

interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: "ADMIN" | "CUSTOMER";
}

export async function createSession(user: SessionUser, remember = true) {
  const token = await new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${remember ? SESSION_DAYS : 1}d`)
    .sign(secret());

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * (remember ? SESSION_DAYS : 1),
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/** Reads and verifies the session cookie. Cache per-request. */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, secret());
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      email: payload.email ?? "",
      name: payload.name ?? "",
      role: payload.role ?? "CUSTOMER",
    };
  } catch {
    return null;
  }
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  try {
    return await db.user.findUnique({
      where: { id: session.id },
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
    });
  } catch {
    return {
      id: session.id,
      email: session.email,
      name: session.name,
      phone: null,
      role: session.role,
      createdAt: new Date(),
    };
  }
});

export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/admin/login");
  return session;
}

export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/account/login");
  return session;
}

/* ---------------------------- passwords --------------------------- */

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

/* ------------------------- client IP (rate limiting) --------------- */

export async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "local"
  );
}
