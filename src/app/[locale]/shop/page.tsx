import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCategories, getProductPage } from "@/lib/api";
import type { ShopSort } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { Pagination, clean } from "@/components/shop/Pagination";
import { SearchIcon } from "@/components/ui/icons";

type SP = Record<string, string | string[] | undefined>;
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<SP> };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const SORTS: ShopSort[] = ["priceLow", "priceHigh", "new"];

/*
  Reads its own parameters (cat, q, sort, page) and, so old links keep working,
  the current site's products_listing.html ones too (cid, q, mode=all).
*/
function readQuery(sp: SP) {
  const cat = Number(one(sp.cat) ?? one(sp.cid)) || undefined;
  const q = one(sp.q)?.slice(0, 80);
  const sortRaw = one(sp.sort) as ShopSort | undefined;
  const sort = sortRaw && SORTS.includes(sortRaw) ? sortRaw : "priceLow";
  const page = Math.max(1, Number(one(sp.page)) || 1);
  return { cat: q ? undefined : cat, q, sort, page };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { cat, q } = readQuery(await searchParams);
  const t = await getTranslations({ locale, namespace: "shop" });
  const cats = cat ? await getCategories({ includeCombo: true }) : [];
  const title = q ? t("resultsFor", { q }) : cats.find((c) => c.id === cat)?.name ?? t("all");
  return { title, robots: q ? { index: false } : undefined };
}

export default async function ShopPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { cat, q, sort, page } = readQuery(await searchParams);
  const [t, categories, result] = await Promise.all([
    getTranslations("shop"),
    getCategories({ includeCombo: true }),
    getProductPage({ categoryId: cat, q, sort, page }),
  ]);
  const current = categories.find((c) => c.id === cat);
  const title = q ? t("resultsFor", { q }) : current?.name ?? t("all");
  const sortLabel: Record<ShopSort, string> = { priceLow: t("sortPriceLow"), priceHigh: t("sortPriceHigh"), new: t("sortNew") };
  const chip = "flex shrink-0 items-center gap-2 rounded-full border-2 py-1.5 pr-4 pl-1.5 text-sm font-semibold transition";

  return (
    <div className="container-x pt-8">
      <header className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="eyebrow">{t("title")}</span>
            <h1 className="font-display text-4xl font-semibold text-forest-800 md:text-5xl">{title}</h1>
            <p className="text-muted tabular-nums">{t("count", { count: result.totalCount })}</p>
          </div>
          <form action={locale === "ta" ? "/ta/shop" : "/shop"} method="get" role="search" className="flex w-full max-w-md items-center gap-2 rounded-full bg-paper p-1.5 pl-4 shadow-[var(--shadow-card)] focus-within:ring-2 focus-within:ring-turmeric-500">
            <SearchIcon className="size-5 shrink-0 text-muted" />
            <label htmlFor="shop-search" className="sr-only">
              {t("searchLabel")}
            </label>
            <input
              id="shop-search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder={t("searchPlaceholder")}
              className="min-w-0 flex-1 bg-transparent py-2 outline-none placeholder:text-muted/70"
            />
            <button type="submit" className="btn btn-primary px-5 py-2.5 text-sm">
              {t("searchButton")}
            </button>
          </form>
        </div>

        <nav aria-label={t("categories")} className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link
            href="/shop"
            aria-current={!cat && !q ? "page" : undefined}
            className={`${chip} pl-4 ${!cat && !q ? "border-forest-800 bg-forest-800 text-white" : "border-line bg-paper hover:border-forest-600"}`}
          >
            {t("all")}
          </Link>
          {categories.map((c) => {
            const on = c.id === cat;
            return (
              <Link
                key={c.id}
                href={{ pathname: "/shop", query: { cat: c.id } }}
                aria-current={on ? "page" : undefined}
                className={`${chip} ${on ? "border-forest-800 bg-forest-800 text-white" : "border-line bg-paper hover:border-forest-600"}`}
              >
                <span className="relative size-7 overflow-hidden rounded-full bg-leaf-100">
                  {c.image && <Image src={c.image} alt="" fill sizes="28px" className="object-cover" />}
                </span>
                {c.name}
              </Link>
            );
          })}
        </nav>

        {q ? (
          <Link href="/shop" className="w-fit text-sm font-semibold text-kumkum-600 hover:underline">
            ✕ {t("clear")}
          </Link>
        ) : (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("sortLabel")}>
            <span className="mr-1 text-sm font-semibold text-muted">{t("sortLabel")}</span>
            {SORTS.map((s) => (
              <Link
                key={s}
                href={{ pathname: "/shop", query: clean({ cat, sort: s === "priceLow" ? undefined : s }) }}
                aria-current={s === sort ? "true" : undefined}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  s === sort ? "bg-turmeric-500 font-semibold text-forest-950" : "bg-paper text-ink hover:bg-turmeric-100"
                }`}
              >
                {sortLabel[s]}
              </Link>
            ))}
          </div>
        )}
      </header>

      {result.items.length ? (
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {result.items.map((p, i) => (
            <li key={p.id}>
              <ProductCard p={p} index={i} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 flex flex-col items-start gap-3 rounded-[2rem] bg-paper p-10 shadow-[var(--shadow-card)]">
          <p className="text-lg font-semibold">{sort === "new" && !q ? t("emptyNew") : t("empty")}</p>
          <p className="text-muted">{t("emptyHint")}</p>
          <Link href="/shop" className="btn btn-primary mt-2">
            {t("showAll")}
          </Link>
        </div>
      )}

      <Pagination page={result.page} totalPages={result.totalPages} query={{ cat, q, sort: sort === "priceLow" ? undefined : sort }} />
    </div>
  );
}
