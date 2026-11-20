"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { signinHref, useAuth } from "@/lib/session";

/*
  Frame for the "My account" pages: who is signed in, the sections, sign out.
  Signed-out visitors are sent to sign in and brought back.
*/
export function AccountShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("account");
  const pathname = usePathname();
  const router = useRouter();
  const { ready, signedIn, me, signOut } = useAuth();

  useEffect(() => {
    if (ready && !signedIn) window.location.replace(signinHref());
  }, [ready, signedIn]);

  const sections = [
    { href: "/account", label: t("navOrders"), active: pathname === "/account" || pathname.startsWith("/account/orders") },
    { href: "/account/wishlist", label: t("navWishlist"), active: pathname.startsWith("/account/wishlist") },
    { href: "/account/addresses", label: t("navAddresses"), active: pathname.startsWith("/account/addresses") },
    { href: "/account/profile", label: t("navProfile"), active: pathname.startsWith("/account/profile") },
  ];

  // OTP sign-up names the account "Customer STR" until the customer gives a name.
  const named = me?.firstName && !(me.firstName === "Customer" && me.lastName === "STR");

  return (
    <div className="container-x pt-8 pb-16">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{t("title")}</p>
          <h1 className="font-display text-3xl font-semibold text-forest-800 sm:text-4xl">
            {named ? t("hello", { name: me!.firstName! }) : t("helloNoName")}
          </h1>
          {me?.phone && <p className="mt-1 text-sm text-muted">+91 {me.phone}</p>}
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-kumkum-600 hover:underline"
          onClick={async () => {
            await signOut();
            router.replace("/");
          }}
        >
          {t("signOut")}
        </button>
      </header>

      <nav aria-label={t("title")} className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            aria-current={s.active ? "page" : undefined}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              s.active ? "bg-forest-800 text-white" : "bg-paper text-forest-800 shadow-[var(--shadow-card)] hover:bg-leaf-100"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </nav>

      {!ready || !signedIn ? <p className="text-muted">{t("loading")}</p> : children}
    </div>
  );
}
