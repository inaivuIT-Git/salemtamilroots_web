import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Category } from "@/lib/types";
import { ArrowIcon } from "@/components/ui/icons";

// Large photo tiles so visitors see the whole range at a glance (first tile is double size).
export function CategoryBento({ categories, allLabel }: { categories: Category[]; allLabel: string }) {
  const list = categories.slice(0, 7);
  return (
    <ul className="grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[180px] md:grid-cols-4 md:gap-4">
      {list.map((c, i) => (
        <li key={c.id} className={i === 0 ? "col-span-2 row-span-2" : ""}>
          <Link
            href={{ pathname: "/shop", query: { cat: c.id } }}
            className="group relative flex h-full overflow-hidden rounded-[1.5rem] bg-forest-800 shadow-[var(--shadow-card)]"
          >
            {c.image && (
              <Image src={c.image} alt="" fill sizes={i === 0 ? "(max-width: 768px) 100vw, 620px" : "(max-width: 768px) 50vw, 310px"} className="object-cover transition duration-700 group-hover:scale-105" />
            )}
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/20 to-transparent" />
            <span className="relative mt-auto flex w-full items-end justify-between gap-2 p-4 md:p-5">
              <span className={`font-display font-semibold text-white ${i === 0 ? "text-3xl md:text-4xl" : "text-lg md:text-xl"}`}>{c.name}</span>
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-turmeric-500 text-forest-950 transition group-hover:translate-x-1">
                <ArrowIcon className="size-4" />
              </span>
            </span>
          </Link>
        </li>
      ))}
      <li>
        <Link href="/shop" className="group flex h-full flex-col justify-between rounded-[1.5rem] bg-turmeric-500 p-5 text-forest-950 shadow-[var(--shadow-card)]">
          <span className="font-display text-xl font-semibold">{allLabel}</span>
          <span className="grid size-10 place-items-center rounded-full bg-forest-900 text-white transition group-hover:translate-x-1">
            <ArrowIcon className="size-5" />
          </span>
        </Link>
      </li>
    </ul>
  );
}
