/*
  SAMPLE DATA for local development only (USE_SAMPLE_DATA=1).
  Lets the pages be designed and reviewed without access to the API. Every page shows a red
  "Sample data" bar while this is on. Names follow the Menmai posters; individual prices,
  stock levels, ratings and reviews here are placeholders, not real figures.
*/
import type { Banner, Category, ProductDetail, ProductPage, ProductSummary, Review, ShopSort, StrpxSection } from "./types";

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

// Sample STRPX v2.0 story (placeholder wording, written to the framework's rules).
const comboStory: StrpxSection[] = [
  { key: "oneLine", html: "<p>Four millets of the Tamil kitchen, baked into one festive box of soft brownies.</p>" },
  { key: "about", html: "<p>Naarsuvai Menmai brings together four brownies, each made with a different traditional grain: ragi, kambu, kavuni rice and cholam. Each piece is about 60 g, around 240 g in all.</p>" },
  { key: "echoes", html: "<p>In Tamil homes, millets were never a trend. They were simply what the family ate: kambu koozh in the summer heat, ragi kali on a working morning, kavuni sweets kept for the days that mattered.</p><p>Menmai carries that same quiet familiarity into a form a new generation reaches for on its own.</p>" },
  { key: "memory", html: "<p><em>The brass tumbler of koozh left to cool on the window sill… the smell of roasting ragi from a neighbour's kitchen… a grandmother saying \"eat, it will keep you strong\".</em></p>" },
  { key: "why", html: "<p>Many children today know brownies better than they know kambu. Menmai meets them where they are, so traditional grains find their way back to the table.</p>" },
  { key: "ingredients", html: "<ul><li>Ragi (kezhvaragu) flour</li><li>Kambu (pearl millet) flour</li><li>Kavuni rice flour</li><li>Cholam (sorghum) flour</li><li>Jaggery, cocoa, butter and nuts</li></ul>" },
  { key: "love", html: "<ul><li>Soft, fudgy texture</li><li>Four distinct grain flavours in one box</li><li>A festive gift box, ready to share</li></ul>" },
  { key: "heritage", html: "<p>Millets were grown and eaten across Tamil Nadu for generations, cooked as kali, koozh, adai and festive sweets.</p>" },
  { key: "tamilLife", html: "<p>Sharing sweets with neighbours and relatives is part of every Deepavali in Tamil homes. A box of Menmai keeps that custom, with grains our elders knew well.</p>" },
  { key: "whoFor", html: "<ul><li>Families who want traditional grains in everyday treats</li><li>Anyone looking for a Deepavali gift with a Tamil story</li></ul>" },
  { key: "directions", html: "<p>Ready to eat. Warm for 10 seconds for a softer bite.</p>" },
  { key: "storage", html: "<ul><li>Store in a cool, dry place away from direct sunlight.</li><li>Close the box after opening.</li></ul>" },
  { key: "important", html: "<ul><li>Contains nuts and dairy.</li><li>This is a food product, not a medicine.</li></ul>" },
  { key: "promise", html: "<p>The information presented for this product is compiled from the manufacturer's details and traditional usage references.</p><p>At SalemTamilRoots, we are committed to preserving Tamil heritage through authentic, respectful, and responsible storytelling.</p>" },
  { key: "thanks", html: "<p><strong>Thank you for becoming a part of this journey to preserve Tamil heritage.</strong></p>" },
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
    summary: isCombo ? "<p>Ragi, Kambu, Kavuni and Cholam brownies in one festive box.</p>" : undefined,
    story: isCombo ? comboStory : comboStory.filter((x) => ["oneLine", "about", "storage", "promise", "thanks"].includes(x.key)),
    reviews: reviews.slice(0, 2),
  };
}

const sampleCategoryOf: Record<number, string> = { 1: "Millet Brownies", 2: "Millet Snacks", 3: "Combo Packs", 4: "Herbal Care" };

export function productPage(o: { categoryId?: number; q?: string; sort: ShopSort; page: number }, size: number): ProductPage {
  let list = [...products];
  if (o.categoryId) list = list.filter((p) => p.categoryName === sampleCategoryOf[o.categoryId!]);
  if (o.q) list = list.filter((p) => p.name.toLowerCase().includes(o.q!.toLowerCase()));
  if (!o.q) list.sort((a, b) => (o.sort === "priceHigh" ? b.price - a.price : a.price - b.price));
  if (o.sort === "new" && !o.q) list = list.slice(0, 2);
  const totalPages = Math.max(1, Math.ceil(list.length / size));
  return { items: list.slice((o.page - 1) * size, o.page * size), page: o.page, totalPages, totalCount: list.length };
}

export const settings: Record<string, string> = {
  "WelcomeGift:EnabledFrom": "2026-10-01",
  "WelcomeGift:EnabledTo": "2026-12-31",
  "WelcomeGift:MinimumOrderAmount": "249",
  "ShippingSettings:MinimumAmountForFreeShipping": "399",
};
