"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useSession, signinHref } from "@/lib/session";
import { rupees } from "@/lib/format";
import { CheckIcon } from "@/components/ui/icons";

// Why to register, for guests only. Sign-up is one mobile OTP on the current site's sign-in page.
export function SignupBand({ giftActive, giftMin }: { giftActive: boolean; giftMin?: number }) {
  const t = useTranslations("home2");
  const locale = useLocale();
  const s = useSession();
  if (!s || s.signedIn) return null;
  const points = [
    ...(giftActive ? [giftMin ? t("signupGiftMin", { min: rupees(giftMin, locale) }) : t("signupGift")] : []),
    t("signupOtp"),
    t("signupTrack"),
    t("signupFaster"),
  ];
  return (
    <section className="container-x mt-20">
      <div className="grid overflow-hidden rounded-[2rem] bg-gradient-to-br from-kumkum-700 via-kumkum-600 to-[#b8471c] text-white shadow-[var(--shadow-lift)] md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5 p-8 md:p-12">
          <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wider uppercase">{t("signupEyebrow")}</span>
          <h2 className="font-display text-3xl leading-tight font-semibold md:text-5xl">{giftActive ? t("signupTitleGift") : t("signupTitle")}</h2>
          <ul className="flex flex-col gap-2.5">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[17px]">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-turmeric-500 text-forest-950">
                  <CheckIcon className="size-3.5" />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <a href={signinHref()} className="btn btn-accent px-7 py-4 text-base">
              {t("signupMobile")} →
            </a>
            <span className="text-sm text-white/80">{t("signupSmall")}</span>
          </div>
        </div>
        <div className="relative min-h-[300px] bg-kumkum-700/40">
          <Image src="/brand/welcome-gift.webp" alt="" fill sizes="(max-width: 768px) 100vw, 480px" className="object-cover object-[center_45%]" />
        </div>
      </div>
    </section>
  );
}
