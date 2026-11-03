const words = [
  ["Ragi", "கேழ்வரகு"],
  ["Kambu", "கம்பு"],
  ["Kavuni", "கவுனி"],
  ["Cholam", "சோளம்"],
];

// A bold moving band between sections. Decorative, so hidden from screen readers.
export function MilletBand() {
  const row = [...words, ...words, ...words];
  return (
    <div aria-hidden className="overflow-hidden py-6 my-14">
    <div className="relative -mx-4 -rotate-[1.5deg] overflow-hidden bg-kumkum-600 py-4 text-turmeric-200 shadow-[0_18px_40px_-24px_rgb(127_22_22/0.9)]">
      <div className="flex w-max animate-marquee items-center gap-10 [animation-duration:30s]">
        {[...row, ...row].map(([en, ta], i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            <span className="font-display text-3xl font-semibold text-white md:text-4xl">{en}</span>
            <span className="font-tamil text-2xl font-bold md:text-3xl">{ta}</span>
            <span className="text-2xl text-turmeric-500">✦</span>
          </span>
        ))}
      </div>
    </div>
    </div>
  );
}
