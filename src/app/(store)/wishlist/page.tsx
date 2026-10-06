import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/wishlist-view";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "The AIROVA pairs you've saved for later.",
  alternates: { canonical: "/wishlist" },
  robots: { index: false },
};

export default function WishlistPage() {
  return (
    <div className="shell pb-24 pt-10 sm:pb-32 sm:pt-14">
      <header className="mb-8 border-b border-ink pb-6">
        <p className="eyebrow">Saved for later</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Wishlist</h1>
      </header>
      <WishlistView />
    </div>
  );
}
