import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getBestSellers, getProduct } from "@/lib/api";
import { htmlToParagraphs } from "@/lib/text";
import { legacy } from "@/lib/site";
import { BuyBox } from "@/components/product/BuyBox";
import { ProductRail } from "@/components/product/ProductRail";
import { Rating } from "@/components/ui/Rating";
import { SectionHeader } from "@/components/ui/SectionHeader";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await getProduct(slug, locale);
  if (!p) return {};
  const description = htmlToParagraphs(p.description).join(" ").slice(0, 160) || undefined;
  return {
    title: p.name,
    description,
    alternates: { canonical: locale === "ta" ? `/ta/products/${slug}` : `/products/${slug}` },
    openGraph: { title: p.name, description, images: p.image ? [{ url: p.image }] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [p, t, best] = await Promise.all([getProduct(slug, locale), getTranslations("product"), getBestSellers()]);
  if (!p) notFound();
  const paragraphs = htmlToParagraphs(p.description);
  const related = best.filter((x) => x.name !== p.name).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: p.images,
    description: paragraphs.join(" ") || undefined,
    brand: { "@type": "Brand", name: "Salem Tamil Roots" },
    aggregateRating: p.rating && p.ratingCount ? { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.ratingCount } : undefined,
    offers: p.variants.map((v) => ({
      "@type": "Offer",
      priceCurrency: "INR",
      price: v.price,
      availability: v.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    })),
  };

  return (
    <div className="container-x pt-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-forest-700">
              {t("breadcrumbHome")}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <a href={legacy.shop} className="hover:text-forest-700">
              {t("breadcrumbShop")}
            </a>
          </li>
          <li aria-hidden>/</li>
          <li className="font-medium text-ink" aria-current="page">
            {p.name}
          </li>
        </ol>
      </nav>

      <BuyBox p={p}>
        <div className="flex flex-col gap-3">
          {p.categoryName && <span className="eyebrow">{p.categoryName}</span>}
          <h1 className="font-display text-4xl leading-tight font-semibold text-forest-800 md:text-5xl">{p.name}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Rating value={p.rating} count={p.ratingCount} />
            {p.sellerName && (
              <span className="text-sm text-muted">
                {t("soldBy")} <span className="font-semibold text-ink">{p.sellerName}</span>
              </span>
            )}
          </div>
        </div>
      </BuyBox>

      {paragraphs.length > 0 && (
        <section className="mt-16 grid gap-6 rounded-[2rem] bg-paper p-8 shadow-[var(--shadow-card)] md:grid-cols-[260px_1fr] md:p-12">
          <h2 className="font-display text-3xl font-semibold text-forest-800">{t("description")}</h2>
          <div className="flex max-w-[68ch] flex-col gap-4 text-[17px] leading-relaxed">
            {paragraphs.map((x, i) => (
              <p key={i}>{x}</p>
            ))}
          </div>
        </section>
      )}

      <section id="reviews" className="mt-16 scroll-mt-28">
        <SectionHeader title={t("reviews")} />
        {p.reviews.length ? (
          <ul className="grid gap-5 md:grid-cols-2">
            {p.reviews.map((r) => (
              <li key={r.id} className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-paper p-6 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{r.author}</span>
                  <Rating value={r.rating} small />
                </div>
                <p className="leading-relaxed">{r.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">{t("noReviews")}</p>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-20">
          <SectionHeader title={t("related")} />
          <ProductRail products={related} />
        </section>
      )}
    </div>
  );
}
