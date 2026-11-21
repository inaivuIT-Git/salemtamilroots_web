"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession, signinHref } from "@/lib/session";
import { rupees } from "@/lib/format";
import { CloseIcon } from "@/components/ui/icons";

const KEY = "str_gift_nudge_closed";

/*
  A small card, not a blocking pop-up: appears for guests while the welcome gift is on,
  after they scroll past the first screen or spend 15 seconds, and stays closed once dismissed.
*/
export function GiftNudge({ giftActive, giftMin }: { giftActive: boolean; giftMin?: number }) {
  const t = useTranslations("home2");
  const locale = useLocale();
  const s = useSession();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!giftActive || !s || s.signedIn) return;
    try {
      if (window.localStorage.getItem(KEY)) return;
    } catch {
      /* ignore */
    }
    const open = () => setShow(true);
    const timer = window.setTimeout(open, 15000);
    const onScroll = () => window.scrollY > window.innerHeight * 0.9 && open();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [giftActive, s]);

  if (!show) return null;
  const close = () => {
    setShow(false);
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  };
  return (
    <aside
      role="dialog"
      aria-label={t("nudgeTitle")}
      className="fixed z-40 w-[min(360px,calc(100vw-32px))] animate-rise rounded-[1.5rem] bg-paper p-5 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.45)] ring-1 ring-line"
      style={{ right: "max(16px, env(safe-area-inset-right, 0px))", bottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}
    >
      <button type="button" onClick={close} aria-label={t("close")} className="absolute top-3 right-3 rounded-full p-1.5 text-muted hover:bg-leaf-100">
        <CloseIcon className="size-5" />
      </button>
      <p className="pr-8 font-display text-xl font-semibold text-forest-800">🎁 {t("nudgeTitle")}</p>
      <p className="mt-1.5 text-sm text-muted">{giftMin ? t("nudgeTextMin", { min: rupees(giftMin, locale) }) : t("nudgeText")}</p>
      <a href={signinHref()} onClick={close} className="btn btn-primary mt-4 w-full">
        {t("signupMobile")}
      </a>
    </aside>
  );
}
