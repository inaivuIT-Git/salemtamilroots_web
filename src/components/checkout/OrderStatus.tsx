"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { api, ApiError } from "@/lib/client-api";
import { openCashfree } from "@/lib/cashfree";
import { rupees } from "@/lib/format";
import { signinHref, useAuth } from "@/lib/session";
import type { OrderState, Placed } from "./types";

/*
  After checkout, and where Cashfree sends the customer back. For an online order the API asks
  Cashfree on every check, so this keeps asking for a little while until the payment settles.
*/
const CHECKS = 8;
const EVERY_MS = 2500;

export function OrderStatus({ orderId }: { orderId: number }) {
  const t = useTranslations("order");
  const locale = useLocale();
  const { ready, signedIn } = useAuth();
  const [order, setOrder] = useState<OrderState | null>(null);
  const [checks, setChecks] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (ready && !signedIn) window.location.replace(signinHref());
  }, [ready, signedIn]);

  const check = useCallback(async () => {
    try {
      setOrder(await api<OrderState>(`/api/checkout/orders/${orderId}`));
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError && e.status === 403 ? t("notYours") : t("errLoad"));
    } finally {
      setChecks((n) => n + 1);
    }
  }, [orderId, t]);

  useEffect(() => {
    if (ready && signedIn) void check();
  }, [ready, signedIn, check]);

  useEffect(() => {
    if (!order || order.state !== "pending" || order.paymentMethod !== "ONLINE" || checks >= CHECKS) return;
    const id = window.setTimeout(check, EVERY_MS);
    return () => window.clearTimeout(id);
  }, [order, checks, check]);

  async function payAgain() {
    setPaying(true);
    try {
      const p = await api<Placed>(`/api/checkout/orders/${orderId}/pay`, { method: "POST" });
      await openCashfree(p.paymentSessionId!, p.cashfreeMode ?? "sandbox", `${window.location.origin}${window.location.pathname}?from=payment`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("errLoad"));
      setPaying(false);
    }
  }

  if (error && !order) {
    return (
      <Card>
        <p className="text-kumkum-700">{error}</p>
        <Link href="/" className="btn btn-primary self-start">{t("home")}</Link>
      </Card>
    );
  }
  if (!order) return <Card><p className="text-muted">{t("checking")}</p></Card>;

  const d = order.details;
  const stillChecking = order.state === "pending" && order.paymentMethod === "ONLINE" && checks < CHECKS;

  return (
    <Card>
      {order.state === "confirmed" ? (
        <>
          <Badge tone="ok">✓</Badge>
          <h1 className="font-display text-3xl font-semibold text-forest-800">{t("thanks")}</h1>
          <p className="text-muted">{order.paymentMethod === "COD" ? t("confirmedCod", { total: rupees(order.total, locale) }) : t("confirmedPaid")}</p>
        </>
      ) : order.state === "failed" || !stillChecking ? (
        <>
          <Badge tone="warn">!</Badge>
          <h1 className="font-display text-3xl font-semibold text-forest-800">{order.state === "failed" ? t("failedTitle") : t("pendingTitle")}</h1>
          <p className="text-muted">{order.state === "failed" ? t("failed") : t("pending")}</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn btn-accent" onClick={payAgain} disabled={paying}>
              {paying ? t("opening") : t("payAgain", { total: rupees(order.total, locale) })}
            </button>
            {order.state !== "failed" && (
              <button type="button" className="btn btn-ghost" onClick={() => { setChecks(0); void check(); }}>
                {t("checkAgain")}
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <Badge tone="wait">
            <span className="block size-5 animate-spin rounded-full border-2 border-forest-800 border-t-transparent" />
          </Badge>
          <h1 className="font-display text-3xl font-semibold text-forest-800">{t("checkingTitle")}</h1>
          <p className="text-muted">{t("checking")}</p>
        </>
      )}

      <dl className="mt-2 grid grid-cols-2 gap-y-1.5 rounded-2xl bg-cream p-4 text-sm">
        <dt className="text-muted">{t("number")}</dt>
        <dd className="text-right font-semibold">{order.orderNumber}</dd>
        <dt className="text-muted">{t("payment")}</dt>
        <dd className="text-right">{order.paymentMethod === "COD" ? t("cod") : t("online")}</dd>
        {d?.transportcharge != null && (
          <>
            <dt className="text-muted">{t("shipping")}</dt>
            <dd className="text-right tabular-nums">{d.transportcharge ? rupees(d.transportcharge, locale) : t("free")}</dd>
          </>
        )}
        {!!d?.coupondiscount && (
          <>
            <dt className="text-muted">{t("coupon")}</dt>
            <dd className="text-right tabular-nums">− {rupees(d.coupondiscount, locale)}</dd>
          </>
        )}
        <dt className="font-semibold">{t("total")}</dt>
        <dd className="text-right text-lg font-bold text-forest-800 tabular-nums">{rupees(order.total, locale)}</dd>
      </dl>

      {d?.items && d.items.length > 0 && (
        <ul className="flex flex-col gap-2 text-sm">
          {d.items.map((i) => (
            <li key={`${i.productId}-${i.productName}`} className="flex justify-between gap-3">
              <span>
                {i.productName} <span className="text-muted">× {i.quantity}</span>
              </span>
              <span className="tabular-nums">{i.lineTotal ? rupees(i.lineTotal, locale) : t("free")}</span>
            </li>
          ))}
        </ul>
      )}

      <Link href="/shop" className="btn btn-ghost self-start">{t("continue")}</Link>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-x flex justify-center pt-8 pb-16">
      <div className="flex w-full max-w-lg flex-col gap-4 rounded-[2rem] bg-paper p-7 shadow-[var(--shadow-lift)] sm:p-9">{children}</div>
    </div>
  );
}

function Badge({ tone, children }: { tone: "ok" | "warn" | "wait"; children: React.ReactNode }) {
  const c = tone === "ok" ? "bg-forest-800 text-white" : tone === "warn" ? "bg-turmeric-500 text-forest-950" : "bg-leaf-100";
  return <span className={`grid size-12 place-items-center rounded-full text-2xl font-bold ${c}`}>{children}</span>;
}
