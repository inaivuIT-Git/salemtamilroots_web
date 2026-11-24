import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { day, posts, type Lang } from "@/content/blog";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return { title: t("title"), description: t("intro"), alternates: { canonical: locale === "ta" ? "/ta/blog" : "/blog", languages: { en: "/blog", ta: "/ta/blog" } } };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const lang: Lang = locale === "ta" ? "ta" : "en";
  const [first, ...rest] = posts;

  return (
    <div className="container-x pt-8 pb-16">
      <header className="mb-8 flex flex-col gap-2">
        <span className="eyebrow">Salem Tamil Roots</span>
        <h1 className="font-display text-4xl font-semibold text-forest-800 md:text-5xl">{t("title")}</h1>
        <p className="max-w-2xl text-lg text-muted">{t("intro")}</p>
      </header>

      {first && (
        <Link href={`/blog/${first.slug}`} className="group grid overflow-hidden rounded-3xl bg-paper shadow-[var(--shadow-card)] md:grid-cols-2">
          <Image src={first.cover.src} alt={first.coverAlt[lang]} width={first.cover.width} height={first.cover.height} sizes="(min-width: 768px) 50vw, 100vw" priority className="h-full max-h-96 w-full object-cover" />
          <div className="flex flex-col justify-center gap-3 p-6 md:p-10">
            <p className="text-sm text-muted">{day(first.date, locale)} · {t("minutes", { n: first[lang].readMinutes })}</p>
            <h2 className="font-display text-2xl leading-snug font-semibold text-forest-800 group-hover:underline md:text-3xl">{first[lang].title}</h2>
            <p className="text-muted">{first[lang].summary}</p>
            <span className="mt-2 font-semibold text-forest-700">{t("read")} →</span>
          </div>
        </Link>
      )}

      {rest.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col overflow-hidden rounded-2xl bg-paper shadow-[var(--shadow-card)]">
              <Image src={p.cover.src} alt={p.coverAlt[lang]} width={p.cover.width} height={p.cover.height} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="aspect-[16/9] w-full object-cover" />
              <div className="flex flex-col gap-2 p-5">
                <p className="text-sm text-muted">{day(p.date, locale)}</p>
                <h2 className="font-display text-xl leading-snug font-semibold text-forest-800 group-hover:underline">{p[lang].title}</h2>
                <p className="text-sm text-muted">{p[lang].summary}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
