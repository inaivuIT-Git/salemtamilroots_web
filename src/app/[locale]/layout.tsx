import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Catamaran, Fraunces, Noto_Sans_Tamil, Poppins } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { CartProvider } from "@/lib/cart";
import { usingSampleData } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { UiSwitch } from "@/components/layout/UiSwitch";
import "../globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["opsz", "SOFT"], display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins", display: "swap" });
const catamaran = Catamaran({ subsets: ["tamil", "latin"], weight: ["500", "700", "800"], variable: "--font-catamaran", display: "swap" });
const notoTamil = Noto_Sans_Tamil({ subsets: ["tamil"], weight: ["400", "600"], variable: "--font-noto-tamil", display: "swap" });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const siteUrl = process.env.SITE_URL ?? "https://uat.salemtamilroots.in";
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t("title"), template: "%s | Salem Tamil Roots" },
    description: t("description"),
    alternates: { languages: { en: "/", ta: "/ta" } },
    openGraph: { siteName: "Salem Tamil Roots", locale: locale === "ta" ? "ta_IN" : "en_IN", type: "website" },
  };
}

export const viewport: Viewport = { themeColor: "#084422", viewportFit: "cover" };

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <html lang={locale} className={`${fraunces.variable} ${poppins.variable} ${catamaran.variable} ${notoTamil.variable}`}>
      <body className="min-h-dvh">
        <NextIntlClientProvider>
          <CartProvider>
            {usingSampleData && (
              <div className="bg-kumkum-600 px-4 py-1.5 text-center text-xs font-semibold text-white">{t("sample")}</div>
            )}
            <Header />
            <main>{children}</main>
            <Footer />
            <UiSwitch />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
