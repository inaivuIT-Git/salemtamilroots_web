/*
  SAMPLE DATA for local development only (USE_SAMPLE_DATA=1).
  Lets the pages be designed and reviewed without access to the API. Every page shows a red
  "Sample data" bar while this is on. Names follow the Menmai posters; individual prices,
  stock levels, ratings and reviews here are placeholders, not real figures.
*/
import type { Banner, Category, ProductDetail, ProductSummary, Review } from "./types";

export const categories: Category[] = [
  { id: 1, name: "Millet Brownies", image: "/sample/brownie-choco.webp" },
  { id: 2, name: "Millet Snacks", image: "/sample/brownie-nut.webp" },
  { id: 3, name: "Combo Packs", image: "/sample/plate.webp" },
  { id: 4, name: "Herbal Care", image: "/brand/story-harvest.webp" },
];

export const banners: Banner[] = [{ id: 1, image: "/sample/banner-menmai.webp", title: "Naarsuvai Menmai combo" }];

export const products: ProductSummary[] = [
  { id: 101, slug: "naarsuvai-menmai-combo-240g", name: "Naarsuvai Menmai Combo", image: "/sample/plate.webp", categoryName: "Combo Packs", variantId: 101, variantLabel: "240 g", price: 279, mrp: 350, rating: 4.8, ratingCount: 26, inStock: true },
  { id: 102, slug: "ragi-menmai-60g", name: "Ragi Menmai Brownie", image: "/sample/brownie-choco.webp", categoryName: "Millet Brownies", variantId: 102, variantLabel: "60 g", price: 89, rating: 4.7, ratingCount: 14, inStock: true },
  { id: 103, slug: "kambu-menmai-60g", name: "Kambu Menmai Brownie", image: "/sample/brownie-pista.webp", categoryName: "Millet Brownies", variantId: 103, variantLabel: "60 g", price: 89, rating: 4.6, ratingCount: 9, inStock: true },
  { id: 104, slug: "kavuni-menmai-60g", name: "Kavuni Menmai Brownie", image: "/sample/brownie-berry.webp", categoryName: "Millet Brownies", variantId: 104, variantLabel: "60 g", price: 99, mrp: 110, rating: 4.9, ratingCount: 11, inStock: true },
  { id: 105, slug: "chola-menmai-60g", name: "Chola Menmai Brownie", image: "/sample/brownie-nut.webp", categoryName: "Millet Brownies", variantId: 105, variantLabel: "60 g", price: 89, inStock: false },
  { id: 106, slug: "ragi-menmai-family-pack-240g", name: "Ragi Menmai Family Pack", image: "/sample/brownie-choco.webp", categoryName: "Millet Brownies", variantId: 106, variantLabel: "240 g", price: 319, mrp: 340, inStock: true },
];

export const reviews: Review[] = [
  { id: 1, author: "Priya", rating: 5, text: "Kids finished the kavuni brownie before I could taste it. Ordering the combo again for Diwali.", productName: "Kavuni Menmai Brownie" },
  { id: 2, author: "Karthik", rating: 5, text: "Soft, not too sweet, and you can actually taste the ragi. Nice gift box too.", productName: "Naarsuvai Menmai Combo" },
  { id: 3, author: "Meena", rating: 4, text: "Good packing and quick delivery to Coimbatore. Kambu one is my favourite.", productName: "Kambu Menmai Brownie" },
];

export function productDetail(slug: string): ProductDetail | null {
  const p = products.find((x) => x.slug === slug) ?? (slug ? products[0] : undefined);
  if (!p) return null;
  const isCombo = p.id === 101;
  return {
    ...p,
    slug,
    images: isCombo
      ? ["/sample/plate.webp", "/sample/brownie-choco.webp", "/sample/brownie-pista.webp", "/sample/brownie-berry.webp", "/sample/brownie-nut.webp"]
      : [p.image!, "/sample/plate.webp"],
    description: isCombo
      ? "Four millet brownies in one festive box: Ragi (kezhvaragu), Kambu, Kavuni rice and Cholam. Each piece is about 60 g, around 240 g in all. Traditional grains in a form today's kids and grown-ups both enjoy."
      : "A soft millet brownie made with traditional Tamil grains. About 60 g.",
    variants: isCombo
      ? [{ id: 101, label: "240 g", price: 279, mrp: 350, inStock: true, stock: 18 }]
      : [
          { id: p.id, label: "60 g", price: p.price, mrp: p.mrp, inStock: p.inStock, stock: p.inStock ? 4 : 0 },
          { id: p.id + 1000, label: "240 g", price: p.price * 3.5, inStock: true, stock: 30 },
        ],
    sellerName: "Salem Tamil Roots",
    reviews: reviews.slice(0, 2),
  };
}
