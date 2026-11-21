import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccountShell } from "@/components/account/AccountShell";
import { notFound } from "next/navigation";
import { OrderDetail } from "@/components/account/OrderDetail";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("orderTitle"), robots: { index: false } };
}

export default async function Page({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();
  return (
    <AccountShell>
      <OrderDetail orderId={orderId} />
    </AccountShell>
  );
}
