import type { Review } from "@/lib/types";
import { Rating } from "@/components/ui/Rating";

const accents = ["border-turmeric-500", "border-forest-600", "border-kumkum-600"];

export function ReviewRail({ reviews }: { reviews: Review[] }) {
  return (
    <ul className="no-scrollbar -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
      {reviews.map((r, i) => (
        <li
          key={r.id}
          className={`flex w-[82%] shrink-0 snap-start flex-col gap-4 rounded-[var(--radius-card)] border-t-4 bg-paper p-6 shadow-[var(--shadow-card)] sm:w-[360px] ${accents[i % accents.length]}`}
        >
          <Rating value={r.rating} />
          <p className="text-[17px] leading-relaxed text-ink">“{r.text}”</p>
          <div className="mt-auto flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-leaf-100 font-bold text-forest-800">{r.author.charAt(0)}</span>
            <span className="flex flex-col leading-tight">
              <span className="font-semibold">{r.author}</span>
              {r.productName && <span className="text-sm text-muted">{r.productName}</span>}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
