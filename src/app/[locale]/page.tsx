import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  getAllProducts,
  getBanners,
  getBestSellers,
  getCategories,
  getDeals,
  getHeroProduct,
  getNewOnShelf,
  getOffers,
  getTopReviews,
} from "@/lib/api";
import { Hero } from "@/components/home/Hero";
import { MilletBand } from "@/components/home/MilletBand";
import { StoryBand } from "@/components/home/StoryBand";
import { ReviewRail } from "@/components/home/ReviewRail";
import { OfferHero } from "@/components/home2/OfferHero";
import { WelcomeStrip } from "@/components/home2/WelcomeStrip";
import { TrustStrip } from "@/components/home2/TrustStrip";
import { OffersGrid } from "@/components/home2/OffersGrid";
import { CategoryBento } from "@/components/home2/CategoryBento";
import { RecentlyViewed } from "@/components/home2/RecentlyViewed";
import { SignupBand } from "@/components/home2/SignupBand";
import { GiftNudge } from "@/components/home2/GiftNudge";
import { ProductRail } from "@/components/product/ProductRail";
import { SectionHeader } from "@/components/ui/SectionHeader";

/*
  Home page built to convert:
   1. a strip that speaks to who is visiting (new visitor: welcome gift; signed in: their gift / orders)
   2. a product-led hero you can buy from directly, then trust facts
   3. continue-where-you-left-off for returning visitors, live offers, ranked best sellers,
      the full range as photo tiles, biggest savings
   4. a sign-up section for guests, then new arrivals, story and real reviews
*/
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, th] = await Promise.all([getTranslations("home2"), getTranslations("home")]);
  const [banners, categories, best, fresh, reviews, offers, deals] = await Promise.all([
    getBanners(),
    getCategories({ includeCombo: true }),
    getBestSellers(),
    getNewOnShelf(),
    getTopReviews(10),
    getOffers(),
    getDeals(8),
  ]);
  // Before there are 30 days of sales, best sellers can be empty: fall back to the catalogue.
  const bestOrAll = best.length ? best : (await getAllProducts()).slice(0, 8);
  const hero = await getHeroProduct(locale, bestOrAll);
  const gift = { giftActive: offers.welcomeGift.active, giftMin: offers.welcomeGift.minOrder };

  return (
    <>
      <WelcomeStrip {...gift} />
      {hero ? <OfferHero p={hero} /> : <Hero banners={banners} locale={locale} />}
      <TrustStrip freeShippingFrom={offers.freeShippingFrom} />

      <RecentlyViewed />

      {hero && banners.length > 0 && (
        <section className="container-x mt-14">
          <SectionHeader title={t("offersTitle")} />
          <OffersGrid banners={banners} />
        </section>
      )}

      {bestOrAll.length > 0 && (
        <section className="container-x mt-20">
          <SectionHeader
            title={best.length ? t("bestTitle") : th("bestTitle")}
            text={best.length ? t("bestText") : undefined}
            href="/shop"
            linkLabel={th("viewAll")}
          />
          <ProductRail products={bestOrAll.slice(0, 8)} badge={best.length ? (i) => (i < 3 ? t("rank", { n: i + 1 }) : undefined) : undefined} />
        </section>
      )}

      {categories.length > 0 && (
        <section className="container-x mt-20">
          <SectionHeader title={t("categoriesTitle")} text={t("categoriesText")} />
          <CategoryBento categories={categories} allLabel={t("allProducts")} />
        </section>
      )}

      {deals.length > 0 && (
        <section className="container-x mt-20">
          <SectionHeader title={t("dealsTitle")} text={t("dealsText")} href="/shop" linkLabel={th("viewAll")} />
          <ProductRail products={deals} />
        </section>
      )}

      <SignupBand {...gift} />

      {fresh.length > 0 && (
        <section className="container-x mt-20">
          <SectionHeader title={t("newTitle")} text={t("newText")} href="/shop?sort=new" linkLabel={th("viewAll")} />
          <ProductRail products={fresh.slice(0, 8)} />
        </section>
      )}

      <MilletBand />
      <StoryBand />

      {reviews.length > 0 && (
        <section className="container-x mt-20">
          <SectionHeader title={th("reviewsTitle")} text={th("reviewsText")} />
          <ReviewRail reviews={reviews} />
        </section>
      )}

      <GiftNudge {...gift} />
    </>
  );
}
