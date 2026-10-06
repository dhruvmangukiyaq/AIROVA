import type { Metadata } from "next";
import { requireAccount } from "@/actions/common";
import { db } from "@/lib/db";
import { AccountHeading } from "@/components/account/account-heading";
import { AddressManager, type AddressDTO } from "@/components/account/address-manager";

export const metadata: Metadata = {
  title: "Saved addresses",
  description: "Manage the delivery addresses saved to your AIROVA FOOTWEAR account.",
  alternates: { canonical: "/account/addresses" },
};

export default async function AddressesPage() {
  const session = await requireAccount("/account/addresses");

  const rows = await db.address.findMany({
    where: { userId: session.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  const addresses: AddressDTO[] = rows.map((row) => ({
    id: row.id,
    label: row.label,
    name: row.name,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    isDefault: row.isDefault,
  }));

  const count = addresses.length;

  return (
    <>
      <AccountHeading
        eyebrow="Address book"
        title="Your addresses"
        description={
          count
            ? `${count} saved address${count === 1 ? "" : "es"} — the default one is pre-selected at checkout.`
            : "Save your go-to delivery addresses once and check out without retyping them."
        }
      />
      <AddressManager addresses={addresses} />
    </>
  );
}
