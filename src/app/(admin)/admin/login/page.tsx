import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.role === "ADMIN") redirect("/admin");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[34rem] -translate-x-1/2 rounded-full bg-gold/10 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:34px_34px]"
      />

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <span className="relative size-16">
            <Image
              src="/images/brand/airova-monogram-transparent.png"
              alt="AIROVA FOOTWEAR monogram"
              fill
              sizes="64px"
              priority
              className="object-contain"
            />
          </span>
          <p className="eyebrow mt-5">Control room</p>
          <h1 className="mt-2 text-3xl text-cream">Admin sign in</h1>
          <p className="mt-2 text-sm text-cream/45">Authorised AIROVA staff only.</p>
        </div>

        <div className="mt-8 border border-ink-line bg-[#131317] p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
          <LoginForm />
        </div>

        <div className="mt-6 flex items-center justify-between text-[0.6rem] tracking-[0.18em] text-cream/30 uppercase">
          <span>AIROVA FOOTWEAR</span>
          <Link href="/" className="transition-colors hover:text-gold">
            Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
