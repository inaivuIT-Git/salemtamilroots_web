"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { api, ApiError } from "@/lib/client-api";
import { rupees } from "@/lib/format";
import { formatDate } from "./OrdersList";
import { STEPS, StatusPill, useStatusLabel } from "./status";

type Detail = {
  orderId: number;
  orderNumber: string;
  orderDate?: string | null;
  statusCode: number;
  paymentMethod: "COD" | "ONLINE";
  subtotal: number;
  discount: number;
  shipping: number;
  couponDiscount: number;
  total: number;
  address?: { name?: string | null; addressLine?: string | null; phone?: string | null } | null;
  tracking?: { id: string; courier?: string | null; url?: string | null } | null;
  refund?: { status: string; message: string; amount: number } | null;
  items: { productId: number; productName: string; slug?: string; imageUrl?: string | null; quantity: number; unitPrice: number; lineTotal: number; expectedDeliveryDate?: string | null; deliveredAt?: string | null }[];
  canCancel: boolean;
  canPay: boolean;
  hasInvoice: boolean;
};

// CancelReason in the API.
const REASONS = [
  { id: 1, key: "changedMind" },
  { id: 3, key: "mistake" },
  { id: 2, key: "cheaper" },
  { id: 4, key: "late" },
  { id: 5, key: "address" },
  { id: 99, key: "other" },
] as const;

export function OrderDetail({ orderId }: { orderId: number }) {
  const t = useTranslations("account");
  const locale = useLocale();
  const statusLabel = useStatusLabel();
  const [d, setD] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const load = useCallback(() => {
    api<Detail>(`/api/account/orders/${orderId}`)
      .then(setD)
      .catch((e) => setError(e instanceof ApiError && e.status === 403 ? t("notYours") : t("errLoad")));
  }, [orderId, t]);
  useEffect(load, [load]);

  if (error) return <p className="text-kumkum-700">{error}</p>;
  if (!d) return <p className="text-muted">{t("loading")}</p>;

  const prefix = locale === "ta" ? "/ta" : "";
  const deliveryBy = d.items.map((i) => i.expectedDeliveryDate).filter(Boolean).sort().at(-1);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/account" className="self-start text-sm font-semibold text-forest-700 hover:underline">
        ← {t("allOrders")}
      </Link>

      <section className="rounded-[var(--radius-card)] bg-paper p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{d.orderNumber}</h2>
            <p className="text-sm text-muted">
              {t("placedOn", { date: formatDate(d.orderDate, locale) })} · {d.paymentMethod === "COD" ? t("cod") : t("online")}
            </p>
          </div>
          <StatusPill code={d.statusCode} refund={!!d.refund} />
        </div>

        {/* Delivery progress */}
        {d.statusCode >= 1 && (
          <ol className="mt-6 grid grid-cols-5 gap-1" aria-label={t("progress")}>
            {STEPS.map((step) => {
              const done = d.statusCode >= step;
              return (
                <li key={step} className="flex flex-col gap-2" aria-current={d.statusCode === step ? "step" : undefined}>
                  <span className={`h-1.5 rounded-full ${done ? "bg-forest-600" : "bg-line"}`} />
                  <span className={`text-[11px] leading-tight sm:text-xs ${done ? "font-semibold text-forest-800" : "text-muted"}`}>{statusLabel(step)}</span>
                </li>
              );
            })}
          </ol>
        )}
        {d.statusCode >= 1 && d.statusCode < 5 && deliveryBy && (
          <p className="mt-4 text-sm">{t("expected", { date: formatDate(deliveryBy, locale) })}</p>
        )}
        {d.tracking && (
          <p className="mt-2 text-sm">
            {t("tracking", { courier: d.tracking.courier ?? "", id: d.tracking.id })}{" "}
            {d.tracking.url && (
              <a href={d.tracking.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-forest-700 underline">
                {t("track")}
              </a>
            )}
          </p>
        )}
        {d.refund && (
          <p className="mt-4 rounded-xl bg-turmeric-100 p-3 text-sm">
            <strong>{t("refundTitle", { amount: rupees(d.refund.amount, locale) })}</strong> {d.refund.message}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {d.canPay && (
            <a href={`${prefix}/orders/${d.orderId}`} className="btn btn-accent">
              {t("payNow", { total: rupees(d.total, locale) })}
            </a>
          )}
          {d.hasInvoice && (
            <a href={`/api/account/orders/${d.orderId}/invoice`} className="btn btn-ghost" download>
              {t("invoice")}
            </a>
          )}
          {d.canCancel && (
            <button type="button" className="btn text-kumkum-600 shadow-[inset_0_0_0_1.5px_currentColor] hover:bg-kumkum-100" onClick={() => setCancelOpen(true)}>
              {t("cancel")}
            </button>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-[var(--radius-card)] bg-paper p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h3 className="mb-4 font-semibold">{t("items")}</h3>
          <ul className="flex flex-col gap-4">
            {d.items.map((i) => (
              <li key={`${i.productId}-${i.productName}`} className="flex items-center gap-3">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-leaf-100">
                  <Image src={i.imageUrl || "/brand/logo.png"} alt="" fill sizes="64px" className="object-contain p-1.5" unoptimized />
                </span>
                <span className="min-w-0 flex-1">
                  {i.slug ? (
                    <Link href={`/products/${i.slug}`} className="font-medium hover:text-forest-700">{i.productName}</Link>
                  ) : (
                    <span className="font-medium">{i.productName}</span>
                  )}
                  <span className="block text-sm text-muted">× {i.quantity}</span>
                </span>
                <span className="font-semibold tabular-nums">{i.lineTotal ? rupees(i.lineTotal, locale) : t("free")}</span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="flex h-fit flex-col gap-5 rounded-[var(--radius-card)] bg-paper p-5 shadow-[var(--shadow-card)] sm:p-6">
          {d.address && (
            <div>
              <h3 className="mb-1 font-semibold">{t("deliverTo")}</h3>
              <p className="text-sm leading-relaxed">
                <strong>{d.address.name}</strong>
                <br />
                {d.address.addressLine}
                {d.address.phone && <span className="block text-muted">{d.address.phone}</span>}
              </p>
            </div>
          )}
          <dl className="flex flex-col gap-1.5 text-sm">
            <Row label={t("subtotal")} value={rupees(d.subtotal, locale)} />
            {!!d.discount && <Row label={t("discount")} value={`− ${rupees(d.discount, locale)}`} />}
            <Row label={t("shipping")} value={d.shipping ? rupees(d.shipping, locale) : t("free")} />
            {!!d.couponDiscount && <Row label={t("coupon")} value={`− ${rupees(d.couponDiscount, locale)}`} />}
            <div className="mt-2 flex justify-between border-t border-line pt-3">
              <dt className="font-semibold">{t("total")}</dt>
              <dd className="text-lg font-bold text-forest-800 tabular-nums">{rupees(d.total, locale)}</dd>
            </div>
          </dl>
        </aside>
      </div>

      {cancelOpen && (
        <CancelDialog
          orderId={d.orderId}
          paidOnline={d.paymentMethod === "ONLINE" && d.statusCode >= 1}
          onClose={() => setCancelOpen(false)}
          onCancelled={(next) => {
            setD(next);
            setCancelOpen(false);
          }}
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

function CancelDialog({ orderId, paidOnline, onClose, onCancelled }: { orderId: number; paidOnline: boolean; onClose: () => void; onCancelled: (d: Detail) => void }) {
  const t = useTranslations("account");
  const [reason, setReason] = useState<number>(1);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      onCancelled(await api<Detail>(`/api/account/orders/${orderId}/cancel`, { method: "POST", body: { reason, note } }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("errGeneric"));
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end p-4 sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="cancel-h">
      <button className="absolute inset-0 bg-forest-950/50" aria-label={t("keep")} onClick={() => !busy && onClose()} />
      <div className="relative flex w-full max-w-md flex-col gap-4 rounded-[2rem] bg-paper p-6 shadow-[var(--shadow-lift)]">
        <h2 id="cancel-h" className="font-display text-2xl font-semibold text-forest-800">{t("cancelTitle")}</h2>
        <p className="text-sm text-muted">{paidOnline ? t("cancelRefund") : t("cancelNote")}</p>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold">{t("reason")}</legend>
          {REASONS.map((r) => (
            <label key={r.id} className="flex items-center gap-2 text-sm">
              <input type="radio" name="reason" className="accent-forest-800" checked={reason === r.id} onChange={() => setReason(r.id)} />
              {t(`reasons.${r.key}`)}
            </label>
          ))}
        </fieldset>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder={t("notePlaceholder")}
          className="rounded-xl border-2 border-line bg-white px-3 py-2 text-sm outline-none focus:border-forest-600"
        />
        {error && <p role="alert" className="text-sm text-kumkum-700">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn bg-kumkum-600 text-white hover:bg-kumkum-700" onClick={confirm} disabled={busy}>
            {busy ? t("cancelling") : t("confirmCancel")}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
            {t("keep")}
          </button>
        </div>
      </div>
    </div>
  );
}
