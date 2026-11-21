"use client";

import { useTranslations } from "next-intl";
import { HeartIcon } from "@/components/ui/icons";
import { useWishlist } from "@/lib/wishlist";

/** Save / unsave a product. On cards it sits over the picture; on the product page beside "Add to cart". */
export function WishHeart({ productId, name, large = false }: { productId: number; name: string; large?: boolean }) {
  const t = useTranslations("wishlist");
  const { has, toggle } = useWishlist();
  const saved = has(productId);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle(productId);
      }}
      aria-pressed={saved}
      aria-label={saved ? t("remove", { name }) : t("save", { name })}
      title={saved ? t("saved") : t("saveShort")}
      className={`grid place-items-center rounded-full transition-colors ${
        large
          ? `size-14 shrink-0 border-2 ${saved ? "border-kumkum-600 bg-kumkum-100 text-kumkum-600" : "border-line bg-white text-forest-800 hover:border-kumkum-600 hover:text-kumkum-600"}`
          : `size-9 bg-white/90 shadow ${saved ? "text-kumkum-600" : "text-forest-800 hover:text-kumkum-600"}`
      }`}
    >
      <HeartIcon filled={saved} className={large ? "size-6" : "size-[18px]"} />
    </button>
  );
}
