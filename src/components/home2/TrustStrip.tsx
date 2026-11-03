import { useLocale, useTranslations } from "next-intl";
import { rupees } from "@/lib/format";
import { site } from "@/lib/site";

// Only facts from the current site's policies and cart rules (see PR notes).
export function TrustStrip({ freeShippingFrom }: { freeShippingFrom?: number }) {
  const t = useTranslations("home2");
  const locale = useLocale();
  const items = [
    { icon: "🚚", title: freeShippingFrom ? t("trustShipTitle", { amount: rupees(freeShippingFrom, locale) }) : t("trustShipTitleNoAmount"), text: t("trustShipText") },
    { icon: "🔒", title: t("trustPayTitle"), text: t("trustPayText") },
    { icon: "↩️", title: t("trustReturnTitle"), text: t("trustReturnText") },
    { icon: "📞", title: t("trustTalkTitle"), text: site.phone },
  ];
  return (
    <section aria-label={t("trustLabel")} className="border-b border-line bg-paper">
      <ul className="container-x grid grid-cols-1 gap-x-6 gap-y-3 py-5 sm:grid-cols-2 lg:grid-cols-4 lg:py-6">
        {items.map((x) => (
          <li key={x.title} className="flex items-start gap-3">
            <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-2xl bg-leaf-100 text-xl">
              {x.icon}
            </span>
            <span className="flex min-w-0 flex-col leading-snug">
              <span className="font-semibold text-forest-800">{x.title}</span>
              <span className="text-sm text-muted">{x.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
