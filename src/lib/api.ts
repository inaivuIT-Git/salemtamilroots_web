import "server-only";
import type { Banner, Category, ProductDetail, ProductSummary, Review, Variant } from "./types";
import * as sample from "./sample-data";

/*
  Server-side client for the Salem Tamil Roots API (salemtamilroots_backend).

  The API answers in two shapes:
   - ApiResponse:            { isSuccess, statusCode, data, error }
   - double-wrapped service: { isSuccess, statusCode: 200, data: { success, message, data, ... }, error }
     (SuccessResponseMiddleware wraps controllers that return a ServiceResponse directly)
  `unwrap` accepts both.
*/

const API = (process.env.API_BASE_URL ?? "https://uat.salemtamilroots.in").replace(/\/$/, "");
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
    const res = await fetch(`${API}${path}`, {
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "application/json" },
    });
    const body = await res.json().catch(() => null);
    return unwrap<T>(body);
  } catch (err) {
    console.error(`[api] GET ${path} failed:`, err);
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
type ApiDetail = {
  displayName: string | null; categoryName: string; sellerName: string | null;
  englishTitle: string | null; tamilTitle: string | null; englishShortDescription: string | null; shortDescription: string;
  description: string; tamilDescription: string | null; rating: number; reviewCount: number;
  variants: ApiVariant[]; reviews: ApiReview[];
};

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
export async function getCategories(): Promise<Category[]> {
  if (usingSampleData) return sample.categories;
  const rows = (await get<ApiCategory[]>("/api/Category")) ?? [];
  return rows
    .filter((c) => (c.categoryName ?? "").trim().toLowerCase() !== "combo offers") // hidden on the current site too
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
    description: (ta ? d.tamilDescription || d.shortDescription : d.description || d.englishShortDescription) || undefined,
    variants,
    sellerName: d.sellerName || undefined,
    reviews: (d.reviews ?? [])
      .filter((r) => r.comment?.trim())
      .map((r, i) => ({ id: `${r.customerId}-${i}`, author: r.customerName, rating: r.rating, text: r.comment!, date: r.createdAt ?? undefined })),
  };
}
