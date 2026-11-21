import { Link } from "@/i18n/navigation";
import { ArrowIcon } from "./icons";

export function SectionHeader({ title, text, href, linkLabel }: { title: string; text?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-3xl font-semibold text-forest-800 md:text-[40px]">{title}</h2>
        {text && <p className="text-muted">{text}</p>}
      </div>
      {href && (
        <Link href={href} className="group inline-flex items-center gap-2 font-semibold text-forest-700">
          {linkLabel}
          <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
