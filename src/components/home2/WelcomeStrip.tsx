"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSession, signinHref } from "@/lib/session";
import { rupees } from "@/lib/format";

// One line under the header that changes with who is visiting.
export function WelcomeStrip({ giftActive, giftMin }: { giftActive: boolean; giftMin?: number }) {
  const t = useTranslations("home2");
  const locale = useLocale();
  const s = useSession();
  if (!s) return <div className="h-11 bg-turmeric-100" aria-hidden />; // keeps the layout steady while reading

  let text: string;
  let cta: { href: string; label: string } | null;
  if (s.signedIn) {
    const g = s.welcomeGift;
    if (g?.available) {
      const names = (g.products ?? []).map((p) => p.productName).filter(Boolean).join(", ");
      text = t("stripGiftWaiting", { items: names || t("aGift"), min: rupees(g.minimumOrderAmount ?? giftMin ?? 0, locale) });
    } else text = t("stripWelcomeBack");
    cta = { href: "/orders.html", label: t("myOrders") };
  } else if (giftActive) {
    text = giftMin ? t("stripGiftGuestMin", { min: rupees(giftMin, locale) }) : t("stripGiftGuest");
    cta = { href: signinHref(), label: t("signupMobile") };
  } else {
    text = t("stripGuest");
    cta = { href: signinHref(), label: t("signin") };
  }
  return (
    <div className="bg-turmeric-100 text-forest-950">
      <div className="container-x flex min-h-11 flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2 text-center text-sm font-medium">
        <span>
          <span aria-hidden>🎁 </span>
          {text}
        </span>
        {cta && (
          <a href={cta.href} className="rounded-full bg-forest-800 px-3.5 py-1 text-xs font-semibold text-white hover:bg-forest-700">
            {cta.label} →
          </a>
        )}
      </div>
    </div>
  );
}

