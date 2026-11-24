import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { day, findPost, posts, type Lang } from "@/content/blog";
import { PostBody } from "@/components/blog/PostBody";
import { site } from "@/lib/site";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = findPost(slug);
  if (!post) return {};
  const lang: Lang = locale === "ta" ? "ta" : "en";
  return {
    title: post[lang].title,
    description: post[lang].summary,
    alternates: { canonical: lang === "ta" ? `/ta/blog/${slug}` : `/blog/${slug}`, languages: { en: `/blog/${slug}`, ta: `/ta/blog/${slug}` } },
    openGraph: {
      type: "article",
      title: post[lang].title,
      description: post[lang].summary,
      publishedTime: post.date,
      images: [{ url: post.cover.src, width: post.cover.width, height: post.cover.height, alt: post.coverAlt[lang] }],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = findPost(slug);
  if (!post) notFound();
  const t = await getTranslations("blog");
  const lang: Lang = locale === "ta" ? "ta" : "en";
  const text = post[lang];
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: text.title,
    description: text.summary,
    datePublished: post.date,
    inLanguage: lang === "ta" ? "ta-IN" : "en-IN",
    image: post.cover.src,
    author: { "@type": "Organization", name: site.name },
    publisher: { "@type": "Organization", name: site.name },
  };

  return (
    <article className="pt-8 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <header className="container-x mx-auto flex max-w-3xl flex-col gap-3">
        <Link href="/blog" className="text-sm font-semibold text-forest-700 hover:underline">← {t("back")}</Link>
        <h1 className="font-display text-3xl leading-tight font-semibold text-forest-800 [overflow-wrap:anywhere] md:text-5xl">{text.title}</h1>
        <p className="text-lg text-muted">{text.summary}</p>
        <p className="text-sm text-muted">
          {t("by", { name: post.author[lang] })} · <time dateTime={post.date}>{day(post.date, locale)}</time> · {t("minutes", { n: text.readMinutes })}
        </p>
      </header>

      <figure className="container-x mx-auto mt-8 max-w-4xl">
        <Image src={post.cover.src} alt={post.coverAlt[lang]} width={post.cover.width} height={post.cover.height} sizes="(min-width: 896px) 896px, 100vw" priority className="h-auto w-full rounded-3xl" />
        {post.coverCaption && <figcaption className="mt-2 text-center text-sm text-muted">{post.coverCaption[lang]}</figcaption>}
      </figure>

      <div className="container-x mx-auto mt-4 max-w-2xl">
        <PostBody blocks={text.body} />

        <aside className="mt-12 flex flex-col gap-3 rounded-3xl bg-forest-800 p-6 text-white md:p-8">
          <h2 className="font-display text-2xl font-semibold">{t("shopTitle")}</h2>
          <p className="text-leaf-100">{t("shopText")}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link href="/shop" className="btn btn-accent px-5 py-2.5">{t("shopCta")}</Link>
            <a href={site.whatsapp} target="_blank" rel="noopener" className="rounded-full border border-white/40 px-5 py-2.5 font-semibold hover:bg-white/10">{t("whatsapp")}</a>
          </div>
          <p className="text-sm text-leaf-100/80">{t("talk")}</p>
        </aside>
      </div>
    </article>
  );
}
