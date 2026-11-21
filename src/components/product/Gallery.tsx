"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [i, setI] = useState(0);
  useEffect(() => setI(0), [images]);
  const list = images.length ? images : ["/brand/logo.png"];
  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-32">
      <div className="relative aspect-square overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-turmeric-100 via-paper to-leaf-100 shadow-[var(--shadow-card)]">
        {list.map((src, k) => (
          <Image
            key={src}
            src={src}
            alt={k === i ? name : ""}
            fill
            priority={k === 0}
            sizes="(max-width: 1024px) 100vw, 560px"
            className={`object-contain p-6 transition-opacity duration-500 ${k === i ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>
      {list.length > 1 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto">
          {list.map((src, k) => (
            <button
              key={src}
              type="button"
              onClick={() => setI(k)}
              aria-label={`${k + 1} / ${list.length}`}
              aria-current={k === i}
              className={`relative size-20 shrink-0 overflow-hidden rounded-2xl bg-paper ring-2 transition ${
                k === i ? "ring-turmeric-500" : "ring-transparent hover:ring-line"
              }`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
