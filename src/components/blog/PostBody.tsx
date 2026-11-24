import Image from "next/image";
import type { Block, Pic } from "@/content/blog";

/* A post's body: one layout for both languages. Long Tamil words wrap instead of widening the page. */
function Figure({ pic, narrow, sizes }: { pic: Pic; narrow?: boolean; sizes: string }) {
  return (
    <figure className={`my-8 ${narrow ? "mx-auto max-w-xs" : ""}`}>
      <Image src={pic.src} alt={pic.alt} width={pic.width} height={pic.height} sizes={sizes} className="h-auto w-full rounded-2xl" />
      {pic.caption && <figcaption className="mt-2 text-center text-sm text-muted">{pic.caption}</figcaption>}
    </figure>
  );
}

export function PostBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="text-[17px] leading-[1.8] text-ink [overflow-wrap:anywhere] md:text-lg">
      {blocks.map((b, i) => {
        switch (b.t) {
          case "p":
            return <p key={i} className="my-5">{b.text}</p>;
          case "h2":
            return <h2 key={i} className="font-display mt-12 mb-3 text-2xl font-semibold leading-snug text-forest-800 md:text-3xl">{b.text}</h2>;
          case "list":
            return (
              <ul key={i} className="my-6 flex flex-col gap-3">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3">
                    <span aria-hidden className="mt-3 size-2 shrink-0 rounded-full bg-turmeric-500" />
                    <span>{it.lead && <strong className="font-semibold text-forest-800">{it.lead} </strong>}{it.text}</span>
                  </li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote key={i} className="font-display my-10 border-l-4 border-turmeric-500 pl-5 text-2xl leading-snug font-medium text-forest-800 md:text-[28px]">
                {b.text}
              </blockquote>
            );
          case "img":
            return <Figure key={i} pic={b.pic} narrow={b.narrow} sizes="(min-width: 768px) 672px, 100vw" />;
          case "gallery":
            return (
              <figure key={i} className="my-8">
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {b.pics.map((pic) => (
                    <Image key={pic.src} src={pic.src} alt={pic.alt} width={pic.width} height={pic.height} sizes="(min-width: 768px) 224px, 33vw" className="aspect-square w-full rounded-xl object-cover" />
                  ))}
                </div>
                {b.caption && <figcaption className="mt-2 text-center text-sm text-muted">{b.caption}</figcaption>}
              </figure>
            );
        }
      })}
    </div>
  );
}
