import Image from "next/image";
import type { Banner } from "@/lib/types";

// Offer banners from Website Management, shown side by side instead of a rotating carousel,
// so every offer is visible at once.
export function OffersGrid({ banners }: { banners: Banner[] }) {
  const list = banners.slice(0, 3);
  if (!list.length) return null;
  const cols = list.length === 1 ? "" : list.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";
  return (
    <ul className={`grid gap-4 ${cols}`}>
      {list.map((b, i) => {
        const img = (
          <span className="relative block aspect-[1584/672] overflow-hidden rounded-[1.5rem] bg-forest-800 shadow-[var(--shadow-card)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-lift)]">
            <Image src={b.image} alt={b.title ?? ""} fill sizes={list.length === 1 ? "1240px" : "(max-width: 768px) 100vw, 620px"} className="object-cover" priority={i === 0} />
          </span>
        );
        return (
          <li key={b.id} className={list.length === 3 && i === 0 ? "lg:col-span-1 md:col-span-2" : ""}>
            {b.link ? (
              <a href={b.link} className="group block">
                {img}
              </a>
            ) : (
              <div className="group">{img}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
