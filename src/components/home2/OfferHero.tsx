import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ProductDetail } from "@/lib/types";
import { discountPercent, rupees } from "@/lib/format";
import { Rating } from "@/components/ui/Rating";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ArrowIcon } from "@/components/ui/icons";

/*
  Product-led hero: one real product with its price, rating and an Add to cart button,
  so a visitor can buy from the first screen. No auto-rotating carousel.
*/
export function OfferHero({ p }: { p: ProductDetail }) {
  const t = useTranslations("home2");
  const locale = useLocale();
  const v = p.variants.find((x) => x.id === p.variantId) ?? p.variants[0];
  const off = discountPercent(v?.price ?? p.price, v?.mrp);
  const oneLine = p.story.find((s) => s.key === "oneLine")?.html;

  return (
    <section className="relative overflow-hidden bg-forest-900 text-white">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_40%,rgb(227_162_32/0.35),transparent_60%),radial-gradient(50%_60%_at_10%_100%,rgb(47_133_90/0.45),transparent_60%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-2 bg-[repeating-linear-gradient(90deg,var(--color-turmeric-500)_0_18px,var(--color-kumkum-600)_18px_36px,var(--color-leaf-400)_36px_54px)]" />
      <div className="container-x relative grid items-center gap-6 py-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-12 md:py-16 lg:py-20">
        <div className="order-2 flex flex-col gap-5 md:order-1">
          <span className="w-fit rounded-full bg-turmeric-500 px-3 py-1 text-xs font-bold tracking-wider text-forest-950 uppercase">
            {p.ratingCount ? t("heroTagLoved") : t("heroTag")}
          </span>
          <h1 className="font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] font-semibold">{p.name}</h1>
          {oneLine && <div className="strp-prose font-display text-xl text-turmeric-200 italic md:text-2xl" dangerouslySetInnerHTML={{ __html: oneLine }} />}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Rating value={p.rating} count={p.ratingCount} onDark />
            {v?.label && <span className="text-sm text-white/80">{v.label}</span>}
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <span className="font-display text-5xl font-semibold tabular-nums">{rupees(v?.price ?? p.price, locale)}</span>
            {off > 0 && (
              <>
                <span className="pb-1.5 text-xl text-white/60 line-through tabular-nums">{rupees(v!.mrp!, locale)}</span>
                <span className="mb-1.5 rounded-full bg-kumkum-600 px-3 py-1 text-sm font-bold">{t("save", { amount: rupees(v!.mrp! - v!.price, locale) })}</span>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {v && (
              <div className="w-full sm:w-64">
                <AddToCartButton
                  accent
                  disabled={!v.inStock}
                  line={{ variantId: v.id, productId: p.id, slug: p.slug, name: p.name, variantLabel: v.label, image: p.image, price: v.price, qty: 1 }}
                />
              </div>
            )}
            <Link href={`/products/${p.slug}`} className="btn border-2 border-white/40 px-6 py-4 text-white hover:bg-white/10">
              {t("details")} <ArrowIcon className="size-4" />
            </Link>
          </div>
          <p className="text-sm text-white/70">{t("noSignup")}</p>
        </div>

        <div className="relative order-1 mx-auto w-full max-w-[300px] sm:max-w-[420px] md:order-2 md:max-w-[520px]">
          <div aria-hidden className="absolute inset-[6%] rounded-full bg-turmeric-500/25 blur-2xl" />
          <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-paper/95 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)] ring-8 ring-white/10">
            {p.image && <Image src={p.image} alt={p.name} fill priority sizes="(max-width: 768px) 92vw, 520px" className="object-contain p-6" />}
          </div>
          {off > 0 && (
            <div className="absolute -top-3 -right-1 grid size-24 rotate-12 place-items-center rounded-full bg-kumkum-600 text-center font-display leading-none font-semibold shadow-xl md:size-28">
              <span>
                <span className="block text-3xl md:text-4xl">{off}%</span>
                <span className="text-sm tracking-widest uppercase">{t("off")}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
