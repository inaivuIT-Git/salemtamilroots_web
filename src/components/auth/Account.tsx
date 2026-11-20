"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { signinHref, useAuth } from "@/lib/session";

/* Minimal account page for now: who is signed in, and sign out. Orders and addresses come next. */
export function Account() {
  const t = useTranslations("account");
  const router = useRouter();
  const { ready, signedIn, me, signOut } = useAuth();

  useEffect(() => {
    if (ready && !signedIn) window.location.replace(signinHref());
  }, [ready, signedIn]);

  if (!ready || !me) return <div className="container-x pt-8 text-muted">{t("loading")}</div>;

  // OTP sign-up creates the account as "Customer STR" until the customer gives a name.
  const named = me.firstName && !(me.firstName === "Customer" && me.lastName === "STR");
  return (
    <div className="container-x flex justify-center pt-8 pb-16">
      <div className="flex w-full max-w-lg flex-col gap-5 rounded-[2rem] bg-paper p-7 shadow-[var(--shadow-lift)] sm:p-9">
        <h1 className="font-display text-3xl font-semibold text-forest-800">{named ? t("hello", { name: me.firstName! }) : t("title")}</h1>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          {me.phone && (
            <>
              <dt className="text-muted">{t("mobile")}</dt>
              <dd className="font-semibold">+91 {me.phone}</dd>
            </>
          )}
          {me.email && (
            <>
              <dt className="text-muted">{t("email")}</dt>
              <dd className="font-semibold">{me.email}</dd>
            </>
          )}
        </dl>
        <p className="text-sm text-muted">{t("ordersSoon")}</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/shop" className="btn btn-primary">{t("shop")}</Link>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={async () => {
              await signOut();
              router.replace("/");
            }}
          >
            {t("signOut")}
          </button>
        </div>
      </div>
    </div>
  );
}
