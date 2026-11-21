import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Q = Record<string, string | number | undefined>;

// 1 … 4 5 [6] 7 8 … 20
function pages(current: number, total: number): (number | "gap")[] {
  const out: (number | "gap")[] = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - current) <= 2) out.push(p);
    else if (out[out.length - 1] !== "gap") out.push("gap");
  }
  return out;
}

export function Pagination({ page, totalPages, query }: { page: number; totalPages: number; query: Q }) {
  const t = useTranslations("shop");
  if (totalPages <= 1) return null;
  const href = (p: number) => ({ pathname: "/shop" as const, query: clean({ ...query, page: p > 1 ? p : undefined }) });
  const btn = "grid h-11 min-w-11 place-items-center rounded-full px-3 font-semibold tabular-nums transition";
  return (
    <nav aria-label={t("pageOf", { page, total: totalPages })} className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} className={`${btn} bg-paper shadow-[var(--shadow-card)] hover:bg-leaf-100`} rel="prev">
          ‹ <span className="sr-only">{t("prev")}</span>
        </Link>
      ) : null}
      {pages(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <span key={`g${i}`} className="px-1 text-muted">
            …
          </span>
        ) : p === page ? (
          <span key={p} aria-current="page" className={`${btn} bg-forest-800 text-white`}>
            {p}
          </span>
        ) : (
          <Link key={p} href={href(p)} className={`${btn} bg-paper shadow-[var(--shadow-card)] hover:bg-leaf-100`}>
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={href(page + 1)} className={`${btn} bg-paper shadow-[var(--shadow-card)] hover:bg-leaf-100`} rel="next">
          › <span className="sr-only">{t("next")}</span>
        </Link>
      ) : null}
    </nav>
  );
}

export function clean(q: Q): Record<string, string> {
  return Object.fromEntries(Object.entries(q).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)]));
}
