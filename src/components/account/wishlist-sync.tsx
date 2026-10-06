"use client";

import { useEffect, useRef } from "react";
import { syncWishlist } from "@/actions/account";
import { useWishlist } from "@/store/wishlist";

/**
 * Mirrors the localStorage wishlist into the signed-in account so the
 * overview's wishlist stat survives across devices. Merge-only on the
 * server, debounced here, and completely silent on failure.
 */
export function WishlistSync() {
  const { items, ready } = useWishlist();
  const ids = items.map((i) => i.id).join(",");
  const synced = useRef("");

  useEffect(() => {
    if (!ready || !ids || ids === synced.current) return;
    const timer = setTimeout(() => {
      synced.current = ids;
      void syncWishlist(ids.split(",").map((productId) => ({ productId }))).catch(() => {});
    }, 600);
    return () => clearTimeout(timer);
  }, [ids, ready]);

  return null;
}
