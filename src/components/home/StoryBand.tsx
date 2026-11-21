import Image from "next/image";
import { useTranslations } from "next-intl";
import { CheckIcon } from "@/components/ui/icons";

export function StoryBand() {
  const t = useTranslations("home");
  return (
    <section id="story" className="container-x scroll-mt-28">
      <div className="relative grid overflow-hidden rounded-[2rem] bg-forest-800 text-leaf-100 md:grid-cols-[1.1fr_1fr]">
        <div className="relative z-10 flex flex-col gap-5 p-8 md:p-14">
          <span className="eyebrow !text-turmeric-500">{t("storyEyebrow")}</span>
          <h2 className="font-display text-3xl font-semibold text-white md:text-5xl">{t("storyTitle")}</h2>
          <p className="max-w-[56ch] text-lg text-leaf-200">{t("storyText")}</p>
          <ul className="mt-2 grid gap-3">
            {[t("storyPoint1"), t("storyPoint2"), t("storyPoint3")].map((p) => (
              <li key={p} className="flex items-center gap-3 font-medium text-white">
                <span className="grid size-8 place-items-center rounded-full bg-turmeric-500 text-forest-950">
                  <CheckIcon className="size-4" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative min-h-[320px]">
          <Image src="/brand/story-harvest.webp" alt="" fill sizes="(max-width: 768px) 100vw, 560px" className="object-cover" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-forest-800 via-forest-800/10 to-transparent max-md:bg-gradient-to-b" />
        </div>
      </div>
    </section>
  );
}
