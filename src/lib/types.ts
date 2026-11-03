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

export type ProductDetail = ProductSummary & {
  images: string[];
  description?: string; // plain text or simple HTML from the seller's rich-text editor
  variants: Variant[];
  sellerName?: string;
  reviews: Review[];
};
