import { setRequestLocale, getTranslations } from "next-intl/server";
import { getBanners, getBestSellers, getCategories, getNewOnShelf, getTopReviews, getAllProducts } from "@/lib/api";
import { Hero } from "@/components/home/Hero";
import { CategoryRail } from "@/components/home/CategoryRail";
import { MilletBand } from "@/components/home/MilletBand";
import { StoryBand } from "@/components/home/StoryBand";
import { ReviewRail } from "@/components/home/ReviewRail";
import { ProductRail } from "@/components/product/ProductRail";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const [banners, categories, best, fresh, reviews] = await Promise.all([
    getBanners(),
    getCategories(),
    getBestSellers(),
    getNewOnShelf(),
    getTopReviews(10),
  ]);
  // Before there are 30 days of sales, best sellers can be empty: fall back to the catalogue.
  const bestOrAll = best.length ? best : (await getAllProducts()).slice(0, 8);

  return (
    <>
      <Hero banners={banners} locale={locale} />

      {categories.length > 0 && (
        <section className="container-x mt-6">
          <SectionHeader title={t("categoriesTitle")} text={t("categoriesText")} />
          <CategoryRail categories={categories} />
        </section>
      )}

      <section className="container-x mt-20">
        <SectionHeader title={t("bestTitle")} text={t("bestText")} href="/shop" linkLabel={t("viewAll")} />
        {bestOrAll.length ? <ProductRail products={bestOrAll.slice(0, 8)} /> : <p className="text-muted">{t("noProducts")}</p>}
      </section>

      <MilletBand />

      {fresh.length > 0 && (
        <section className="container-x">
          <SectionHeader title={t("newTitle")} text={t("newText")} href="/shop?sort=new" linkLabel={t("viewAll")} />
          <ProductRail products={fresh.slice(0, 8)} />
        </section>
      )}

      <div className="mt-20">
        <StoryBand />
      </div>

      {reviews.length > 0 && (
        <section className="container-x mt-20">
          <SectionHeader title={t("reviewsTitle")} text={t("reviewsText")} />
          <ReviewRail reviews={reviews} />
        </section>
      )}
    </>
  );
}
