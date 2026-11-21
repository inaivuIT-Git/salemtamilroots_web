"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "./client-api";

/*
  Who is signed in. The API keeps the sign-in in an HttpOnly cookie; this asks GET /api/Auth/me
  once per page load and after signing in or out.

  The welcome gift offered at sign-up comes back only from the sign-in call, so it is kept in
  sessionStorage for the home page banners (as on the current site).
*/
export type WelcomeGiftInfo = {
  available: boolean;
  minimumOrderAmount?: number;
  giftValue?: number;
  giftName?: string;
  products?: { productName?: string }[];
};

export type Me = {
  userId: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
};

export type Session = {
  /** false until the first check has answered */
  ready: boolean;
  signedIn: boolean;
  me: Me | null;
  welcomeGift?: WelcomeGiftInfo;
  refresh: () => Promise<Me | null>;
  signOut: () => Promise<void>;
};

const GIFT_KEY = "str_welcome_gift";
const SessionContext = createContext<Session | null>(null);

function readGift(): WelcomeGiftInfo | undefined {
  try {
    return JSON.parse(window.sessionStorage.getItem(GIFT_KEY) ?? "null") ?? undefined;
  } catch {
    return undefined;
  }
}

export function rememberWelcomeGift(gift: WelcomeGiftInfo | null | undefined) {
  try {
    if (gift) window.sessionStorage.setItem(GIFT_KEY, JSON.stringify(gift));
    else window.sessionStorage.removeItem(GIFT_KEY);
  } catch {
    /* storage blocked: the banners just won't show the gift */
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [welcomeGift, setGift] = useState<WelcomeGiftInfo | undefined>(undefined);

  const refresh = useCallback(async () => {
    let who: Me | null = null;
    try {
      who = await api<Me>("/api/Auth/me");
    } catch (e) {
      if (!(e instanceof ApiError) || (e.status !== 401 && e.status !== 403)) console.warn("[session]", e);
      who = null;
    }
    setMe(who);
    setGift(who ? readGift() : undefined);
    setReady(true);
    return who;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api("/api/Auth/logout", { method: "POST" });
    } finally {
      rememberWelcomeGift(null);
      setMe(null);
      setGift(undefined);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ ready, signedIn: !!me, me, welcomeGift, refresh, signOut }),
    [ready, me, welcomeGift, refresh, signOut],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useAuth(): Session {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useAuth must be used inside SessionProvider");
  return ctx;
}

/** Older shape used by the home page banners: null until known. */
export function useSession(): { signedIn: boolean; userType?: string; welcomeGift?: WelcomeGiftInfo } | null {
  const s = useAuth();
  if (!s.ready) return null;
  return { signedIn: s.signedIn, userType: s.me?.role ?? undefined, welcomeGift: s.welcomeGift };
}

/** The sign-in page, coming back to where the visitor is (or `next`). */
export function signinHref(next?: string) {
  if (typeof window === "undefined") return "/signin";
  const path = window.location.pathname;
  const prefix = path === "/ta" || path.startsWith("/ta/") ? "/ta" : "";
  const back = next ?? path + window.location.search;
  return `${prefix}/signin?next=${encodeURIComponent(back)}`;
}
