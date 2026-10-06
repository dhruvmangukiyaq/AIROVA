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

const KEY = "airova:wishlist:v1";

export interface WishlistItem {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  mrp: number;
  colorName: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  ready: boolean;
  has: (id: string) => boolean;
  toggle: (item: WishlistItem) => boolean;
  remove: (id: string) => void;
  clear: () => void;
}

const Ctx = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) setItems(JSON.parse(raw));
      } catch {
        /* ignore */
      }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, ready]);

  const has = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const toggle = useCallback((item: WishlistItem) => {
    let added = false;
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev.filter((i) => i.id !== item.id);
      added = true;
      return [...prev, item];
    });
    return added;
  }, []);

  const remove = useCallback(
    (id: string) => setItems((prev) => prev.filter((i) => i.id !== id)),
    [],
  );
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, ready, has, toggle, remove, clear }),
    [items, ready, has, toggle, remove, clear],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
