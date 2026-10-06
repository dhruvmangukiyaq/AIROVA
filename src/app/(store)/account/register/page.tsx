import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { safeNext } from "@/actions/common";
import { getSession } from "@/lib/auth";
import { AuthSplit } from "@/components/account/auth-split";
import { RegisterForm } from "@/components/account/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create an AIROVA FOOTWEAR account — faster checkout, order tracking, saved addresses and a synced wishlist.",
  alternates: { canonical: "/account/register" },
  robots: { index: false, follow: true },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function RegisterPage({ searchParams }: { searchParams: SearchParams }) {
  const [session, params] = await Promise.all([getSession(), searchParams]);
  if (session) redirect("/account");

  return (
    <AuthSplit>
      <RegisterForm next={safeNext(params.next)} />
    </AuthSplit>
  );
}
