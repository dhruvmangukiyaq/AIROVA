import type { Metadata } from "next";
import { requireAccount } from "@/actions/common";
import { db } from "@/lib/db";
import { AccountHeading } from "@/components/account/account-heading";
import { WishlistView } from "@/components/account/wishlist-view";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "The pairs you have saved at AIROVA FOOTWEAR, ready to move into your bag.",
  alternates: { canonical: "/account/wishlist" },
};

export default async function WishlistPage() {
  const session = await requireAccount("/account/wishlist");
  const saved = await db.wishlist.count({ where: { userId: session.id } });

  return (
    <>
      <AccountHeading
        eyebrow="Saved for later"
        title="Your wishlist"
        description={
          saved
            ? `${saved} pair${saved === 1 ? "" : "s"} saved on this account. Move anything straight into your bag when you are ready.`
            : "Anything you heart on the shop lands here — sign in anywhere and it follows you."
        }
      />
      <WishlistView />
    </>
  );
}
