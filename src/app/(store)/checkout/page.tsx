import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout — UPI, cards, net banking and cash on delivery.",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  return (
    <div className="shell pb-24 pt-10 sm:pb-32 sm:pt-14">
      <header className="mb-8 border-b border-ink pb-6">
        <p className="eyebrow">Secure checkout</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-4xl sm:text-5xl">Checkout</h1>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="size-3.5 text-gold-deep" />
            256-bit encrypted · your card details never touch our servers
          </p>
        </div>
      </header>

      {!user && (
        <p className="mb-8 border border-line bg-bone/60 px-4 py-3 text-sm">
          Already have an account?{" "}
          <Link
            href="/account/login?next=/checkout"
            className="font-semibold text-gold-deep underline-offset-4 hover:underline"
          >
            Sign in
          </Link>{" "}
          to auto-fill your details and track your order.
        </p>
      )}

      <CheckoutForm
        user={
          user
            ? { name: user.name, email: user.email, phone: user.phone ?? "" }
            : null
        }
      />
    </div>
  );
}
