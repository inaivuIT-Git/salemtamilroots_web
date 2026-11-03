"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { ProductDetail } from "@/lib/types";
import { discountPercent, rupees } from "@/lib/format";
import { Price } from "@/components/ui/Price";
import { Gallery } from "./Gallery";
import { AddToCartButton } from "./AddToCartButton";

export function BuyBox({ p, children }: { p: ProductDetail; children?: React.ReactNode }) {
  const t = useTranslations("product");
  const locale = useLocale();
  const [vid, setVid] = useState(p.variantId ?? p.variants[0]?.id);
  const [qty, setQty] = useState(1);
  const v = p.variants.find((x) => x.id === vid) ?? p.variants[0];
  const images = v?.images?.length ? v.images : p.images;
  const save = v?.mrp ? v.mrp - v.price : 0;
  const low = v?.inStock && v.stock !== undefined && v.stock > 0 && v.stock <= 5;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
      <Gallery images={images} name={p.name} />

      <div className="flex flex-col gap-6">
        {children}

        <div className="flex flex-col gap-2 rounded-[var(--radius-card)] bg-paper p-5 shadow-[var(--shadow-card)]">
          <Price price={v?.price ?? p.price} mrp={v?.mrp} size="lg" />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {save > 0 && <span className="font-semibold text-kumkum-600">{t("save", { amount: rupees(save, locale) })}</span>}
            <span className="text-muted">{t("taxNote")}</span>
          </div>
        </div>

        {p.variants.length > 1 && (
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 font-semibold">{t("chooseSize")}</legend>
            <div className="flex flex-wrap gap-3">
              {p.variants.map((x) => {
                const on = x.id === v?.id;
                const off = discountPercent(x.price, x.mrp);
                return (
                  <button
                    key={x.id}
                    type="button"
                    onClick={() => {
                      setVid(x.id);
                      setQty(1);
                    }}
                    aria-pressed={on}
                    className={`relative flex min-w-24 flex-col items-start rounded-2xl border-2 px-4 py-2.5 text-left transition ${
                      on ? "border-forest-800 bg-leaf-100" : "border-line bg-paper hover:border-forest-600"
                    } ${x.inStock ? "" : "opacity-55"}`}
                  >
                    <span className="font-semibold">{x.label}</span>
                    <span className="text-sm text-muted tabular-nums">{rupees(x.price, locale)}</span>
                    {off > 0 && (
                      <span className="absolute -top-2.5 -right-2 rounded-full bg-kumkum-600 px-1.5 py-0.5 text-[10px] font-bold text-white">-{off}%</span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <span className="font-semibold">{t("quantity")}</span>
            <div className="flex items-center rounded-full border-2 border-line bg-paper">
              <button type="button" className="size-10 text-xl font-semibold text-forest-800 disabled:opacity-30" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="−">
                −
              </button>
              <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">
                {qty}
              </span>
              <button
                type="button"
                className="size-10 text-xl font-semibold text-forest-800 disabled:opacity-30"
                onClick={() => setQty((q) => Math.min(q + 1, v?.stock && v.stock > 0 ? Math.min(v.stock, 20) : 20))}
                disabled={!!v?.stock && qty >= Math.min(v.stock, 20)}
                aria-label="+"
              >
                +
              </button>
            </div>
            <span className={`text-sm font-semibold ${v?.inStock ? (low ? "text-turmeric-600" : "text-forest-600") : "text-kumkum-600"}`}>
              {v?.inStock ? (low ? t("fewLeft", { count: v!.stock! }) : t("inStock")) : t("outOfStock")}
            </span>
          </div>
          {v && (
            <AddToCartButton
              disabled={!v.inStock}
              line={{ variantId: v.id, productId: p.id, slug: p.slug, name: p.name, variantLabel: v.label, image: images[0], price: v.price, qty }}
            />
          )}
          <p className="text-sm text-muted">{t("cartNote")}</p>
        </div>
      </div>
    </div>
  );
}
