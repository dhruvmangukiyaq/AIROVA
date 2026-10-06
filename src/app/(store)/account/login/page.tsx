import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { safeNext } from "@/actions/common";
import { getSession } from "@/lib/auth";
import { AuthSplit } from "@/components/account/auth-split";
import { LoginForm } from "@/components/account/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to your AIROVA FOOTWEAR account to track orders, manage addresses and sync your wishlist.",
  alternates: { canonical: "/account/login" },
  robots: { index: false, follow: true },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const [session, params] = await Promise.all([getSession(), searchParams]);
  if (session) redirect("/account");

  return (
    <AuthSplit>
      <LoginForm next={safeNext(params.next)} />
    </AuthSplit>
  );
}
