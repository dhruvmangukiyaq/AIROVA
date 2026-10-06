"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine, PriceSummary, AppliedCoupon } from "@/lib/types";
import { computeSummary, type ShippingMethod } from "@/lib/commerce";

const CART_KEY = "airova:cart:v1";
const COUPON_KEY = "airova:coupon:v1";

interface CartContextValue {
  lines: CartLine[];
  ready: boolean;
  count: number;
  summary: PriceSummary;
  coupon: AppliedCoupon | null;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  add: (line: CartLine) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  applyCoupon: (coupon: AppliedCoupon | null) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export const lineKey = (l: Pick<CartLine, "productId" | "color" | "size">) =>
  `${l.productId}|${l.color}|${l.size}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // hydrate from localStorage (an external store — read it off the render path
  // so hydration never triggers a second synchronous render on mount)
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(CART_KEY);
        if (raw) setLines(JSON.parse(raw));
        const rawCoupon = localStorage.getItem(COUPON_KEY);
        if (rawCoupon) setCoupon(JSON.parse(rawCoupon));
      } catch {
        /* corrupt storage → start empty */
      }
      setReady(true);
    });
  }, []);

  // persist
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(lines));
    } catch {
      /* quota exceeded — ignore */
    }
  }, [lines, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      if (coupon) localStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
      else localStorage.removeItem(COUPON_KEY);
    } catch {
      /* ignore */
    }
  }, [coupon, ready]);

  const add = useCallback((line: CartLine) => {
    setLines((prev) => {
      const key = lineKey(line);
      const existing = prev.find((l) => lineKey(l) === key);
      if (existing) {
        return prev.map((l) =>
          lineKey(l) === key ? { ...l, qty: Math.min(10, l.qty + line.qty) } : l,
        );
      }
      return [...prev, line];
    });
    setDrawerOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => lineKey(l) !== key)
        : prev.map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(10, qty) } : l)),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => lineKey(l) !== key));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setCoupon(null);
  }, []);

  const summary = useMemo(
    () => computeSummary(lines, coupon, "STANDARD", false),
    [lines, coupon],
  );

  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);

  const value: CartContextValue = {
    lines,
    ready,
    count,
    summary,
    coupon,
    drawerOpen,
    setDrawerOpen,
    add,
    setQty,
    remove,
    clear,
    applyCoupon: setCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Checkout helper — summary with an explicit shipping method          */
/* ------------------------------------------------------------------ */

export function useSummary(method: ShippingMethod = "STANDARD", cod = false) {
  const { lines, coupon } = useCart();
  return useMemo(
    () => computeSummary(lines, coupon, method, cod),
    [lines, coupon, method, cod],
  );
}
