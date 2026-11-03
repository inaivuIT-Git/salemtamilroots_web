"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/*
  Guest cart kept on this device (localStorage). Visitors can shop without signing in;
  the planned API merge endpoint moves it into their account at checkout.
*/
export type CartLine = {
  variantId: number;
  productId: number;
  slug: string;
  name: string;
  variantLabel?: string;
  image?: string;
  price: number;
  qty: number;
};

type CartState = {
  lines: CartLine[];
  count: number;
  add: (line: CartLine) => void;
  setQty: (variantId: number, qty: number) => void;
  remove: (variantId: number) => void;
  lastAdded: CartLine | null;
};

const KEY = "str_guest_cart_v1";
const CartContext = createContext<CartState | null>(null);

function read(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [lastAdded, setLastAdded] = useState<CartLine | null>(null);

  useEffect(() => {
    setLines(read());
    const onStorage = (e: StorageEvent) => e.key === KEY && setLines(read());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: CartLine[]) => {
    setLines(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* private mode: the cart still works for this visit */
    }
  }, []);

  const add = useCallback(
    (line: CartLine) => {
      const current = read();
      const found = current.find((l) => l.variantId === line.variantId);
      const next = found
        ? current.map((l) => (l.variantId === line.variantId ? { ...l, qty: Math.min(l.qty + line.qty, 20) } : l))
        : [...current, line];
      persist(next);
      setLastAdded(line);
    },
    [persist],
  );

  const setQty = useCallback(
    (variantId: number, qty: number) =>
      persist(read().map((l) => (l.variantId === variantId ? { ...l, qty: Math.max(1, Math.min(qty, 20)) } : l))),
    [persist],
  );

  const remove = useCallback((variantId: number) => persist(read().filter((l) => l.variantId !== variantId)), [persist]);

  const value = useMemo(
    () => ({ lines, count: lines.reduce((n, l) => n + l.qty, 0), add, setQty, remove, lastAdded }),
    [lines, add, setQty, remove, lastAdded],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
