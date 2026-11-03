// View models used by the UI. src/lib/api.ts maps API responses onto these.
export type Category = { id: number; name: string; image?: string; slug?: string };

export type Banner = { id: number | string; image: string; mobileImage?: string; title?: string; subtitle?: string; link?: string };

export type ProductSummary = {
  id: number;
  slug: string;
  name: string;
  image?: string;
  categoryName?: string;
  variantId?: number;
  variantLabel?: string;
  price: number;
  mrp?: number;
  rating?: number;
  ratingCount?: number;
  inStock: boolean;
};

export type Variant = { id: number; label: string; price: number; mrp?: number; stock?: number; inStock: boolean; images?: string[] };

export type Review = { id: number | string; author: string; rating: number; text: string; productName?: string; date?: string };

/** STRPX v2.0 (SalemTamilRoots Product Experience) sections, in the framework's order. */
export const STRPX_KEYS = [
  "oneLine",
  "about",
  "echoes",
  "memory",
  "why",
  "ingredients",
  "love",
  "heritage",
  "tamilLife",
  "whoFor",
  "directions",
  "storage",
  "important",
  "promise",
  "thanks",
] as const;
export type StrpxKey = (typeof STRPX_KEYS)[number];
/** html is already sanitised (see src/lib/html.ts). */
export type StrpxSection = { key: StrpxKey; html: string };

export type ProductDetail = ProductSummary & {
  images: string[];
  description?: string; // plain text, for search engines and link previews
  summary?: string; // short description shown under the title (sanitised HTML)
  story: StrpxSection[]; // only the sections that have content
  variants: Variant[];
  sellerName?: string;
  reviews: Review[];
};

export type ShopSort = "priceLow" | "priceHigh" | "new";
export type ProductPage = { items: ProductSummary[]; page: number; totalPages: number; totalCount: number };
