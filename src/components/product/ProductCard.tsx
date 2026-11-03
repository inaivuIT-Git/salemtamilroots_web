import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { ProductSummary } from "@/lib/types";
import { discountPercent } from "@/lib/format";
import { Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { AddToCartButton } from "./AddToCartButton";

const tints = ["bg-leaf-100", "bg-turmeric-100", "bg-tan-200/60", "bg-kumkum-100/70"];

export function ProductCard({ p, index = 0, badge }: { p: ProductSummary; index?: number; badge?: string }) {
  const off = discountPercent(p.price, p.mrp);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-paper shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
      <Link href={`/products/${p.slug}`} className="absolute inset-0 z-10" aria-label={p.name} />
      <div className={`relative aspect-square overflow-hidden ${tints[index % tints.length]}`}>
        {p.image ? (
          <Image
            src={p.image}
            alt=""
            fill
            sizes="(max-width: 640px) 70vw, (max-width: 1024px) 33vw, 280px"
            className="object-contain p-5 transition duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <Image src="/brand/logo.png" alt="" fill className="object-contain p-14 opacity-40" />
        )}
        {(badge || off > 0) && (
          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
            {badge && <span className="rounded-full bg-turmeric-500 px-2.5 py-1 text-xs font-bold text-forest-950 shadow">{badge}</span>}
            {off > 0 && <span className="rounded-full bg-kumkum-600 px-2.5 py-1 text-xs font-bold text-white">-{off}%</span>}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {p.categoryName && <span className="text-xs font-semibold tracking-wide text-forest-600 uppercase">{p.categoryName}</span>}
        <h3 className="line-clamp-2 min-h-[2.8em] font-semibold leading-snug text-ink">{p.name}</h3>
        {p.variantLabel && <span className="text-sm text-muted">{p.variantLabel}</span>}
        <Rating value={p.rating} count={p.ratingCount} small />
        <div className="mt-auto flex flex-col gap-3 pt-2">
          <Price price={p.price} mrp={p.mrp} />
          {p.variantId ? (
            <div className="relative z-20">
              <AddToCartButton
                compact
                disabled={!p.inStock}
                line={{ variantId: p.variantId, productId: p.id, slug: p.slug, name: p.name, variantLabel: p.variantLabel, image: p.image, price: p.price, qty: 1 }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
