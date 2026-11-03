import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Banner } from "@/lib/types";
import { Link } from "@/i18n/navigation";
import { ArrowIcon } from "@/components/ui/icons";
import { BannerCarousel } from "./BannerCarousel";

const millets = [
  { en: "Ragi", ta: "கேழ்வரகு", dot: "bg-kumkum-600" },
  { en: "Kambu", ta: "கம்பு", dot: "bg-forest-600" },
  { en: "Kavuni", ta: "கவுனி", dot: "bg-[#4b1d3f]" },
  { en: "Cholam", ta: "சோளம்", dot: "bg-turmeric-500" },
];

export function Hero({ banners, locale }: { banners: Banner[]; locale: string }) {
  const t = useTranslations("home");
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-turmeric-200/50 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-48 -left-40 size-[480px] rounded-full bg-leaf-200/60 blur-3xl" />
      <div className="container-x relative grid items-center gap-10 pt-8 pb-14 lg:grid-cols-[0.95fr_1.25fr] lg:gap-14 lg:pt-14 lg:pb-20">
        <div className="flex flex-col gap-6">
          <span className="eyebrow">{t("heroEyebrow")}</span>
          <h1
            className={`font-display font-semibold tracking-tight text-forest-800 ${
              locale === "ta" ? "text-[clamp(2rem,4vw,3.25rem)] leading-[1.18]" : "text-[clamp(2.4rem,5.6vw,4.4rem)] leading-[1.02]"
            }`}
          >
            {t("heroTitle")}
          </h1>
          <p lang={locale === "en" ? "ta" : "en"} className="font-tamil -mt-2 text-xl font-bold text-turmeric-600">
            {t("heroTitleTa")}
          </p>
          <p className="max-w-[52ch] text-lg text-muted">{t("heroText")}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop" className="btn btn-primary group">
              {t("heroCta")}
              <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#story" className="btn btn-ghost">
              {t("heroCta2")}
            </a>
          </div>
          <ul className="flex flex-wrap gap-2 pt-2" aria-label="Millets">
            {millets.map((m) => (
              <li key={m.en} className="flex items-center gap-2 rounded-full bg-paper px-3.5 py-1.5 text-sm font-medium shadow-[var(--shadow-card)]">
                <span className={`size-2.5 rounded-full ${m.dot}`} />
                {locale === "ta" ? m.ta : m.en}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div aria-hidden className="absolute -inset-3 rotate-[-2deg] rounded-[2rem] bg-[conic-gradient(from_200deg,var(--color-turmeric-500),var(--color-kumkum-600),var(--color-forest-600),var(--color-turmeric-500))] opacity-90" />
          {banners.length ? (
            <BannerCarousel banners={banners} />
          ) : (
            <div className="relative aspect-[1584/672] overflow-hidden rounded-[1.75rem] shadow-[var(--shadow-lift)]">
              <Image src="/brand/story-harvest.webp" alt="" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 720px" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
