// Names and colours for the API's order and payment states (enum names from the API).

const STATUS: Record<string, { label: string; tone: Tone }> = {
  PendingPayment: { label: "Awaiting payment", tone: "warn" },
  OrderConfirmed: { label: "Confirmed", tone: "info" },
  Processing: { label: "Processing", tone: "info" },
  Shipped: { label: "Shipped", tone: "go" },
  OutForDelivery: { label: "Out for delivery", tone: "go" },
  Delivered: { label: "Delivered", tone: "done" },
  Cancelled: { label: "Cancelled", tone: "stop" },
  RefundRequested: { label: "Cancelled · refund due", tone: "stop" },
  RefundInitiated: { label: "Refund in progress", tone: "stop" },
  Refunded: { label: "Refunded", tone: "muted" },
};

const PAYMENT: Record<string, { label: string; tone: Tone }> = {
  Pending: { label: "Not paid", tone: "warn" },
  Success: { label: "Paid", tone: "done" },
  Captured: { label: "Paid", tone: "done" },
  Authorized: { label: "Authorised", tone: "info" },
  Failed: { label: "Failed", tone: "stop" },
  Cancelled: { label: "Cancelled", tone: "muted" },
  Expired: { label: "Expired", tone: "muted" },
  Rejected: { label: "Rejected", tone: "stop" },
  RefundPending: { label: "Refund due", tone: "stop" },
  Refunded: { label: "Refunded", tone: "muted" },
};

type Tone = "warn" | "info" | "go" | "done" | "stop" | "muted";
const TONE: Record<Tone, string> = {
  warn: "bg-turmeric-100 text-[#6b4a00]",
  info: "bg-leaf-100 text-forest-800",
  go: "bg-[#e3eefb] text-[#1d4f8a]",
  done: "bg-forest-800 text-white",
  stop: "bg-kumkum-100 text-kumkum-700",
  muted: "bg-[#eceeea] text-muted",
};

export function StatusBadge({ status }: { status?: string | null }) {
  const s = (status && STATUS[status]) || { label: status ?? "—", tone: "muted" as Tone };
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[s.tone]}`}>{s.label}</span>;
}

export function PaymentBadge({ status, method }: { status?: string | null; method?: string }) {
  if (method === "COD" && (status === "Pending" || !status)) {
    return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE.info}`}>Cash on delivery</span>;
  }
  const s = (status && PAYMENT[status]) || { label: status ?? "—", tone: "muted" as Tone };
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[s.tone]}`}>{s.label}</span>;
}

export const inr = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

export function when(iso?: string | null, withTime = false) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}) }).format(new Date(iso));
}

/** "ShipmentAssigned" → "Shipment assigned"; names that already read well are left alone. */
export function human(text?: string | null) {
  if (!text) return "";
  if (/\s/.test(text)) return text;
  const words = text.replace(/([a-z0-9])([A-Z])/g, "$1 $2").split(" ");
  return words.map((w, i) => (i === 0 ? w : w.toLowerCase())).join(" ");
}

const STOCK: Record<string, { label: string; tone: Tone }> = {
  ok: { label: "In stock", tone: "info" },
  low: { label: "Running low", tone: "warn" },
  out: { label: "Out of stock", tone: "stop" },
};

/** Stock level from the API: out at or below the minimum, low a little above it. */
export function StockBadge({ level }: { level: string }) {
  const s = STOCK[level] ?? STOCK.ok;
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[s.tone]}`}>{s.label}</span>;
}
