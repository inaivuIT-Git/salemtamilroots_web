import Image from "next/image";
import type { Category } from "@/lib/types";
import { Link } from "@/i18n/navigation";

const rings = ["ring-turmeric-500", "ring-forest-600", "ring-kumkum-600", "ring-tan-500", "ring-leaf-400"];
const fills = ["bg-turmeric-100", "bg-leaf-100", "bg-kumkum-100", "bg-tan-200", "bg-leaf-100"];

export function CategoryRail({ categories }: { categories: Category[] }) {
  return (
    <ul className="no-scrollbar -mx-4 flex gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-8 sm:overflow-visible sm:px-0">
      {categories.map((c, i) => (
        <li key={c.id} className="shrink-0">
          <Link href={{ pathname: "/shop", query: { cat: c.id } }} className="group flex w-28 flex-col items-center gap-3 text-center sm:w-36">
            <span
              className={`relative grid size-28 place-items-center overflow-hidden rounded-full ring-4 ring-offset-4 ring-offset-cream transition duration-300 group-hover:-translate-y-1 group-hover:rotate-3 sm:size-36 ${rings[i % rings.length]} ${fills[i % fills.length]}`}
            >
              {c.image ? (
                <Image src={c.image} alt="" fill sizes="144px" className="object-cover transition duration-500 group-hover:scale-110" />
              ) : (
                <Image src="/brand/logo.png" alt="" width={64} height={62} className="opacity-50" />
              )}
            </span>
            <span className="text-[15px] leading-tight font-semibold text-ink group-hover:text-forest-700">{c.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
