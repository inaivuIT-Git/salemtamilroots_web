"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { readRecent, type RecentItem } from "@/lib/recent";
import { rupees } from "@/lib/format";

// Shown only to returning visitors who have looked at products on this device.
export function RecentlyViewed() {
  const t = useTranslations("home2");
  const locale = useLocale();
  const [items, setItems] = useState<RecentItem[]>([]);
  useEffect(() => setItems(readRecent().slice(0, 8)), []);
  if (!items.length) return null;
  return (
    <section className="container-x mt-12">
      <h2 className="mb-4 font-display text-2xl font-semibold text-forest-800">{t("recentTitle")}</h2>
      <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {items.map((p) => (
          <li key={p.slug} className="shrink-0">
            <Link href={`/products/${p.slug}`} className="flex w-64 items-center gap-3 rounded-2xl bg-paper p-2.5 pr-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lift)]">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-leaf-100">
                {p.image && <Image src={p.image} alt="" fill sizes="64px" className="object-contain p-1" />}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-semibold">{p.name}</span>
                <span className="text-sm text-muted tabular-nums">
                  {rupees(p.price, locale)}
                  {p.variantLabel ? ` · ${p.variantLabel}` : ""}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
