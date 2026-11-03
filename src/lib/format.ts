export function rupees(n: number, locale = "en") {
  return new Intl.NumberFormat(locale === "ta" ? "ta-IN" : "en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);
}

export function discountPercent(price: number, mrp?: number) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}
