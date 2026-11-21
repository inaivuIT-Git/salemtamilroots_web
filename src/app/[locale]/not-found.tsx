import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="container-x flex flex-col items-start gap-4 py-24">
      <h1 className="font-display text-4xl font-semibold text-forest-800">{t("title")}</h1>
      <p className="text-lg text-muted">{t("text")}</p>
      <Link href="/" className="btn btn-primary">
        {t("home")}
      </Link>
    </div>
  );
}
