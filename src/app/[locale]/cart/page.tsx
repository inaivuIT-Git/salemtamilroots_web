"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import { rupees } from "@/lib/format";
import { legacy } from "@/lib/site";

export default function CartPage() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { lines, count, setQty, remove } = useCart();
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);

  return (
    <div className="container-x pt-8">
      <h1 className="mb-8 font-display text-4xl font-semibold text-forest-800">{t("title")}</h1>
      {lines.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-[2rem] bg-paper p-10 shadow-[var(--shadow-card)]">
          <p className="text-lg">{t("empty")}</p>
          <a href={legacy.shop} className="btn btn-primary">
            {t("continue")}
          </a>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <ul className="flex flex-col gap-4">
            {lines.map((l) => (
              <li key={l.variantId} className="flex gap-4 rounded-[var(--radius-card)] bg-paper p-4 shadow-[var(--shadow-card)]">
                <Link href={`/products/${l.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-leaf-100">
                  <Image src={l.image ?? "/brand/logo.png"} alt="" fill sizes="96px" className="object-contain p-2" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Link href={`/products/${l.slug}`} className="font-semibold hover:text-forest-700">
                    {l.name}
                  </Link>
                  {l.variantLabel && <span className="text-sm text-muted">{l.variantLabel}</span>}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center rounded-full border-2 border-line">
                      <button type="button" className="size-9 font-semibold" onClick={() => setQty(l.variantId, l.qty - 1)} aria-label="−">
                        −
                      </button>
                      <span className="w-7 text-center font-semibold tabular-nums">{l.qty}</span>
                      <button type="button" className="size-9 font-semibold" onClick={() => setQty(l.variantId, l.qty + 1)} aria-label="+">
                        +
                      </button>
                    </div>
                    <span className="font-bold text-forest-800 tabular-nums">{rupees(l.price * l.qty, locale)}</span>
                    <button type="button" className="text-sm font-semibold text-kumkum-600 hover:underline" onClick={() => remove(l.variantId)}>
                      {t("remove")}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="flex h-fit flex-col gap-4 rounded-[var(--radius-card)] bg-forest-800 p-6 text-leaf-100 lg:sticky lg:top-32">
            <div className="flex items-baseline justify-between">
              <span>
                {t("subtotal")} · {t("items", { count })}
              </span>
              <span className="text-2xl font-bold text-white tabular-nums">{rupees(subtotal, locale)}</span>
            </div>
            <button type="button" disabled className="btn btn-accent w-full opacity-60">
              {t("checkout")}
            </button>
            <p className="text-sm text-leaf-200">{t("checkoutSoon")}</p>
          </aside>
        </div>
      )}
    </div>
  );
}
