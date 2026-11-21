"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./client-api";
import { signinHref, useAuth } from "./session";

/*
  Saved products (the hearts). Kept in the customer's account (/api/account/wishlist), so it
  follows them across devices. A visitor who taps a heart is asked to sign in first and
  brought back to the same page.
*/
type Wishlist = {
  has: (productId: number) => boolean;
  toggle: (productId: number) => Promise<void>;
  count: number;
};

const WishlistContext = createContext<Wishlist | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { signedIn } = useAuth();
  const [ids, setIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!signedIn) {
      setIds(new Set());
      return;
    }
    api<number[]>("/api/account/wishlist/ids")
      .then((list) => setIds(new Set(list)))
      .catch(() => setIds(new Set()));
  }, [signedIn]);

  const toggle = useCallback(
    async (productId: number) => {
      if (!signedIn) {
        window.location.assign(signinHref());
        return;
      }
      const saved = ids.has(productId);
      // Show the change at once; put it back if the API says no.
      setIds((cur) => {
        const next = new Set(cur);
        if (saved) next.delete(productId);
        else next.add(productId);
        return next;
      });
      try {
        const list = await api<number[]>(`/api/account/wishlist/${productId}`, { method: saved ? "DELETE" : "PUT" });
        setIds(new Set(list));
      } catch {
        setIds((cur) => {
          const next = new Set(cur);
          if (saved) next.add(productId);
          else next.delete(productId);
          return next;
        });
      }
    },
    [ids, signedIn],
  );

  const value = useMemo(() => ({ has: (id: number) => ids.has(id), toggle, count: ids.size }), [ids, toggle]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
