import { StarIcon } from "./icons";

export function Rating({ value, count, small }: { value?: number; count?: number; small?: boolean }) {
  if (!value) return null;
  const s = small ? "size-3.5" : "size-4";
  return (
    <span className="inline-flex items-center gap-1 text-sm text-muted" aria-label={`${value.toFixed(1)} / 5`}>
      <span className="flex text-turmeric-500">
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon key={i} className={s} filled={value >= i - 0.25} />
        ))}
      </span>
      <span className="font-semibold text-ink tabular-nums">{value.toFixed(1)}</span>
      {count ? <span className="tabular-nums">({count})</span> : null}
    </span>
  );
}
