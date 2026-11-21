"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCart, type CartLine } from "@/lib/cart";
import { CartIcon, CheckIcon } from "@/components/ui/icons";

export function AddToCartButton({ line, disabled, compact, accent }: { line: CartLine; disabled?: boolean; compact?: boolean; accent?: boolean }) {
  const t = useTranslations("product");
  const { add } = useCart();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        add(line);
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
      className={`btn ${done ? "bg-forest-600 text-white" : accent ? "btn-accent" : "btn-primary"} disabled:cursor-not-allowed disabled:bg-line disabled:text-muted disabled:shadow-none ${
        compact ? "w-full px-3.5 py-2.5 text-sm" : "w-full py-4 text-base"
      }`}
      aria-live="polite"
    >
      {done ? <CheckIcon className="size-5" /> : <CartIcon className="size-5" />}
      <span>{disabled ? t("outOfStock") : done ? t("added") : t("addToCart")}</span>
    </button>
  );
}
