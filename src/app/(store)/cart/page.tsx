import type { Metadata } from "next";
import { getBestSellers } from "@/lib/catalog";
import { CartPage } from "@/components/cart/cart-page";

export const metadata: Metadata = {
  title: "Your bag",
  description: "Review the pairs in your AIROVA bag and head to secure checkout.",
  alternates: { canonical: "/cart" },
  robots: { index: false },
};

export default async function CartRoute() {
  const suggestions = await getBestSellers(4);

  return (
    <div className="shell pb-24 pt-10 sm:pb-32 sm:pt-14">
      <header className="mb-8 border-b border-ink pb-6">
        <p className="eyebrow">Your selection</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Shopping bag</h1>
      </header>

      <CartPage suggestions={suggestions} />
    </div>
  );
}
