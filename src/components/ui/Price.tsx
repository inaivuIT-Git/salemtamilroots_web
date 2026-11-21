import { useLocale, useTranslations } from "next-intl";
import { discountPercent, rupees } from "@/lib/format";

export function Price({ price, mrp, size = "md" }: { price: number; mrp?: number; size?: "md" | "lg" }) {
  const locale = useLocale();
  const t = useTranslations("product");
  const off = discountPercent(price, mrp);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={`font-bold text-forest-800 tabular-nums ${size === "lg" ? "text-3xl" : "text-lg"}`}>{rupees(price, locale)}</span>
      {off > 0 && (
        <>
          <span className={`text-muted line-through tabular-nums ${size === "lg" ? "text-lg" : "text-sm"}`}>
            <span className="sr-only">{t("mrp")} </span>
            {rupees(mrp!, locale)}
          </span>
          <span className="rounded-full bg-kumkum-100 px-2 py-0.5 text-xs font-bold text-kumkum-600">{t("off", { percent: off })}</span>
        </>
      )}
    </div>
  );
}
