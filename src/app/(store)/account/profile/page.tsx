import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAccount } from "@/actions/common";
import { db } from "@/lib/db";
import { destroySession } from "@/lib/auth";
import { AccountHeading } from "@/components/account/account-heading";
import { ProfileForms } from "@/components/account/profile-forms";

export const metadata: Metadata = {
  title: "Profile & security",
  description: "Update your name, mobile number and password for AIROVA FOOTWEAR.",
  alternates: { canonical: "/account/profile" },
};

export default async function ProfilePage() {
  const session = await requireAccount("/account/profile");

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { name: true, email: true, phone: true, createdAt: true },
  });
  if (!user) {
    // The cookie outlived the account (deleted user): drop the stale session
    // so the visitor can sign in again instead of looping between pages.
    await destroySession();
    redirect("/account/login");
  }

  const since = new Date(user.createdAt).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <AccountHeading
        eyebrow="Profile & security"
        title="Your account"
        description={`Member since ${since}. Keep your contact details and password up to date.`}
      />
      <ProfileForms
        values={{ name: user.name, email: user.email, phone: user.phone ?? "" }}
      />
    </>
  );
}
