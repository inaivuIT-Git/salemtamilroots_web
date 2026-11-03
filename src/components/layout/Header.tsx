"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import { legacy } from "@/lib/site";
import { CartIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from "@/components/ui/icons";

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const other = locale === "en" ? "ta" : "en";

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  const announce = [t("announce.made"), t("announce.millets"), t("announce.secure")];
  const nav = [
    { href: "/", label: t("nav.home"), internal: true },
    { href: legacy.shop, label: t("nav.shop") },
    { href: legacy.about, label: t("nav.about") },
  ];

  return (
    <header className="sticky top-0 z-40" style={{ top: "env(safe-area-inset-top, 0px)" }}>
      <div className="overflow-hidden bg-forest-800 text-turmeric-200">
        <div className="flex w-max animate-marquee gap-12 py-1.5 text-[13px] font-medium">
          {[...announce, ...announce, ...announce, ...announce].map((a, i) => (
            <span key={i} className="flex items-center gap-12 whitespace-nowrap">
              {a}
              <span aria-hidden className="text-turmeric-500">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div
        className={`border-b transition-colors duration-300 ${
          scrolled ? "border-line bg-paper/90 shadow-[0_6px_20px_-14px_rgb(8_68_34/0.45)] backdrop-blur-md" : "border-transparent bg-cream"
        }`}
      >
        <div className="container-x flex h-[68px] items-center gap-4">
          <button
            type="button"
            className="-ml-1 rounded-full p-2 text-forest-800 md:hidden"
            aria-label={t("nav.menu")}
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <MenuIcon className="size-6" />
          </button>

          <Link href="/" className="flex items-center gap-2.5" aria-label="Salem Tamil Roots">
            <Image src="/brand/logo.png" alt="" width={46} height={45} priority className="size-[46px]" />
            <span className="hidden leading-tight sm:block">
              <span className="block font-display text-[19px] font-semibold text-forest-800">Salem Tamil Roots</span>
              <span className="block text-[11px] font-medium tracking-[0.18em] text-forest-600 uppercase">Pure herbal wellness</span>
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Main">
            {nav.map((n) =>
              n.internal ? (
                <Link key={n.href} href={n.href} className="rounded-full px-4 py-2 text-[15px] font-medium text-ink hover:bg-leaf-100">
                  {n.label}
                </Link>
              ) : (
                <a key={n.href} href={n.href} className="rounded-full px-4 py-2 text-[15px] font-medium text-ink hover:bg-leaf-100">
                  {n.label}
                </a>
              ),
            )}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <a href={legacy.shop} className="rounded-full p-2.5 text-forest-800 hover:bg-leaf-100" aria-label={t("nav.search")}>
              <SearchIcon className="size-[22px]" />
            </a>
            <Link
              href={pathname}
              locale={other}
              className="rounded-full border border-forest-800/20 px-3 py-1.5 text-sm font-semibold text-forest-800 hover:bg-leaf-100"
              aria-label={t("nav.languageLabel")}
              lang={other}
            >
              {t("nav.language")}
            </Link>
            <a href={legacy.signin} className="hidden rounded-full p-2.5 text-forest-800 hover:bg-leaf-100 sm:block" aria-label={t("nav.account")}>
              <UserIcon className="size-[22px]" />
            </a>
            <Link href="/cart" className="relative rounded-full bg-forest-800 p-2.5 text-white hover:bg-forest-700" aria-label={t("nav.cart")}>
              <CartIcon className="size-[22px]" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-turmeric-500 px-1 text-[11px] font-bold text-forest-950 tabular-nums">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-forest-950/50" aria-label={t("nav.close")} onClick={() => setOpen(false)} />
          <div
            className="absolute inset-y-0 left-0 flex w-[82%] max-w-sm flex-col gap-2 bg-paper p-5"
            style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 20px)", paddingLeft: "max(20px, env(safe-area-inset-left, 0px))" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <Image src="/brand/logo.png" alt="Salem Tamil Roots" width={52} height={50} />
              <button className="rounded-full p-2 text-forest-800" aria-label={t("nav.close")} onClick={() => setOpen(false)}>
                <CloseIcon className="size-6" />
              </button>
            </div>
            {nav.map((n) =>
              n.internal ? (
                <Link key={n.href} href={n.href} className="rounded-xl px-3 py-3 text-lg font-medium hover:bg-leaf-100">
                  {n.label}
                </Link>
              ) : (
                <a key={n.href} href={n.href} className="rounded-xl px-3 py-3 text-lg font-medium hover:bg-leaf-100">
                  {n.label}
                </a>
              ),
            )}
            <a href={legacy.signin} className="rounded-xl px-3 py-3 text-lg font-medium hover:bg-leaf-100">
              {t("nav.account")}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
