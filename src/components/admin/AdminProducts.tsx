"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { api, ApiError } from "@/lib/client-api";
import { StockBadge, inr } from "./labels";

type Row = {
  productId: number;
  name: string;
  size?: string | null;
  category?: string | null;
  seller?: string | null;
  image?: string | null;
  active: boolean;
  mrp: number;
  price: number;
  stock: number;
  minStock: number;
  stockLevel: "ok" | "low" | "out";
};
type Counts = { all: number; active: number; inactive: number; low: number; out: number };
type Page = { page: number; pageSize: number; total: number; counts: Counts; products: Row[] };
type Category = { categoryId: number; categoryName: string | null };

// Low and out of stock count shown products only, so the numbers are what needs doing.
const VIEWS: { id: string; label: string; count: keyof Counts; query: Record<string, string> }[] = [
  { id: "all", label: "All", count: "all", query: {} },
  { id: "active", label: "In the shop", count: "active", query: { active: "active" } },
  { id: "low", label: "Low stock", count: "low", query: { active: "active", stock: "low" } },
  { id: "out", label: "Out of stock", count: "out", query: { active: "active", stock: "out" } },
  { id: "inactive", label: "Hidden", count: "inactive", query: { active: "inactive" } },
];

/* Product list. Filters live in the address (?view=&q=&category=&page=) so a view can be shared. */
export function AdminProducts() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const view = VIEWS.find((v) => v.id === params.get("view")) ?? VIEWS[0];
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);

  const [data, setData] = useState<Page | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(q);
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => setSearch(q), [q]);
  useEffect(() => {
    api<Category[]>("/api/Category").then((c) => setCategories(Array.isArray(c) ? c : [])).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const qs = new URLSearchParams({ page: String(page), pageSize: "30", ...view.query });
    if (q) qs.set("q", q);
    if (category) qs.set("category", category);
    setError(null);
    api<Page>(`/api/admin/products?${qs}`)
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Products could not be loaded."));
  }, [view, q, category, page]);

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
        <h1 className="text-2xl font-semibold">Products</h1>
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            go({ q: search.trim() || null });
          }}
        >
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            Search
            <input id="product-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or product id" className={`${input} w-56`} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            Category
            <select id="product-category" value={category} onChange={(e) => go({ category: e.target.value || null })} className={`${input} max-w-48`}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
              ))}
            </select>
          </label>
          <button className="rounded-lg bg-forest-800 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-700">Search</button>
          {(q || category) && (
            <button type="button" className="px-2 py-2 text-sm font-medium text-forest-700 hover:underline" onClick={() => go({ q: null, category: null })}>
              Clear
            </button>
          )}
        </form>
      </div>

      <nav className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto border-b border-line px-1" aria-label="Product views">
        {VIEWS.map((v) => {
          const active = view.id === v.id;
          const n = data?.counts?.[v.count];
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => go({ view: v.id === "all" ? null : v.id })}
              aria-current={active ? "page" : undefined}
              className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium ${active ? "border-forest-800 text-forest-800" : "border-transparent text-muted hover:text-ink"}`}
            >
              {v.label}
              {n !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${active ? "bg-forest-800 text-white" : (v.id === "out" || v.id === "low") && n > 0 ? "bg-kumkum-100 text-kumkum-700" : "bg-[#e6e9e4] text-ink"}`}
                >
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {error && <p className="rounded-lg bg-kumkum-100 p-3 text-sm text-kumkum-700">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-[#f6f7f5] text-left text-xs font-semibold tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">MRP</th>
              <th className="px-4 py-3 text-right">Selling at</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3">Shop</th>
            </tr>
          </thead>
          <tbody>
            {!data && !error && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">Loading products…</td>
              </tr>
            )}
            {data?.products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">No products here{q || category ? " for this search" : ""}.</td>
              </tr>
            )}
            {data?.products.map((p) => (
              <tr key={p.productId} className="border-t border-line hover:bg-[#f9faf8]">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.productId}`} className="flex items-center gap-3">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" width={40} height={40} className="size-10 shrink-0 rounded-md border border-line object-cover" />
                    ) : (
                      <span className="size-10 shrink-0 rounded-md border border-dashed border-line bg-[#f6f7f5]" aria-hidden />
                    )}
                    <span>
                      <span className="block font-semibold text-forest-800 hover:underline">{p.name}{p.size ? ` · ${p.size}` : ""}</span>
                      <span className="text-xs text-muted">#{p.productId}{p.seller ? ` · ${p.seller}` : ""}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{p.category || "—"}</td>
                <td className="px-4 py-3 text-right tabular-nums">{p.mrp > 0 ? inr(p.mrp) : "—"}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">
                  {p.price > 0 ? inr(p.price) : "—"}
                  {p.price > 0 && p.price < p.mrp && <span className="block text-xs font-normal text-forest-700">{Math.round((1 - p.price / p.mrp) * 100)}% off</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="tabular-nums font-semibold">{p.stock}</span>
                  <span className="mt-1 block"><StockBadge level={p.stockLevel} /></span>
                </td>
                <td className="px-4 py-3">
                  {p.active ? <span className="text-forest-800">Shown</span> : <span className="text-muted">Hidden</span>}
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
