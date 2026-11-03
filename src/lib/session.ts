"use client";

import { useEffect, useState } from "react";

/*
  Sign-in state written by the current site's login pages (signin.js, otp.js, googleLogin.js).
  They use sessionStorage, so it is only visible in the tab where the customer signed in.
*/
export type WelcomeGiftInfo = {
  available: boolean;
  minimumOrderAmount?: number;
  giftValue?: number;
  products?: { productName?: string }[];
};
export type Session = { signedIn: boolean; userType?: string; welcomeGift?: WelcomeGiftInfo };

export function useSession(): Session | null {
  const [s, setS] = useState<Session | null>(null); // null until read on the client
  useEffect(() => {
    try {
      const token = window.sessionStorage.getItem("token");
      const userId = window.sessionStorage.getItem("userId");
      let welcomeGift: WelcomeGiftInfo | undefined;
      try {
        welcomeGift = JSON.parse(window.sessionStorage.getItem("welcomeGift") ?? "null") ?? undefined;
      } catch {
        welcomeGift = undefined;
      }
      setS({ signedIn: !!(token && userId), userType: window.sessionStorage.getItem("userType") ?? undefined, welcomeGift });
    } catch {
      setS({ signedIn: false });
    }
  }, []);
  return s;
}

/** Sign-in page of the current site; brings the visitor back here afterwards. */
export function signinHref() {
  if (typeof window === "undefined") return "/signin.html";
  return `/signin.html?returnUrl=${encodeURIComponent(window.location.href)}`;
}
