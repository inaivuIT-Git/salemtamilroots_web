import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SignInForm } from "@/components/auth/SignInForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "signin" });
  return { title: t("title"), robots: { index: false } };
}

export default async function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="container-x flex justify-center pt-8 pb-16">
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  );
}
