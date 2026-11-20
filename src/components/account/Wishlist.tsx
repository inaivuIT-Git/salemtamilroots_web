"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { api, ApiError } from "@/lib/client-api";
import { useWishlist } from "@/lib/wishlist";
import { Price } from "@/components/ui/Price";
import { AddToCartButton } from "@/components/product/AddToCartButton";

type Saved = { productId: number; name: string; slug: string; image?: string | null; price: number; mrp?: number | null; weight?: number | null; unit?: string | null; inStock: boolean };

export function Wishlist() {
  const t = useTranslations("account");
  const locale = useLocale();
  const { toggle } = useWishlist();
  const [items, setItems] = useState<Saved[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Saved[]>("/api/account/wishlist")
      .then(setItems)
      .catch((e) => setError(e instanceof ApiError ? e.message : t("errLoad")));
  }, [t]);

  if (error) return <p className="text-kumkum-700">{error}</p>;
  if (!items) return <p className="text-muted">{t("loading")}</p>;
  if (items.length === 0)
    return (
      <div className="flex flex-col items-start gap-4 rounded-[2rem] bg-paper p-8 shadow-[var(--shadow-card)]">
        <p className="text-lg">{t("wishlistEmpty")}</p>
        <Link href="/shop" className="btn btn-primary">{t("shop")}</Link>
      </div>
    );

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((i) => {
        const label = i.weight ? `${Number(i.weight)} ${(i.unit ?? "").toLowerCase()}`.trim() : undefined;
        return (
          <li key={i.productId} className="flex gap-4 rounded-[var(--radius-card)] bg-paper p-4 shadow-[var(--shadow-card)]">
            <Link href={`/products/${i.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-leaf-100">
              <Image src={i.image || "/brand/logo.png"} alt="" fill sizes="96px" className="object-contain p-2" unoptimized />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Link href={`/products/${i.slug}`} className="line-clamp-2 font-semibold hover:text-forest-700">{i.name}</Link>
              {label && <span className="text-sm text-muted">{label}</span>}
              <Price price={i.price} mrp={i.mrp ?? undefined} />
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-1">
                <AddToCartButton
                  compact
                  disabled={!i.inStock}
                  line={{ variantId: i.productId, productId: i.productId, slug: i.slug, name: i.name, variantLabel: label, image: i.image ?? undefined, price: i.price, qty: 1 }}
                />
                <button
                  type="button"
                  className="text-sm font-semibold text-kumkum-600 hover:underline"
                  onClick={async () => {
                    await toggle(i.productId);
                    setItems((cur) => cur?.filter((x) => x.productId !== i.productId) ?? null);
                  }}
                >
                  {t("delete")}
                </button>
              </div>
              {!i.inStock && <span className="text-xs font-semibold text-kumkum-600" lang={locale}>{t("outOfStock")}</span>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
