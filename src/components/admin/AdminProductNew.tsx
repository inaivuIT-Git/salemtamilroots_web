"use client";

import { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { api, ApiError } from "@/lib/client-api";
import { inr } from "./labels";

export type Options = {
  categories: { id: number; name: string; active: boolean }[];
  sellers: { id: number; name: string }[];
  units: { code: string; name: string }[];
};

const input = "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-forest-600";
const label = "flex flex-col gap-1 text-xs font-medium text-muted";
const primary = "rounded-lg bg-forest-800 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-700 disabled:opacity-50";
const NAME = /^[A-Za-z0-9]+( [A-Za-z0-9]+)*$/;

/** MRP for a typed base price, from the API's calculator. */
export function useMrp(base: string) {
  const [mrp, setMrp] = useState<number | null>(null);
  useEffect(() => {
    const n = Number(base);
    if (!base || !(n > 0)) return setMrp(null);
    const t = setTimeout(() => {
      api<{ mrp: number }>(`/api/admin/products/price-preview?basePrice=${n}`).then((r) => setMrp(r.mrp)).catch(() => setMrp(null));
    }, 300);
    return () => clearTimeout(t);
  }, [base]);
  return mrp;
}

/** Size, unit, base price, stock and minimum: shared by "new product" and "add a size". */
export function SizeFields({ units, v, set }: { units: Options["units"]; v: SizeValues; set: (v: SizeValues) => void }) {
  const mrp = useMrp(v.basePrice);
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <label className={label}>
          Size
          <input id="size-weight" type="number" min="0.001" step="any" inputMode="decimal" required value={v.weight} onChange={(e) => set({ ...v, weight: e.target.value })} placeholder="e.g. 200" className={input} />
        </label>
        <label className={label}>
          Unit
          <select id="size-unit" required value={v.unit} onChange={(e) => set({ ...v, unit: e.target.value })} className={input}>
            <option value="">Choose</option>
            {units.map((u) => (
              <option key={u.code} value={u.code}>{u.name || u.code.toLowerCase()}</option>
            ))}
          </select>
        </label>
      </div>
      <label className={label}>
        Base price (what the seller gets)
        <input id="size-base" type="number" min="1" step="0.01" inputMode="decimal" required value={v.basePrice} onChange={(e) => set({ ...v, basePrice: e.target.value })} className={input} />
        {mrp !== null && <span className="font-normal text-ink">MRP in the shop: <strong className="tabular-nums">{inr(mrp)}</strong></span>}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className={label}>
          Stock now
          <input id="size-stock" type="number" min="0" step="1" required value={v.stock} onChange={(e) => set({ ...v, stock: e.target.value })} className={input} />
        </label>
        <label className={label}>
          Minimum (out of stock at or below)
          <input id="size-min" type="number" min="0" step="1" required value={v.minimum} onChange={(e) => set({ ...v, minimum: e.target.value })} className={input} />
        </label>
      </div>
    </>
  );
}
export type SizeValues = { weight: string; unit: string; basePrice: string; stock: string; minimum: string };
export const emptySize: SizeValues = { weight: "", unit: "", basePrice: "", stock: "0", minimum: "5" };
export const sizeBody = (v: SizeValues) => ({ weight: Number(v.weight), unit: v.unit, basePrice: Number(v.basePrice), stock: Number(v.stock), minimum: Number(v.minimum) });

export function AdminProductNew() {
  const router = useRouter();
  const [opts, setOpts] = useState<Options | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [seasonal, setSeasonal] = useState(false);
  const [size, setSize] = useState<SizeValues>(emptySize);

  useEffect(() => {
    api<Options>("/api/admin/products/options")
      .then((o) => {
        setOpts(o);
        if (o.sellers.length === 1) setSellerId(String(o.sellers[0].id));
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "The form could not be loaded."));
  }, []);

  const cleanName = name.replace(/\s+/g, " ").trim();
  const nameProblem = cleanName && !NAME.test(cleanName) ? "English letters, numbers and spaces only. Put the Tamil name in the Tamil title afterwards." : null;
  const address = cleanName && !nameProblem && size.weight && size.unit ? `/products/${cleanName.toLowerCase().replace(/ /g, "-")}-${Number(size.weight)}${size.unit.toLowerCase()}` : null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (nameProblem) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ productId: number }>("/api/admin/products", {
        method: "POST",
        body: { name: cleanName, sellerId: Number(sellerId), categoryId: Number(categoryId), seasonal, ...sizeBody(size) },
      });
      router.push(`/admin/products/${r.productId}?created=1`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The product could not be created.");
      setBusy(false);
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Link href="/admin/products" className="text-sm font-medium text-forest-700 hover:underline">← Products</Link>
        <h1 className="text-2xl font-semibold">New product</h1>
        <p className="text-sm text-muted">Start with the first size. It stays hidden from the shop while you add pictures and words, and more sizes.</p>
      </div>
      {error && <p role="alert" className="rounded-lg bg-kumkum-100 p-3 text-sm text-kumkum-700">{error}</p>}
      {!opts && !error && <p className="text-muted">Loading…</p>}
      {opts && (
        <form onSubmit={save} className="flex flex-col gap-4 rounded-xl border border-line bg-white p-4">
          <label className={label}>
            Name (English)
            <input id="new-name" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Neem Wood Comb" className={input} aria-invalid={!!nameProblem} />
            {nameProblem ? <span className="font-normal text-kumkum-700">{nameProblem}</span> : address && <span className="font-normal">Shop address: {address}</span>}
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={label}>
              Seller
              <select id="new-seller" required value={sellerId} onChange={(e) => setSellerId(e.target.value)} className={input}>
                <option value="">Choose</option>
                {opts.sellers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
            <label className={label}>
              Category
              <select id="new-category" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={input}>
                <option value="">Choose</option>
                {opts.categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{c.active ? "" : " (hidden)"}</option>
                ))}
              </select>
            </label>
          </div>
          <SizeFields units={opts.units} v={size} set={setSize} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={seasonal} onChange={(e) => setSeasonal(e.target.checked)} className="size-4 accent-forest-800" />
            Seasonal product
          </label>
          <div>
            <button disabled={busy || !!nameProblem} className={primary}>{busy ? "Creating…" : "Create product"}</button>
          </div>
        </form>
      )}
    </div>
  );
}
