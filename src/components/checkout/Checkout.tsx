"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { api, ApiError } from "@/lib/client-api";
import { useCart } from "@/lib/cart";
import { openCashfree } from "@/lib/cashfree";
import { rupees } from "@/lib/format";
import { signinHref, useAuth } from "@/lib/session";
import { AddressForm } from "./AddressForm";
import type { Address, Placed, ServerCart } from "./types";

/*
  One page: what you're buying (priced by the API), where it goes, how you pay.
  1. The device's cart becomes the account's cart (PUT /api/checkout/cart); the API prices it.
  2. Pick or add a delivery address.
  3. Optional coupon, checked by the API.
  4. Pay online (Cashfree) or cash on delivery. The API places the order and works out the total.
*/
type PayMethod = "ONLINE" | "COD";

function imageSrc(path?: string) {
  if (!path) return "/brand/logo.png";
  if (/^https?:\/\//.test(path)) return path;
  return path.startsWith("/") ? path : `/${path}`;
}

async function settingOn(key: string) {
  try {
    const r = await api<{ value?: string | null }>(`/api/AppSettings/${encodeURIComponent(key)}`);
    return String(r?.value ?? "").toLowerCase() === "true";
  } catch {
    return false;
  }
}

export function Checkout() {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const router = useRouter();
  const { ready, signedIn, me } = useAuth();
  const { lines, clear } = useCart();

  const [cart, setCart] = useState<ServerCart | null>(null);
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [methods, setMethods] = useState<{ online: boolean; cod: boolean } | null>(null);
  const [method, setMethod] = useState<PayMethod>("ONLINE");
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number; total: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const synced = useRef(false);

  // Not signed in: sign in first, then come back here.
  useEffect(() => {
    if (ready && !signedIn) window.location.replace(signinHref(`${locale === "ta" ? "/ta" : ""}/checkout`));
  }, [ready, signedIn, locale]);

  const loadAddresses = useCallback(async () => {
    const list = await api<Address[]>("/api/checkout/addresses");
    setAddresses(list);
    setAddressId((cur) => cur ?? list[0]?.addressId ?? null);
    if (list.length === 0) setAdding(true);
  }, []);

  useEffect(() => {
    if (!ready || !signedIn || synced.current) return;
    synced.current = true;
    (async () => {
      try {
        const [c] = await Promise.all([
          api<ServerCart>("/api/checkout/cart", {
            method: "PUT",
            body: { items: lines.map((l) => ({ productId: l.variantId, quantity: l.qty })) },
          }),
          loadAddresses(),
          (async () => {
            const [online, cod] = await Promise.all([settingOn("PaymentSettings:EnableOnlinePayment"), settingOn("PaymentSettings:EnableCOD")]);
            setMethods({ online, cod });
            setMethod(online ? "ONLINE" : "COD");
          })(),
        ]);
        setCart(c);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : t("errLoad"));
      }
    })();
  }, [ready, signedIn, lines, loadAddresses, t]);

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    setCouponError(null);
    try {
      setCoupon(await api("/api/checkout/coupon", { method: "POST", body: { code: couponCode } }));
    } catch (err) {
      setCoupon(null);
      setCouponError(err instanceof ApiError ? err.message : t("errGeneric"));
    }
  }

  async function place() {
    setError(null);
    if (!addressId) return setError(t("errAddress"));
    setPlacing(true);
    try {
      const placed = await api<Placed>("/api/checkout/place", {
        method: "POST",
        body: { addressId, paymentMethod: method, couponCode: coupon?.code },
      });
      // The order now holds these items; the device's cart is done with.
      clear();
      const orderPath = `${locale === "ta" ? "/ta" : ""}/orders/${placed.orderId}`;
      if (placed.state === "payment" && placed.paymentSessionId) {
        await openCashfree(placed.paymentSessionId, placed.cashfreeMode ?? "sandbox", `${window.location.origin}${orderPath}?from=payment`);
        return; // the browser is leaving for Cashfree
      }
      router.replace(`/orders/${placed.orderId}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("errGeneric"));
      setPlacing(false);
    }
  }

  if (!ready || !signedIn) return <Shell title={t("title")}><p className="text-muted">{t("loading")}</p></Shell>;

  const names = Object.fromEntries(lines.map((l) => [l.variantId, l.name]));
  const paidItems = cart?.items.filter((i) => !i.welcomeGift) ?? [];
  const gifts = cart?.items.filter((i) => i.welcomeGift) ?? [];

  if (cart && paidItems.length === 0) {
    return (
      <Shell title={t("title")}>
        <div className="flex flex-col items-start gap-4 rounded-[2rem] bg-paper p-10 shadow-[var(--shadow-card)]">
          <p className="text-lg">{t("empty")}</p>
          {cart.problems.length > 0 && <Problems cart={cart} names={names} />}
          <Link href="/shop" className="btn btn-primary">{t("continue")}</Link>
        </div>
      </Shell>
    );
  }

  const s = cart?.summary;
  const total = coupon ? coupon.total : s?.total ?? 0;

  return (
    <Shell title={t("title")}>
      {me?.phone && <p className="-mt-5 mb-6 text-sm text-muted">{t("signedInAs", { phone: me.phone })}</p>}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          {/* Delivery address */}
          <section className="rounded-[var(--radius-card)] bg-paper p-5 shadow-[var(--shadow-card)] sm:p-6" aria-labelledby="addr-h">
            <h2 id="addr-h" className="mb-4 flex items-center gap-3 text-lg font-semibold">
              <span className="grid size-7 place-items-center rounded-full bg-forest-800 text-sm text-white">1</span>
              {t("address")}
            </h2>
            {addresses === null ? (
              <p className="text-muted">{t("loading")}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {addresses.map((a) => (
                  <label
                    key={a.addressId}
                    className={`flex cursor-pointer gap-3 rounded-2xl border-2 p-4 transition-colors ${addressId === a.addressId ? "border-forest-600 bg-leaf-100" : "border-line hover:border-leaf-400"}`}
                  >
                    <input type="radio" name="address" className="mt-1 accent-forest-800" checked={addressId === a.addressId} onChange={() => setAddressId(a.addressId)} />
                    <span className="text-sm leading-relaxed">
                      <strong className="block text-base">{a.name}</strong>
                      {[a.line1, a.line2].filter(Boolean).join(", ")}
                      <br />
                      {[a.city, a.state].filter(Boolean).join(", ")} {a.pincode}
                      {a.phone && <span className="block text-muted">{a.phone}</span>}
                    </span>
                  </label>
                ))}
                {adding ? (
                  <AddressForm
                    defaultPhone={me?.phone ?? ""}
                    onCancel={addresses.length > 0 ? () => setAdding(false) : undefined}
                    onSaved={(list) => {
                      setAddresses(list);
                      setAddressId(list[0]?.addressId ?? null);
                      setAdding(false);
                    }}
                  />
                ) : (
                  <button type="button" className="self-start text-sm font-semibold text-forest-700 hover:underline" onClick={() => setAdding(true)}>
                    + {t("addAddress")}
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Payment */}
          <section className="rounded-[var(--radius-card)] bg-paper p-5 shadow-[var(--shadow-card)] sm:p-6" aria-labelledby="pay-h">
            <h2 id="pay-h" className="mb-4 flex items-center gap-3 text-lg font-semibold">
              <span className="grid size-7 place-items-center rounded-full bg-forest-800 text-sm text-white">2</span>
              {t("payment")}
            </h2>
            {methods === null ? (
              <p className="text-muted">{t("loading")}</p>
            ) : !methods.online && !methods.cod ? (
              <p className="text-kumkum-600">{t("noPayment")}</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {methods.online && (
                  <PayOption checked={method === "ONLINE"} onChange={() => setMethod("ONLINE")} title={t("payOnline")} note={t("payOnlineNote")} />
                )}
                {methods.cod && <PayOption checked={method === "COD"} onChange={() => setMethod("COD")} title={t("payCod")} note={t("payCodNote")} />}
              </div>
            )}
          </section>
        </div>

        {/* Summary */}
        <aside className="flex h-fit flex-col gap-4 rounded-[var(--radius-card)] bg-paper p-5 shadow-[var(--shadow-card)] sm:p-6 lg:sticky lg:top-32">
          <h2 className="text-lg font-semibold">{t("summary")}</h2>
          {!cart ? (
            <p className="text-muted">{t("loading")}</p>
          ) : (
            <>
              <Problems cart={cart} names={names} />
              <ul className="flex flex-col gap-3">
                {[...paidItems, ...gifts].map((i) => (
                  <li key={i.cartItemId} className="flex items-center gap-3">
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-leaf-100">
                      <Image src={imageSrc(i.imageUrl)} alt="" fill sizes="56px" className="object-contain p-1" unoptimized />
                    </span>
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="line-clamp-2 font-medium">{i.productName}</span>
                      <span className="text-muted">
                        {i.weight ? `${i.weight} ${i.unit ?? ""} · ` : ""}× {i.quantity}
                      </span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums">{i.welcomeGift ? t("free") : rupees(i.lineTotal, locale)}</span>
                  </li>
                ))}
              </ul>
              <dl className="flex flex-col gap-1.5 border-t border-line pt-4 text-sm">
                <Row label={t("subtotal")} value={rupees(s?.subTotal ?? 0, locale)} />
                {!!s?.discount && <Row label={t("discount")} value={`− ${rupees(s.discount, locale)}`} accent />}
                <Row label={t("shipping")} value={s?.shipping ? rupees(s.shipping, locale) : t("free")} />
                {coupon && <Row label={t("coupon", { code: coupon.code })} value={`− ${rupees(coupon.discount, locale)}`} accent />}
                <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3">
                  <dt className="font-semibold">{t("total")}</dt>
                  <dd className="text-2xl font-bold text-forest-800 tabular-nums">{rupees(total, locale)}</dd>
                </div>
              </dl>

              {couponOpen ? (
                <form onSubmit={applyCoupon} className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="min-w-0 flex-1 rounded-xl border-2 border-line bg-white px-3 py-2 uppercase outline-none focus:border-forest-600"
                      placeholder={t("couponPlaceholder")}
                      aria-label={t("couponPlaceholder")}
                    />
                    <button className="btn btn-ghost px-4 py-2">{t("apply")}</button>
                  </div>
                  {couponError && <p className="text-sm text-kumkum-600">{couponError}</p>}
                </form>
              ) : (
                <button type="button" className="self-start text-sm font-semibold text-forest-700 hover:underline" onClick={() => setCouponOpen(true)}>
                  {t("haveCoupon")}
                </button>
              )}

              {error && <p role="alert" className="rounded-xl bg-kumkum-100 p-3 text-sm font-medium text-kumkum-700">{error}</p>}
              <button
                type="button"
                className="btn btn-accent w-full py-4 text-base"
                onClick={place}
                disabled={placing || !addressId || !methods || (!methods.online && !methods.cod)}
              >
                {placing ? t("placing") : method === "COD" ? t("placeCod", { total: rupees(total, locale) }) : t("payNow", { total: rupees(total, locale) })}
              </button>
              <p className="text-xs text-muted">{t("secure")}</p>
            </>
          )}
        </aside>
      </div>
    </Shell>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container-x pt-8 pb-16">
      <h1 className="mb-8 font-display text-4xl font-semibold text-forest-800">{title}</h1>
      {children}
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={`tabular-nums ${accent ? "font-semibold text-forest-600" : ""}`}>{value}</dd>
    </div>
  );
}

function PayOption({ checked, onChange, title, note }: { checked: boolean; onChange: () => void; title: string; note: string }) {
  return (
    <label className={`flex cursor-pointer gap-3 rounded-2xl border-2 p-4 transition-colors ${checked ? "border-forest-600 bg-leaf-100" : "border-line hover:border-leaf-400"}`}>
      <input type="radio" name="pay" className="mt-1 accent-forest-800" checked={checked} onChange={onChange} />
      <span>
        <strong className="block">{title}</strong>
        <span className="text-sm text-muted">{note}</span>
      </span>
    </label>
  );
}

function Problems({ cart, names }: { cart: ServerCart; names: Record<number, string> }) {
  const t = useTranslations("checkout");
  if (cart.problems.length === 0) return null;
  return (
    <div role="status" className="rounded-xl bg-turmeric-100 p-3 text-sm">
      <p className="font-semibold">{t("problemsTitle")}</p>
      <ul className="mt-1 list-disc pl-5">
        {cart.problems.map((p) => (
          <li key={p.productId}>
            {names[p.productId] ? <strong>{names[p.productId]}: </strong> : null}
            {p.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
