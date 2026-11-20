"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { api, ApiError } from "@/lib/client-api";
import { rupees } from "@/lib/format";
import { StatusPill } from "./status";

type Row = {
  orderId: number;
  orderNumber: string;
  orderDate?: string | null;
  statusCode: number;
  paymentMethod: "COD" | "ONLINE";
  canPay: boolean;
  total: number;
  items: number;
  image?: string | null;
};

export function formatDate(iso: string | null | undefined, locale: string) {
  if (!iso) return "";
  return new Intl.DateTimeFormat(locale === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

export function OrdersList() {
  const t = useTranslations("account");
  const locale = useLocale();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Row[]>("/api/account/orders")
      .then(setRows)
      .catch((e) => setError(e instanceof ApiError ? e.message : t("errLoad")));
  }, [t]);

  if (error) return <p className="text-kumkum-700">{error}</p>;
  if (!rows) return <p className="text-muted">{t("loading")}</p>;
  if (rows.length === 0)
    return (
      <div className="flex flex-col items-start gap-4 rounded-[2rem] bg-paper p-8 shadow-[var(--shadow-card)]">
        <p className="text-lg">{t("noOrders")}</p>
        <Link href="/shop" className="btn btn-primary">{t("shop")}</Link>
      </div>
    );

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((o) => (
        <li key={o.orderId}>
          <Link
            href={`/account/orders/${o.orderId}`}
            className="flex items-center gap-4 rounded-[var(--radius-card)] bg-paper p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-lift)]"
          >
            <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-leaf-100">
              <Image src={o.image || "/brand/logo.png"} alt="" fill sizes="64px" className="object-contain p-1.5" unoptimized />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex flex-wrap items-center gap-2">
                <strong className="truncate">{o.orderNumber}</strong>
                <StatusPill code={o.statusCode} />
              </span>
              <span className="text-sm text-muted">
                {formatDate(o.orderDate, locale)} · {t("itemCount", { count: o.items })} ·{" "}
                {o.paymentMethod === "COD" ? t("cod") : t("online")}
              </span>
            </span>
            <span className="text-right">
              <span className="block font-bold text-forest-800 tabular-nums">{rupees(o.total, locale)}</span>
              {o.canPay && <span className="text-xs font-semibold text-kumkum-600">{t("payPending")}</span>}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
