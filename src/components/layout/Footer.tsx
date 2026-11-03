import Image from "next/image";
import { useTranslations } from "next-intl";
import { legacy, site } from "@/lib/site";
import { Link } from "@/i18n/navigation";
import { MailIcon, PhoneIcon } from "@/components/ui/icons";

export function Footer() {
  const t = useTranslations("footer");
  const cols = [
    {
      title: t("shop"),
      links: [
        { href: "/shop", label: t("shop"), internal: true },
        { href: legacy.sell, label: t("sell") },
      ],
    },
    {
      title: t("help"),
      links: [
        { href: legacy.faq, label: t("faq") },
        { href: legacy.shipping, label: t("shipping") },
        { href: legacy.returns, label: t("returns") },
      ],
    },
    {
      title: t("company"),
      links: [
        { href: legacy.about, label: t("about") },
        { href: legacy.privacy, label: t("privacy") },
        { href: legacy.terms, label: t("terms") },
      ],
    },
  ];
  return (
    <footer className="relative mt-24 overflow-hidden bg-forest-900 text-leaf-100">
      <div aria-hidden className="h-2 bg-[repeating-linear-gradient(90deg,var(--color-turmeric-500)_0_18px,var(--color-kumkum-600)_18px_36px,var(--color-leaf-400)_36px_54px)]" />
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-paper p-1">
              <Image src="/brand/logo.png" alt="" width={56} height={54} />
            </span>
            <span className="font-display text-2xl font-semibold text-white">Salem Tamil Roots</span>
          </div>
          <p className="max-w-xs text-leaf-200">{t("tagline")}</p>
          <div className="flex flex-col gap-2 text-sm">
            <a href={site.phoneHref} className="flex items-center gap-2 hover:text-turmeric-200">
              <PhoneIcon className="size-4" /> <span className="select-all">{site.phone}</span>
            </a>
            <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-turmeric-200">
              <MailIcon className="size-4" /> <span className="select-all">{site.email}</span>
            </a>
            <a href={site.whatsapp} target="_blank" rel="noopener" className="w-fit rounded-full bg-[#25d366] px-4 py-2 font-semibold text-forest-950">
              WhatsApp
            </a>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold tracking-wider text-turmeric-200 uppercase">{c.title}</h3>
            {c.links.map((l) =>
              "internal" in l ? (
                <Link key={l.href} href={l.href} className="text-leaf-100/85 hover:text-white">
                  {l.label}
                </Link>
              ) : (
                <a key={l.href} href={l.href} className="text-leaf-100/85 hover:text-white">
                  {l.label}
                </a>
              ),
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="container-x py-5 text-sm text-leaf-200/80">{t("rights", { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
