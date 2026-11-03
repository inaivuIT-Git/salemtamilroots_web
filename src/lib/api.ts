import "server-only";
import type { Banner, Category, ProductDetail, ProductPage, ProductSummary, Review, ShopSort, StrpxKey, StrpxSection, Variant } from "./types";
import { cleanHtml, htmlToText } from "./html";
import * as sample from "./sample-data";

/*
  Server-side client for the Salem Tamil Roots API (salemtamilroots_backend).

  The API answers in two shapes:
   - ApiResponse:            { isSuccess, statusCode, data, error }
   - double-wrapped service: { isSuccess, statusCode: 200, data: { success, message, data, ... }, error }
     (SuccessResponseMiddleware wraps controllers that return a ServiceResponse directly)
  `unwrap` accepts both.
*/

// Public API address: used to build image URLs that browsers load.
const API = (process.env.API_BASE_URL ?? "https://uat.salemtamilroots.in").replace(/\/$/, "");
// Address the server itself calls. On the VPS this is the API directly (http://127.0.0.1:5001),
// which skips Cloudflare (it may block server-to-server requests) and is faster.
const API_INTERNAL = (process.env.API_INTERNAL_URL || API).replace(/\/$/, "");
export const usingSampleData = process.env.USE_SAMPLE_DATA === "1";
const REVALIDATE = 300; // seconds; product data refreshes every 5 minutes

type Json = Record<string, unknown>;

function unwrap<T>(body: unknown): T | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Json;
  if (b.isSuccess === false || b.success === false) return null;
  let data = b.data as unknown;
  if (data && typeof data === "object" && !Array.isArray(data) && "success" in (data as Json) && "data" in (data as Json)) {
    if ((data as Json).success === false) return null;
    data = (data as Json).data;
  }
  return (data ?? null) as T | null;
}

async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_INTERNAL}${path}`, {
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "application/json" },
    });
    const text = await res.text();
    let body: unknown = null;
    try {
      body = JSON.parse(text);
    } catch {
      console.error(`[api] GET ${path}: HTTP ${res.status}, not JSON: ${text.slice(0, 160).replace(/\s+/g, " ")}`);
      return null;
    }
    const data = unwrap<T>(body);
    if (data === null) console.error(`[api] GET ${path}: HTTP ${res.status}, no data: ${text.slice(0, 200)}`);
    return data;
  } catch (err) {
    console.error(`[api] GET ${API_INTERNAL}${path} failed:`, err);
    return null;
  }
}

/** Image paths come back root-relative (/assets/images/...) and are served by the API host. */
export function imageUrl(path?: string | null): string | undefined {
  const p = path?.trim();
  if (!p) return undefined;
  if (/^https?:\/\//i.test(p)) return p;
  return `${API}${p.startsWith("/") ? "" : "/"}${p}`;
}

/** Same rule as product_details.js: drop the trailing "-200ml", then Title Case. */
export function slugToDisplayName(slug: string) {
  return decodeURIComponent(slug)
    .replace(/-\d+(?:\.\d+)?-?[a-zA-Z]+$/, "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function sizeLabel(weight?: number | null, unit?: string | null) {
  if (!weight) return undefined;
  return `${Number(weight)} ${(unit ?? "").toLowerCase()}`.trim();
}

/*
  Pricing follows the current storefront (index.js / product_details.js), which matches checkout:
  the discounted price is shown only while a discount is active; otherwise the MRP is the price.
*/
function priceOf(x: { finalPrice?: number; mrp?: number; discountApplied?: boolean; discountType?: string | null; discountValue?: number | null }) {
  const mrp = Number(x.mrp ?? 0);
  const final = Number(x.finalPrice ?? 0);
  const type = (x.discountType ?? "").toLowerCase();
  const active = !!x.discountApplied && !!type && type !== "none" && Number(x.discountValue ?? 0) > 0 && final > 0 && final < mrp;
  return active ? { price: final, mrp } : { price: mrp || final, mrp: undefined };
}

const inStock = (status?: string | null, qty?: number) => (status ? !/out of stock/i.test(status) : (qty ?? 0) > 0);

// ---------- API shapes (see salemtamilroots_backend: ProductListPage.cs, CategoryDto.cs, BannerDto.cs, ReviewCardDto.cs, ProductDetails.cs) ----------
type ApiCategory = { categoryId: number; categoryName: string | null; imageUrl: string; slug: string | null };
type ApiListItem = {
  productId: number; productName: string | null; displayName: string | null; category: string | null;
  finalPrice: number; mrp: number; discountValue: number | null; discountType: string | null; discountApplied: boolean;
  imageUrl: string | null; slug: string; availableQuantity: number; stockStatus: string; rating: number; reviewCount: number;
  weightValue: number; unit: string;
};
type ApiBanner = { bannerId: number; imageUrl: string; redirectUrl: string | null; title: string | null; displayOrder: number };
type ApiTopReview = { userName: string; rating: number; comment: string; productId: number; displayName: string | null; slug: string | null };
type ApiVariant = {
  productId: number; weight: number; unit: string | null; mrp: number; finalPrice: number; stockStatus: string | null;
  availableQuantity: number; isActive: boolean; discountApplied: boolean; discountType: string; discountValue: number;
  imageUrl: string; additionalImages: string[];
};
type ApiReview = { customerId: number; customerName: string; rating: number; title: string | null; comment: string | null; createdAt: string | null };
type Txt = string | null | undefined;
type ApiDetailDescription = {
  englishEchoesOfTradition: Txt; tamilEchoesOfTradition: Txt;
  englishWhyThisProduct: Txt; tamilWhyThisProduct: Txt;
  englishKeyIngredients: Txt; tamilKeyIngredients: Txt;
  englishHighlights: Txt; tamilHighlights: Txt;
  englishTraditionalHeritage: Txt; tamilTraditionalHeritage: Txt;
  englishAHeritageNote: Txt; tamilAHeritageNote: Txt;
  englishWhoIsItFor: Txt; tamilWhoIsItFor: Txt;
  englishDirectionsOfUse: Txt; tamilDirectionsOfUse: Txt;
  englishStorageInstructions: Txt; tamilStorageInstructions: Txt;
  englishImportantNote: Txt; tamilImportantNote: Txt;
  englishSalemtamilrootsPromise: Txt; tamilSalemtamilrootsPromise: Txt;
  englishThankYou: Txt; tamilThankYou: Txt;
  // Not in the API yet (STRPX v2 "Gateway to a Memory"); used automatically once the backend adds it.
  englishGatewayToAMemory?: Txt; tamilGatewayToAMemory?: Txt;
};
type ApiDetail = {
  displayName: string | null; categoryName: string; sellerName: string | null;
  englishTitle: string | null; tamilTitle: string | null; englishSubtitle: Txt; tamilSubtitle: Txt;
  englishShortDescription: string | null; shortDescription: string;
  description: string; tamilDescription: string | null; rating: number; reviewCount: number;
  detailDescription: ApiDetailDescription | null;
  variants: ApiVariant[]; reviews: ApiReview[];
};

/*
  STRPX v2.0 section -> API fields (same mapping as product_details.js on the current site).
  "In Tamil Life" uses the A-Heritage-Note field, which the current site shows as "Heritage Note".
*/
function strpxSections(d: ApiDetail, ta: boolean): StrpxSection[] {
  const x = d.detailDescription ?? ({} as ApiDetailDescription);
  const src: Record<StrpxKey, [Txt, Txt]> = {
    oneLine: [d.englishSubtitle, d.tamilSubtitle],
    about: [d.description, d.tamilDescription],
    echoes: [x.englishEchoesOfTradition, x.tamilEchoesOfTradition],
    memory: [x.englishGatewayToAMemory, x.tamilGatewayToAMemory],
    why: [x.englishWhyThisProduct, x.tamilWhyThisProduct],
    ingredients: [x.englishKeyIngredients, x.tamilKeyIngredients],
    love: [x.englishHighlights, x.tamilHighlights],
    heritage: [x.englishTraditionalHeritage, x.tamilTraditionalHeritage],
    tamilLife: [x.englishAHeritageNote, x.tamilAHeritageNote],
    whoFor: [x.englishWhoIsItFor, x.tamilWhoIsItFor],
    directions: [x.englishDirectionsOfUse, x.tamilDirectionsOfUse],
    storage: [x.englishStorageInstructions, x.tamilStorageInstructions],
    important: [x.englishImportantNote, x.tamilImportantNote],
    promise: [x.englishSalemtamilrootsPromise, x.tamilSalemtamilrootsPromise],
    thanks: [x.englishThankYou, x.tamilThankYou],
  };
  return (Object.keys(src) as StrpxKey[])
    .map((key) => {
      const [en, tamil] = src[key];
      // Show the visitor's language; fall back to the other one rather than leave a gap.
      return { key, html: cleanHtml(ta ? tamil || en : en || tamil) };
    })
    .filter((s) => s.html);
}

function mapListItem(i: ApiListItem): ProductSummary {
  const { price, mrp } = priceOf(i);
  return {
    id: i.productId,
    slug: i.slug,
    name: i.displayName || i.productName || "",
    image: imageUrl(i.imageUrl),
    categoryName: i.category && i.category !== "Uncategorized" ? i.category : undefined,
    variantId: i.productId,
    variantLabel: sizeLabel(i.weightValue, i.unit),
    price,
    mrp,
    rating: i.rating || undefined,
    ratingCount: i.reviewCount || undefined,
    inStock: inStock(i.stockStatus, i.availableQuantity),
  };
}

// ---------- public functions ----------
/** includeCombo: the home page hides "Combo Offers" (as the current site does); the shop lists it. */
export async function getCategories({ includeCombo = false } = {}): Promise<Category[]> {
  if (usingSampleData) return sample.categories;
  const rows = (await get<ApiCategory[]>("/api/Category")) ?? [];
  return rows
    .filter((c) => includeCombo || (c.categoryName ?? "").trim().toLowerCase() !== "combo offers")
    .map((c) => ({ id: c.categoryId, name: c.categoryName ?? "", image: imageUrl(c.imageUrl), slug: c.slug ?? undefined }));
}

export async function getBanners(): Promise<Banner[]> {
  if (usingSampleData) return sample.banners;
  const rows = (await get<ApiBanner[]>("/api/SiteManagement/banners/active")) ?? [];
  return rows
    .filter((b) => b.imageUrl?.trim())
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((b) => ({ id: b.bannerId, image: imageUrl(b.imageUrl)!, title: b.title ?? undefined, link: b.redirectUrl ?? undefined }));
}

export async function getBestSellers(): Promise<ProductSummary[]> {
  if (usingSampleData) return sample.products.slice(0, 4);
  const rows = (await get<ApiListItem[]>("/api/Product/best-sellers")) ?? [];
  // The API lists each weight separately; show one card per product.
  const seen = new Set<string>();
  return rows.map(mapListItem).filter((p) => (seen.has(p.name) ? false : (seen.add(p.name), true)));
}

export async function getNewOnShelf(): Promise<ProductSummary[]> {
  if (usingSampleData) return sample.products.slice(2, 6);
  return ((await get<ApiListItem[]>("/api/Product/new-on-shelf")) ?? []).map(mapListItem);
}

export async function getAllProducts(): Promise<ProductSummary[]> {
  if (usingSampleData) return sample.products;
  return ((await get<ApiListItem[]>("/api/Product")) ?? []).map(mapListItem);
}

type ApiPaged<T> = { page: number; pageSize: number; totalCount: number; totalPages: number; data: T[] };
export const SHOP_PAGE_SIZE = 12;

/*
  Product listing, the same endpoints products_listing.js uses:
   - a category:   /api/Product/listing/{id}?page&pageSize&sort
   - everything:   /api/Product/paginated?page&pageSize&sort
   - search:       /api/Search/customer?q&page&pageSize   (no sort)
  sort: priceLow (default) | priceHigh | new (added in the last 7 days).
*/
export async function getProductPage(opts: { categoryId?: number; q?: string; sort?: ShopSort; page?: number }): Promise<ProductPage> {
  const page = Math.max(1, opts.page ?? 1);
  const sort = opts.sort ?? "priceLow";
  if (usingSampleData) return sample.productPage({ ...opts, page, sort }, SHOP_PAGE_SIZE);
  const qs = `page=${page}&pageSize=${SHOP_PAGE_SIZE}`;
  const path = opts.q
    ? `/api/Search/customer?q=${encodeURIComponent(opts.q)}&${qs}`
    : opts.categoryId
      ? `/api/Product/listing/${opts.categoryId}?${qs}&sort=${sort}`
      : `/api/Product/paginated?${qs}&sort=${sort}`;
  const r = await get<ApiPaged<ApiListItem>>(path);
  return {
    items: (r?.data ?? []).map(mapListItem),
    page: r?.page || page,
    totalPages: Math.max(1, r?.totalPages || 1),
    totalCount: r?.totalCount ?? 0,
  };
}

/** Products with an active discount, biggest saving first (one card per product). */
export async function getDeals(limit = 8): Promise<ProductSummary[]> {
  const all = await getAllProducts();
  return all
    .filter((p) => p.mrp && p.mrp > p.price && p.inStock)
    .sort((a, b) => (b.mrp! - b.price) / b.mrp! - (a.mrp! - a.price) / a.mrp!)
    .slice(0, limit);
}

/**
 * The product the home page leads with: HERO_PRODUCT_SLUG if set (e.g. a festival offer),
 * otherwise the best seller with the biggest active discount, otherwise the top best seller.
 */
export async function getHeroProduct(locale: string, best: ProductSummary[]): Promise<ProductDetail | null> {
  const pinned = process.env.HERO_PRODUCT_SLUG?.trim();
  const candidates = [
    ...(pinned ? [pinned] : []),
    ...[...best].filter((p) => p.image && p.inStock).sort((a, b) => (b.mrp ? b.mrp - b.price : 0) - (a.mrp ? a.mrp - a.price : 0)).map((p) => p.slug),
  ];
  for (const slug of candidates.slice(0, 3)) {
    const d = await getProduct(slug, locale);
    if (d?.image) return d;
  }
  return null;
}

export async function getTopReviews(limit = 10): Promise<Review[]> {
  if (usingSampleData) return sample.reviews;
  const rows = (await get<ApiTopReview[]>(`/api/reviews/top?limit=${limit}`)) ?? [];
  return rows
    .filter((r) => r.comment?.trim())
    .map((r, i) => ({ id: `${r.productId}-${i}`, author: r.userName, rating: r.rating, text: r.comment, productName: r.displayName || undefined }));
}

export async function getProduct(slug: string, locale: string): Promise<ProductDetail | null> {
  if (usingSampleData) return sample.productDetail(slug);
  const name = slugToDisplayName(slug);
  if (!name) return null;
  const d = await get<ApiDetail>(`/api/Product/details/by-name/${encodeURIComponent(name)}`);
  if (!d || !d.variants?.length) return null;

  const variants: Variant[] = d.variants
    .filter((v) => v.isActive !== false)
    .map((v) => {
      const { price, mrp } = priceOf(v);
      return {
        id: v.productId,
        label: sizeLabel(v.weight, v.unit) ?? "",
        price,
        mrp,
        stock: v.availableQuantity,
        inStock: inStock(v.stockStatus, v.availableQuantity),
        images: Array.from(new Set([v.imageUrl, ...(v.additionalImages ?? [])].map(imageUrl).filter(Boolean) as string[])).slice(0, 6),
      };
    });
  // The slug names one weight; preselect it, else the first (lightest) variant.
  const slugSize = slug.match(/-(\d+(?:\.\d+)?)-?([a-zA-Z]+)$/);
  const pre =
    (slugSize && d.variants.find((v) => Number(v.weight) === Number(slugSize[1]) && (v.unit ?? "").toLowerCase() === slugSize[2].toLowerCase())) ||
    d.variants[0];
  const images = Array.from(new Set([pre.imageUrl, ...(pre.additionalImages ?? [])].map(imageUrl).filter(Boolean) as string[])).slice(0, 6);
  const v0 = variants.find((v) => v.id === pre.productId) ?? variants[0];
  const ta = locale === "ta";
  const story = strpxSections(d, ta);

  return {
    id: v0.id,
    slug,
    name: (ta ? d.tamilTitle : d.englishTitle) || d.displayName || name,
    image: images[0],
    images,
    categoryName: d.categoryName?.trim() && d.categoryName.trim() !== "--" ? d.categoryName : undefined,
    variantId: v0.id,
    variantLabel: v0.label,
    price: v0.price,
    mrp: v0.mrp,
    rating: d.rating ? Math.round(d.rating * 10) / 10 : undefined,
    ratingCount: d.reviewCount || undefined,
    inStock: v0.inStock,
    summary: cleanHtml(ta ? d.shortDescription || d.englishShortDescription : d.englishShortDescription || d.shortDescription) || undefined,
    story,
    description:
      htmlToText(ta ? d.tamilSubtitle || d.tamilDescription : d.englishSubtitle || d.description) ||
      htmlToText(ta ? d.shortDescription : d.englishShortDescription) ||
      undefined,
    variants,
    sellerName: d.sellerName || undefined,
    reviews: (d.reviews ?? [])
      .filter((r) => r.comment?.trim())
      .map((r, i) => ({ id: `${r.customerId}-${i}`, author: r.customerName, rating: r.rating, text: r.comment!, date: r.createdAt ?? undefined })),
  };
}
