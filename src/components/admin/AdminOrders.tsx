"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { api, ApiError } from "@/lib/client-api";
import { PaymentBadge, StatusBadge, human, inr, when } from "./labels";

type Row = {
  orderId: number;
  orderNumber: string;
  orderDate?: string | null;
  customer?: string | null;
  phone?: string | null;
  city?: string | null;
  items: number;
  total: number;
  paymentMethod: "COD" | "ONLINE";
  paymentStatus?: string | null;
  status: string;
  stage?: string | null;
  hasInvoice: boolean;
};
type Page = { page: number; pageSize: number; total: number; counts: Record<string, number>; orders: Row[] };

// The working views, in the order the day goes.
const VIEWS = [
  { id: "to-ship", label: "To ship" },
  { id: "awaiting-payment", label: "Awaiting payment" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "refund-due", label: "Refund due" },
  { id: "cancelled", label: "Cancelled" },
  { id: "all", label: "All" },
];

/* Order list. Filters live in the address (?view=&q=&from=&to=&page=) so a view can be shared or bookmarked. */
export function AdminOrders() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const view = params.get("view") ?? "to-ship";
  const q = params.get("q") ?? "";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);

  const [data, setData] = useState<Page | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(q);
  useEffect(() => setSearch(q), [q]);

  useEffect(() => {
    const qs = new URLSearchParams({ page: String(page), pageSize: "25" });
    if (view !== "all") qs.set("view", view);
    if (q) qs.set("q", q);
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);
    setError(null);
    api<Page>(`/api/admin/orders?${qs}`)
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Orders could not be loaded."));
  }, [view, q, from, to, page]);

  function go(change: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(change)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!("page" in change)) next.delete("page");
    router.replace(`${pathname}?${next}`);
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const input = "rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-forest-600";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            go({ q: search.trim() || null });
          }}
        >
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            Search
            <input id="order-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Order no., name or phone" className={`${input} w-56`} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            From
            <input id="order-from" type="date" value={from} onChange={(e) => go({ from: e.target.value || null })} className={input} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            To
            <input id="order-to" type="date" value={to} onChange={(e) => go({ to: e.target.value || null })} className={input} />
          </label>
          <button className="rounded-lg bg-forest-800 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-700">Search</button>
          {(q || from || to) && (
            <button type="button" className="px-2 py-2 text-sm font-medium text-forest-700 hover:underline" onClick={() => go({ q: null, from: null, to: null })}>
              Clear
            </button>
          )}
        </form>
      </div>

      <nav className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto border-b border-line px-1" aria-label="Order views">
        {VIEWS.map((v) => {
          const active = view === v.id;
          const n = data?.counts?.[v.id];
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => go({ view: v.id === "to-ship" ? null : v.id })}
              aria-current={active ? "page" : undefined}
              className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium ${active ? "border-forest-800 text-forest-800" : "border-transparent text-muted hover:text-ink"}`}
            >
              {v.label}
              {n !== undefined && (
                <span className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${active ? "bg-forest-800 text-white" : "bg-[#e6e9e4] text-ink"}`}>{n}</span>
              )}
            </button>
          );
        })}
      </nav>

      {error && <p className="rounded-lg bg-kumkum-100 p-3 text-sm text-kumkum-700">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-[#f6f7f5] text-left text-xs font-semibold tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3 text-right">Items</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {!data && !error && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">Loading orders…</td>
              </tr>
            )}
            {data?.orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">No orders here{q || from || to ? " for this search" : ""}.</td>
              </tr>
            )}
            {data?.orders.map((o) => (
              <tr key={o.orderId} className="border-t border-line hover:bg-[#f9faf8]">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.orderId}`} className="font-semibold text-forest-800 hover:underline">{o.orderNumber}</Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted tabular-nums">{when(o.orderDate, true)}</td>
                <td className="px-4 py-3">
                  <span className="block">{o.customer || "—"}</span>
                  <span className="text-xs text-muted tabular-nums">{[o.phone, o.city].filter(Boolean).join(" · ")}</span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{o.items}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">{inr(o.total)}</td>
                <td className="px-4 py-3"><PaymentBadge status={o.paymentStatus} method={o.paymentMethod} /></td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                  {o.stage && <span className="mt-1 block text-xs text-muted">{human(o.stage)}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.total > data.pageSize && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted tabular-nums">
            {(page - 1) * data.pageSize + 1}–{Math.min(page * data.pageSize, data.total)} of {data.total}
          </span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => go({ page: String(page - 1) })} className="rounded-lg border border-line bg-white px-3 py-1.5 disabled:opacity-40">Previous</button>
            <button type="button" disabled={page >= pages} onClick={() => go({ page: String(page + 1) })} className="rounded-lg border border-line bg-white px-3 py-1.5 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
