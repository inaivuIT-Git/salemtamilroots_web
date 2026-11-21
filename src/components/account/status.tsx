"use client";

import { useTranslations } from "next-intl";

/*
  The API gives each order a step number (OrderTimelineHelper):
  -1 cancelled or refunded, 0 waiting for payment, 1 confirmed, 2 packing,
  3 shipped, 4 out for delivery, 5 delivered. Shown in the visitor's language.
*/
export const STEPS = [1, 2, 3, 4, 5] as const;

export function useStatusLabel() {
  const t = useTranslations("account.status");
  return (code: number, refund?: boolean) => {
    if (code < 0) return refund ? t("refund") : t("cancelled");
    return t(String(Math.min(code, 5)) as "0" | "1" | "2" | "3" | "4" | "5");
  };
}

export function StatusPill({ code, refund }: { code: number; refund?: boolean }) {
  const label = useStatusLabel()(code, refund);
  const tone =
    code < 0 ? "bg-kumkum-100 text-kumkum-700" : code === 0 ? "bg-turmeric-100 text-forest-950" : code === 5 ? "bg-forest-800 text-white" : "bg-leaf-100 text-forest-800";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{label}</span>;
}
