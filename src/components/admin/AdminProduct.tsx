"use client";

import { useCallback, useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { api, ApiError } from "@/lib/client-api";
import { StockBadge, inr, when } from "./labels";
import { SizeFields, emptySize, sizeBody, type Options, type SizeValues } from "./AdminProductNew";

type Discount = { type: "percentage" | "flat"; value: number; from: string; to: string };
type Product = {
  productId: number;
  name: string;
  fullName: string;
  size?: string | null;
  slug?: string | null;
  category?: string | null;
  seller?: string | null;
  active: boolean;
  free: boolean;
  price: {
    basePrice?: number | null;
    mrp: number;
    price: number;
    discount?: Discount | null;
    history: { basePrice: number; mrp?: number | null; from?: string | null; to?: string | null }[];
  };
  stock: {
    quantity: number;
    minimum: number;
    level: "ok" | "low" | "out";
    batches: {
      code?: string | null;
      received: number;
      remaining: number;
      made?: string | null;
      expires?: string | null;
      added?: string | null;
      status: "ok" | "soon" | "expired" | "used";
    }[];
    notInBatch: number;
    expired: number;
    expiringSoon: number;
  };
  images: { main?: string | null; more: { id: number; url: string }[] };
  sizes: { productId: number; size?: string | null; active: boolean; stock: number; current: boolean }[];
};
type Preview = { basePrice: number; mrp: number; fees: { gateway: number; platform: number; commission: number; marketing: number } };

const input = "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-forest-600";
const label = "flex flex-col gap-1 text-xs font-medium text-muted";
const primary = "rounded-lg bg-forest-800 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-700 disabled:opacity-50";
const secondary = "rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-[#f6f7f5] disabled:opacity-50";
const today = () => new Date().toISOString().slice(0, 10);

/** Uploads use multipart, so they go past api() (which sends JSON); same cookie and header. */
async function upload(productId: number, field: "main" | "more", files: File[]): Promise<Product> {
  const form = new FormData();
  for (const f of files) form.append(field, f);
  const res = await fetch(`/api/admin/products/${productId}/images`, {
    method: "POST",
    credentials: "same-origin",
    headers: { Accept: "application/json", "X-STR-Client": "web" },
    body: form,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.isSuccess === false) {
    throw new ApiError(res.status, json?.error?.message ?? `HTTP_${res.status}`, json?.error?.detail ?? (res.status === 413 ? "Those pictures are too large together. Upload fewer at a time." : "The pictures could not be uploaded."));
  }
  return json.data as Product;
}

export function AdminProduct({ productId }: { productId: number }) {
  const [p, setP] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setP(null);
    setError(null);
    api<Product>(`/api/admin/products/${productId}`)
      .then(setP)
      .catch((e) => setError(e instanceof ApiError ? e.message : "This product could not be loaded."));
  }, [productId]);
  useEffect(load, [load]);

  // Just created: say what's left before it can go in the shop.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("created") === "1")
      setNotice("Created and hidden from the shop. Add pictures and the words, then press Show in shop.");
  }, [productId]);

  /** Runs a change that answers with the updated product. */
  async function run(action: () => Promise<Product>, done: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      setP(await action());
      setNotice(done);
      return true;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "That didn't work. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  const post = (path: string, body: Record<string, unknown>, done: string) =>
    run(() => api<Product>(`/api/admin/products/${productId}/${path}`, { method: "POST", body }), done);

  if (!p) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/admin/products" className="text-sm font-medium text-forest-700 hover:underline">← Products</Link>
        {error ? <p className="rounded-lg bg-kumkum-100 p-3 text-sm text-kumkum-700">{error}</p> : <p className="text-muted">Loading product…</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Link href="/admin/products" className="text-sm font-medium text-forest-700 hover:underline">← Products</Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{p.name}{p.size ? ` · ${p.size}` : ""}</h1>
            <p className="text-sm text-muted">
              #{p.productId} · {[p.category, p.seller].filter(Boolean).join(" · ")}
              {p.slug && p.active && (
                <>
                  {" · "}
                  <a href={`/products/${p.slug}`} target="_blank" rel="noreferrer" className="text-forest-700 hover:underline">View in shop ↗</a>
                </>
              )}
            </p>
          </div>
          <ShopToggle p={p} busy={busy} onChange={(active) => post("active", { active }, active ? "Shown in the shop." : "Hidden from the shop.")} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/admin/products/${p.productId}/text`} className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold hover:border-forest-600">Words and story</Link>
          <AddSize productId={p.productId} name={p.name} busy={busy} />
        </div>
        {p.sizes.length > 1 && (
          <nav className="flex flex-wrap gap-2" aria-label="Sizes">
            {p.sizes.map((s) => (
              <Link
                key={s.productId}
                href={`/admin/products/${s.productId}`}
                aria-current={s.current ? "page" : undefined}
                className={`rounded-full border px-3 py-1 text-sm ${s.current ? "border-forest-800 bg-forest-800 text-white" : "border-line bg-white hover:border-forest-600"} ${s.active ? "" : "opacity-60"}`}
              >
                {s.size ?? `#${s.productId}`} <span className="tabular-nums opacity-80">· {s.stock}</span>
              </Link>
            ))}
          </nav>
        )}
      </div>

      <div aria-live="polite">
        {error && <p role="alert" className="rounded-lg bg-kumkum-100 p-3 text-sm text-kumkum-700">{error}</p>}
        {notice && !error && <p className="rounded-lg bg-leaf-100 p-3 text-sm text-forest-800">{notice}</p>}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <PriceCard p={p} busy={busy} post={post} />
        <StockCard p={p} busy={busy} post={post} />
      </div>
      <ImagesCard p={p} busy={busy} run={run} />
    </div>
  );
}

function ShopToggle({ p, busy, onChange }: { p: Product; busy: boolean; onChange: (active: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-2.5">
      <span className="text-sm">
        {p.active ? <strong className="text-forest-800">Shown in the shop</strong> : <strong className="text-muted">Hidden from the shop</strong>}
      </span>
      <button type="button" disabled={busy} onClick={() => onChange(!p.active)} className={secondary}>
        {p.active ? "Hide" : "Show in shop"}
      </button>
    </div>
  );
}

type Post = (path: string, body: Record<string, unknown>, done: string) => Promise<boolean>;

function PriceCard({ p, busy, post }: { p: Product; busy: boolean; post: Post }) {
  const [base, setBase] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [kind, setKind] = useState<"keep" | "none" | "percentage" | "flat">("keep");
  const [value, setValue] = useState("");
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState("");

  // What the typed base price becomes, before saving.
  useEffect(() => {
    const n = Number(base);
    if (!base || !(n > 0)) return setPreview(null);
    const t = setTimeout(() => {
      api<Preview>(`/api/admin/products/price-preview?basePrice=${n}`).then(setPreview).catch(() => setPreview(null));
    }, 300);
    return () => clearTimeout(t);
  }, [base]);

  const mrp = preview?.mrp ?? p.price.mrp;
  const v = Number(value);
  const selling = kind === "percentage" && v > 0 ? Math.round(mrp - (mrp * v) / 100) : kind === "flat" && v > 0 ? Math.round(mrp - v) : kind === "none" ? mrp : null;
  const d = p.price.discount;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const body: Record<string, unknown> = { discount: kind };
    if (base) body.basePrice = Number(base);
    if (kind === "percentage" || kind === "flat") {
      body.discountValue = v;
      body.discountFrom = from || today();
      if (to) body.discountTo = to;
    }
    if (await post("price", body, "Price saved. It shows in the shop now.")) {
      setBase("");
      setKind("keep");
      setValue("");
      setTo("");
    }
  }

  return (
    <section className="rounded-xl border border-line bg-white p-4">
      <h2 className="mb-3 font-semibold">Price</h2>
      {p.free ? (
        <p className="text-sm text-muted">This is a free product; it sells at ₹0.</p>
      ) : (
        <dl className="mb-4 grid grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-xs text-muted">Base price</dt>
            <dd className="font-semibold tabular-nums">{p.price.basePrice ? inr(p.price.basePrice) : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">MRP</dt>
            <dd className="font-semibold tabular-nums">{p.price.mrp > 0 ? inr(p.price.mrp) : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Selling at</dt>
            <dd className="font-semibold tabular-nums text-forest-800">{p.price.price > 0 ? inr(p.price.price) : "—"}</dd>
          </div>
        </dl>
      )}
      {d && (
        <p className="mb-4 rounded-lg bg-leaf-100 px-3 py-2 text-sm text-forest-800">
          Discount: {d.type === "percentage" ? `${d.value}% off` : `${inr(d.value)} off`}, {when(d.from)} to {when(d.to)}
        </p>
      )}

      <form onSubmit={save} className="flex flex-col gap-3 border-t border-line pt-4">
        <label className={label}>
          New base price (what the seller gets), from today
          <input id="base-price" type="number" min="1" step="0.01" inputMode="decimal" value={base} onChange={(e) => setBase(e.target.value)} placeholder={p.price.basePrice ? String(p.price.basePrice) : "e.g. 200"} className={input} />
        </label>
        {preview && (
          <p className="text-sm" data-testid="price-preview">
            New MRP <strong className="tabular-nums">{inr(preview.mrp)}</strong>
            <span className="text-muted"> (gateway {inr(preview.fees.gateway)}, platform {inr(preview.fees.platform)}, commission {inr(preview.fees.commission)}, marketing {inr(preview.fees.marketing)})</span>
          </p>
        )}

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-xs font-medium text-muted">Discount</legend>
          <div className="flex flex-wrap gap-2 text-sm">
            {(
              [
                ["keep", d ? "Keep as is" : "No change"],
                ...(d ? ([["none", "End discount"]] as const) : []),
                ["percentage", "Percentage"],
                ["flat", "Flat amount"],
              ] as const
            ).map(([id, text]) => (
              <label key={id} className={`cursor-pointer rounded-full border px-3 py-1 ${kind === id ? "border-forest-800 bg-forest-800 text-white" : "border-line"}`}>
                <input type="radio" name="discount" value={id} checked={kind === id} onChange={() => setKind(id)} className="sr-only" />
                {text}
              </label>
            ))}
          </div>
          {(kind === "percentage" || kind === "flat") && (
            <div className="grid gap-2 sm:grid-cols-3">
              <label className={label}>
                {kind === "percentage" ? "Percent off" : "Rupees off"}
                <input id="discount-value" type="number" min="0.01" step="0.01" max={kind === "percentage" ? 99 : undefined} required value={value} onChange={(e) => setValue(e.target.value)} className={input} />
              </label>
              <label className={label}>
                From
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={input} />
              </label>
              <label className={label}>
                To (optional)
                <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={input} />
              </label>
            </div>
          )}
        </fieldset>
        {selling !== null && kind !== "keep" && (
          <p className="text-sm">Will sell at <strong className="tabular-nums">{inr(Math.max(0, selling))}</strong>{kind !== "none" && from > today() ? ` from ${when(from)}` : ""}</p>
        )}
        <div>
          <button disabled={busy || (!base && kind === "keep")} className={primary}>Save price</button>
        </div>
      </form>

      {p.price.history.length > 0 && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-forest-700">Price history</summary>
          <table className="mt-2 w-full">
            <tbody>
              {p.price.history.map((h, i) => (
                <tr key={i} className="border-t border-line">
                  <td className="py-1.5 tabular-nums">{inr(h.basePrice)} → {h.mrp ? inr(h.mrp) : "—"}</td>
                  <td className="py-1.5 text-right text-muted">{when(h.from)} – {h.to ? when(h.to) : "now"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </section>
  );
}

function StockCard({ p, busy, post }: { p: Product; busy: boolean; post: Post }) {
  const [mode, setMode] = useState<"add" | "set" | "min">("add");
  const [qty, setQty] = useState("");
  const [batch, setBatch] = useState("");
  const [made, setMade] = useState("");
  const [expires, setExpires] = useState("");
  const [note, setNote] = useState("");
  const [min, setMin] = useState(String(p.stock.minimum));
  useEffect(() => setMin(String(p.stock.minimum)), [p.stock.minimum]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const body: Record<string, unknown> =
      mode === "min"
        ? { mode: "add", quantity: 0, minimum: Number(min) }
        : mode === "add"
          ? { mode, quantity: Number(qty), batchCode: batch.trim() || undefined, madeOn: made || undefined, expiresOn: expires || undefined, note: note || undefined }
          : { mode, quantity: Number(qty), note: note || undefined };
    const done = mode === "min" ? "Minimum saved." : mode === "add" ? `Added ${qty} to stock.` : `Stock corrected to ${qty}.`;
    if (await post("stock", body, done)) {
      setQty("");
      setBatch("");
      setMade("");
      setExpires("");
      setNote("");
    }
  }

  const tabs = [
    ["add", "Stock arrived"],
    ["set", "Correct the count"],
    ["min", "Minimum"],
  ] as const;

  return (
    <section className="rounded-xl border border-line bg-white p-4">
      <h2 className="mb-3 font-semibold">Stock</h2>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl font-semibold tabular-nums" data-testid="stock-qty">{p.stock.quantity}</span>
        <StockBadge level={p.stock.level} />
        <span className="text-sm text-muted">minimum {p.stock.minimum}</span>
      </div>
      {p.stock.expired > 0 && (
        <p role="status" className="mb-3 rounded-lg bg-kumkum-100 px-3 py-2 text-sm text-kumkum-700">
          {p.stock.expired} in stock may be from an expired batch. Check the shelf, then use Correct the count for any you remove.
        </p>
      )}
      {p.stock.expired === 0 && p.stock.expiringSoon > 0 && (
        <p role="status" className="mb-3 rounded-lg bg-turmeric-100 px-3 py-2 text-sm text-[#6b4a00]">
          {p.stock.expiringSoon} in stock {p.stock.expiringSoon === 1 ? "expires" : "expire"} within 30 days. A discount could help them sell first.
        </p>
      )}

      <div className="mb-3 flex gap-1 border-b border-line" role="tablist">
        {tabs.map(([id, text]) => (
          <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => setMode(id)} className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${mode === id ? "border-forest-800 text-forest-800" : "border-transparent text-muted"}`}>
            {text}
          </button>
        ))}
      </div>

      <form onSubmit={save} className="flex flex-col gap-3">
        {mode === "min" ? (
          <label className={label}>
            Warn when stock is at or below
            <input id="stock-min" type="number" min="0" step="1" required value={min} onChange={(e) => setMin(e.target.value)} className={input} />
            <span className="font-normal">At or below this number the product counts as out of stock.</span>
          </label>
        ) : (
          <>
            <label className={label}>
              {mode === "add" ? "How many arrived" : "How many you counted"}
              <input id="stock-qty-input" type="number" min={mode === "add" ? 1 : 0} step="1" required value={qty} onChange={(e) => setQty(e.target.value)} className={input} />
              {mode === "set" && qty !== "" && <span className="font-normal">{Number(qty) - p.stock.quantity >= 0 ? "+" : ""}{Number(qty) - p.stock.quantity} against what the system has now.</span>}
            </label>
            {mode === "add" && (
              <div className="grid gap-2 sm:grid-cols-3">
                <label className={label}>
                  Batch code (optional)
                  <input id="batch-code" value={batch} onChange={(e) => setBatch(e.target.value)} className={input} />
                </label>
                <label className={label}>
                  Made on
                  <input type="date" value={made} onChange={(e) => setMade(e.target.value)} className={input} />
                </label>
                <label className={label}>
                  Expires on
                  <input type="date" value={expires} min={made || undefined} onChange={(e) => setExpires(e.target.value)} className={input} />
                </label>
              </div>
            )}
            <label className={label}>
              Note (optional, kept in the log)
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={mode === "set" ? "e.g. stocktake, damaged" : ""} className={input} />
            </label>
          </>
        )}
        <div>
          <button disabled={busy} className={primary}>{mode === "add" ? "Add to stock" : mode === "set" ? "Save count" : "Save minimum"}</button>
        </div>
      </form>

      {p.stock.batches.length > 0 && (
        <div className="mt-4 text-sm">
          <h3 className="mb-1 font-semibold">Batches</h3>
          <p className="mb-2 text-xs text-muted">What's left is worked out from the stock count, selling the earliest expiry first.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px]">
              <thead className="text-left text-xs text-muted">
                <tr>
                  <th className="py-1 font-medium">Batch</th>
                  <th className="py-1 text-right font-medium">Left / received</th>
                  <th className="py-1 text-right font-medium">Expires</th>
                </tr>
              </thead>
              <tbody>
                {p.stock.batches.map((b, i) => (
                  <tr key={i} className={`border-t border-line ${b.status === "used" ? "text-muted" : ""}`}>
                    <td className="py-1.5 font-medium">
                      {b.code || <span className="font-normal text-muted">No code</span>}
                      {b.status === "expired" && <span className="ml-2 rounded-full bg-kumkum-100 px-2 py-0.5 text-xs font-semibold text-kumkum-700">Expired</span>}
                      {b.status === "soon" && <span className="ml-2 rounded-full bg-turmeric-100 px-2 py-0.5 text-xs font-semibold text-[#6b4a00]">Expires soon</span>}
                      {b.status === "used" && <span className="ml-2 text-xs">sold</span>}
                    </td>
                    <td className="py-1.5 text-right tabular-nums">{b.remaining} / {b.received}</td>
                    <td className="py-1.5 text-right text-muted">{b.expires ? when(b.expires) : "—"}</td>
                  </tr>
                ))}
                {p.stock.notInBatch > 0 && (
                  <tr className="border-t border-line text-muted">
                    <td className="py-1.5">Not in a batch</td>
                    <td className="py-1.5 text-right tabular-nums">{p.stock.notInBatch}</td>
                    <td />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function ImagesCard({ p, busy, run }: { p: Product; busy: boolean; run: (a: () => Promise<Product>, done: string) => Promise<boolean> }) {
  const accept = "image/jpeg,image/png,image/webp";
  const pick = (field: "main" | "more") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    const big = files.find((f) => f.size > 5 * 1024 * 1024);
    if (big) return void run(() => Promise.reject(new ApiError(400, "TOO_BIG", `${big.name} is over 5 MB.`)), "");
    void run(() => upload(p.productId, field, files.slice(0, 8)), field === "main" ? "Main picture replaced." : "Pictures added.");
  };
  const remove = (path: string, done: string) => {
    if (!confirm("Remove this picture?")) return;
    void run(() => api<Product>(`/api/admin/products/${p.productId}/images/${path}`, { method: "DELETE" }), done);
  };
  const tile = "relative size-32 overflow-hidden rounded-lg border border-line bg-[#f6f7f5]";
  const del = "absolute top-1 right-1 rounded-md bg-white/90 px-2 py-0.5 text-xs font-semibold text-kumkum-700 shadow hover:bg-white";

  return (
    <section className="rounded-xl border border-line bg-white p-4">
      <h2 className="mb-1 font-semibold">Pictures</h2>
      <p className="mb-3 text-xs text-muted">JPG, PNG or WebP, up to 5 MB each. Square pictures look best.</p>
      <div className="flex flex-wrap gap-3">
        <figure className="flex flex-col gap-1">
          <div className={tile}>
            {p.images.main ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images.main} alt="Main picture" className="size-full object-cover" />
                <button type="button" disabled={busy} className={del} onClick={() => remove("main", "Main picture removed.")}>Remove</button>
              </>
            ) : (
              <span className="flex size-full items-center justify-center text-xs text-muted">No main picture</span>
            )}
          </div>
          <label className={`${secondary} cursor-pointer text-center text-xs`}>
            {p.images.main ? "Replace main" : "Add main"}
            <input id="upload-main" type="file" accept={accept} className="sr-only" disabled={busy} onChange={pick("main")} />
          </label>
        </figure>
        {p.images.more.map((img) => (
          <figure key={img.id} className={tile}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="size-full object-cover" />
            <button type="button" disabled={busy} className={del} onClick={() => remove(String(img.id), "Picture removed.")}>Remove</button>
          </figure>
        ))}
        <label className={`${tile} flex cursor-pointer items-center justify-center border-dashed text-sm font-medium text-forest-700 hover:border-forest-600`}>
          + Add pictures
          <input id="upload-more" type="file" accept={accept} multiple className="sr-only" disabled={busy} onChange={pick("more")} />
        </label>
      </div>
    </section>
  );
}

/** Another size of this product: its words are copied over; it starts hidden. */
function AddSize({ productId, name, busy }: { productId: number; name: string; busy: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [units, setUnits] = useState<Options["units"] | null>(null);
  const [v, setV] = useState<SizeValues>(emptySize);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function start() {
    setOpen(true);
    if (!units) api<Options>("/api/admin/products/options").then((o) => setUnits(o.units)).catch(() => setError("Units could not be loaded."));
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const r = await api<{ productId: number }>(`/api/admin/products/${productId}/sizes`, { method: "POST", body: sizeBody(v) });
      router.push(`/admin/products/${r.productId}?created=1`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The size could not be added.");
      setSaving(false);
    }
  }

  if (!open) return <button type="button" disabled={busy} onClick={start} className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold hover:border-forest-600">+ Add a size</button>;
  return (
    <form onSubmit={save} className="flex w-full max-w-xl flex-col gap-3 rounded-xl border border-line bg-white p-4">
      <h2 className="font-semibold">New size of {name}</h2>
      {error && <p role="alert" className="rounded-lg bg-kumkum-100 p-3 text-sm text-kumkum-700">{error}</p>}
      {units ? <SizeFields units={units} v={v} set={setV} /> : !error && <p className="text-sm text-muted">Loading…</p>}
      <div className="flex gap-2">
        <button disabled={saving || !units} className={primary}>{saving ? "Adding…" : "Add size"}</button>
        <button type="button" onClick={() => setOpen(false)} className={secondary}>Cancel</button>
      </div>
    </form>
  );
}
