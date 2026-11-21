"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Banner } from "@/lib/types";

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = banners.length;

  useEffect(() => {
    if (n < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((x) => (x + 1) % n), 5000);
    return () => clearInterval(id);
  }, [n, paused]);

  return (
    <div
      className="relative overflow-hidden rounded-[1.75rem] bg-forest-800 shadow-[var(--shadow-lift)] ring-1 ring-black/5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="relative aspect-[1584/672]">
        {banners.map((b, k) => {
          const img = (
            <Image
              src={b.image}
              alt={b.title ?? ""}
              fill
              priority={k === 0}
              sizes="(max-width: 1024px) 100vw, 720px"
              className="object-cover"
            />
          );
          return (
            <div
              key={b.id}
              className={`absolute inset-0 transition-all duration-700 ease-out ${k === i ? "scale-100 opacity-100" : "pointer-events-none scale-[1.03] opacity-0"}`}
              aria-hidden={k !== i}
            >
              {b.link ? (
                <a href={b.link} tabIndex={k === i ? 0 : -1}>
                  {img}
                </a>
              ) : (
                img
              )}
            </div>
          );
        })}
      </div>
      {n > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
          {banners.map((b, k) => (
            <button
              key={b.id}
              type="button"
              aria-label={`${k + 1} / ${n}`}
              aria-current={k === i}
              onClick={() => setI(k)}
              className={`h-2 rounded-full transition-all ${k === i ? "w-7 bg-turmeric-500" : "w-2 bg-white/70 hover:bg-white"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
