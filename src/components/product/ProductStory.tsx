import { useTranslations } from "next-intl";
import type { StrpxKey, StrpxSection } from "@/lib/types";

/*
  Product story laid out by the STRPX v2.0 framework (SalemTamilRoots Product Experience):
  sections appear in the framework's order, and only when they have content.
  The html in each section was sanitised in src/lib/html.ts.
*/
const icon: Record<StrpxKey, string> = {
  oneLine: "✨",
  about: "🌾",
  echoes: "❤️",
  memory: "🕰️",
  why: "🌱",
  ingredients: "🌿",
  love: "⭐",
  heritage: "🏺",
  tamilLife: "🌸",
  whoFor: "🤍",
  directions: "✍️",
  storage: "📦",
  important: "⚠️",
  promise: "💙",
  thanks: "🙏",
};

function Body({ html, className = "" }: { html: string; className?: string }) {
  return <div className={`strp-prose ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Heading({ k, className = "" }: { k: StrpxKey; className?: string }) {
  const t = useTranslations("strpx");
  return (
    <h2 className={`flex items-center gap-3 font-display text-2xl font-semibold md:text-3xl ${className}`}>
      <span aria-hidden className="text-[0.85em]">
        {icon[k]}
      </span>
      {t(k)}
    </h2>
  );
}

export function ProductStory({ sections }: { sections: StrpxSection[] }) {
  const t = useTranslations("strpx");
  const by = Object.fromEntries(sections.map((s) => [s.key, s.html])) as Partial<Record<StrpxKey, string>>;
  const shown = sections.filter((s) => s.key !== "oneLine"); // "In One Line" sits under the product title
  if (!shown.length) return null;

  const cards = (keys: StrpxKey[], tones: string[]) =>
    keys
      .filter((k) => by[k])
      .map((k, i) => (
        <section key={k} id={`strpx-${k}`} className={`scroll-mt-32 flex flex-col gap-4 rounded-[var(--radius-card)] p-7 md:p-8 ${tones[i % tones.length]}`}>
          <Heading k={k} className="text-forest-800" />
          <Body html={by[k]!} className="text-[17px] leading-relaxed" />
        </section>
      ));

  const mid = cards(["why", "ingredients", "love", "heritage"], ["bg-paper shadow-[var(--shadow-card)]", "bg-leaf-100", "bg-turmeric-100", "bg-tan-200/50"]);
  const practical = cards(["whoFor", "directions", "storage"], ["bg-paper shadow-[var(--shadow-card)]"]);

  return (
    <div className="mt-16 flex flex-col gap-10">
      <nav aria-label={t("onThisPage")} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <span className="shrink-0 self-center pr-2 text-sm font-semibold text-muted">{t("onThisPage")}</span>
        {shown.map((s) => (
          <a
            key={s.key}
            href={`#strpx-${s.key}`}
            className="shrink-0 rounded-full border border-line bg-paper px-3.5 py-1.5 text-sm font-medium hover:border-forest-600 hover:text-forest-700"
          >
            <span aria-hidden>{icon[s.key]} </span>
            {t(s.key)}
          </a>
        ))}
      </nav>

      {by.about && (
        <section id="strpx-about" className="scroll-mt-32 grid gap-6 rounded-[2rem] bg-paper p-8 shadow-[var(--shadow-card)] md:grid-cols-[280px_minmax(0,1fr)] md:p-12">
          <Heading k="about" className="text-forest-800" />
          <Body html={by.about} className="text-[17px] leading-relaxed" />
        </section>
      )}

      {by.echoes && (
        <section id="strpx-echoes" className="relative scroll-mt-32 overflow-hidden rounded-[2rem] bg-forest-800 px-8 py-12 text-leaf-100 md:px-16 md:py-16">
          <span aria-hidden className="pointer-events-none absolute -top-10 right-6 font-display text-[220px] leading-none text-white/5">
            “
          </span>
          <Heading k="echoes" className="text-turmeric-200" />
          <Body html={by.echoes} className="relative mt-6 font-display text-xl leading-relaxed text-white md:text-2xl" />
        </section>
      )}

      {by.memory && (
        <section id="strpx-memory" className="scroll-mt-32 rounded-[2rem] border-2 border-dashed border-turmeric-500/70 bg-turmeric-100/60 px-8 py-10 md:px-14">
          <Heading k="memory" className="text-turmeric-600" />
          <Body html={by.memory} className="mt-5 font-display text-xl leading-relaxed text-ink italic" />
        </section>
      )}

      {mid.length > 0 && <div className="grid gap-6 md:grid-cols-2">{mid}</div>}

      {by.tamilLife && (
        <section id="strpx-tamilLife" className="scroll-mt-32 rounded-[2rem] bg-kumkum-100 px-8 py-10 md:px-14 md:py-12">
          <Heading k="tamilLife" className="text-kumkum-700" />
          <Body html={by.tamilLife} className="mt-5 text-lg leading-relaxed" />
        </section>
      )}

      {practical.length > 0 && (
        <div className={`grid gap-6 ${practical.length === 3 ? "md:grid-cols-3" : practical.length === 2 ? "md:grid-cols-2" : ""}`}>{practical}</div>
      )}

      {by.important && (
        <section id="strpx-important" role="note" className="scroll-mt-32 flex flex-col gap-3 rounded-[var(--radius-card)] border-l-4 border-turmeric-600 bg-turmeric-100 px-7 py-6">
          <Heading k="important" className="text-xl text-ink md:text-2xl" />
          <Body html={by.important} />
        </section>
      )}

      {(by.promise || by.thanks) && (
        <section className="grid gap-10 rounded-[2rem] bg-forest-900 px-8 py-12 text-leaf-100 md:grid-cols-2 md:px-14">
          {by.promise && (
            <div id="strpx-promise" className="scroll-mt-32 flex flex-col gap-4">
              <Heading k="promise" className="text-white" />
              <Body html={by.promise} className="text-leaf-200 italic" />
            </div>
          )}
          {by.thanks && (
            <div id="strpx-thanks" className="scroll-mt-32 flex flex-col gap-4">
              <Heading k="thanks" className="text-turmeric-200" />
              <Body html={by.thanks} className="font-display text-xl leading-relaxed text-white" />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
