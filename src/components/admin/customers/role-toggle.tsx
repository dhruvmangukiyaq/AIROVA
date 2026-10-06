"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldUser } from "lucide-react";
import { toast } from "sonner";
import { toggleCustomerRole } from "@/app/(admin)/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";

export function RoleToggle({
  userId,
  role,
  name,
  isSelf,
}: {
  userId: string;
  role: "ADMIN" | "CUSTOMER";
  name: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  if (isSelf) {
    return <p className="text-xs text-cream/40">You cannot change your own role.</p>;
  }

  const promoting = role !== "ADMIN";

  const run = async () => {
    setBusy(true);
    try {
      const result = await toggleCustomerRole(userId);
      if (result.ok) {
        toast.success(result.message ?? "Role updated");
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not change the role");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <ConfirmButton
      title={promoting ? `Make ${name} an admin?` : `Remove admin access from ${name}?`}
      description={
        promoting
          ? "Admins can manage products, orders, customers and content for the whole store."
          : "They will keep their account and orders, but lose access to this control room."
      }
      confirmLabel={promoting ? "Grant admin" : "Revoke admin"}
      variant="gold-outline"
      onConfirm={run}
      disabled={busy}
    >
      {promoting ? (
        <ShieldCheck className="size-3.5" aria-hidden />
      ) : (
        <ShieldUser className="size-3.5" aria-hidden />
      )}
      {promoting ? "Make admin" : "Remove admin"}
    </ConfirmButton>
  );
}
