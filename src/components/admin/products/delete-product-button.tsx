"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteProduct } from "@/app/(admin)/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();

  const run = async () => {
    const result = await deleteProduct(id);
    if (result.ok) {
      toast.success(result.message ?? "Product deleted");
      router.push("/admin/products");
      router.refresh();
    } else {
      toast.error(result.error ?? "Could not delete the product");
    }
  };

  return (
    <ConfirmButton
      title={`Delete ${name}?`}
      description={
        "Products with order history are only deactivated — otherwise the product and its variants are removed for good."
      }
      confirmLabel="Delete product"
      onConfirm={run}
    >
      <Trash2 className="size-3.5" aria-hidden />
      Delete
    </ConfirmButton>
  );
}
