"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { api, ApiError } from "@/lib/client-api";
import { RichText } from "./RichText";
import type { Options } from "./AdminProductNew";

type Pair = { en?: string | null; ta?: string | null };
type Text = {
  productId: number;
  name: string;
  categoryId?: number | null;
  tag?: string | null;
  seasonal: boolean;
  sizes: number;
  title: Pair;
  subtitle: Pair;
  summary: Pair;
  about: Pair;
  story: { key: string; label: string; en?: string | null; ta?: string | null }[];
};

const input = "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-forest-600";
const label = "flex flex-col gap-1 text-xs font-medium text-muted";
const primary = "rounded-lg bg-forest-800 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-700 disabled:opacity-50";
const NAME = /^[A-Za-z0-9]+( [A-Za-z0-9]+)*$/;

/* The product's words in English and Tamil: name, titles, descriptions and the story sections. */
export function AdminProductText({ productId }: { productId: number }) {
  const [t, setT] = useState<Text | null>(null);
  const [original, setOriginal] = useState("");
  const [cats, setCats] = useState<Options["categories"]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [allSizes, setAllSizes] = useState(true);
  // Bumped after a save so the editors take the cleaned text from the API.
  const [round, setRound] = useState(0);

  useEffect(() => {
    api<Text>(`/api/admin/products/${productId}/text`)
      .then((x) => {
        setT(x);
        setOriginal(JSON.stringify(x));
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "This product could not be loaded."));
    api<Options>("/api/admin/products/options").then((o) => setCats(o.categories)).catch(() => setCats([]));
  }, [productId]);

  const dirty = !!t && JSON.stringify(t) !== original;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!t) {
    return (
      <div className="flex flex-col gap-4">
        <Link href={`/admin/products/${productId}`} className="text-sm font-medium text-forest-700 hover:underline">← Product</Link>
        {error ? <p className="rounded-lg bg-kumkum-100 p-3 text-sm text-kumkum-700">{error}</p> : <p className="text-muted">Loading…</p>}
      </div>
    );
  }

  const was = JSON.parse(original || "{}") as Text;
  const name = t.name.replace(/\s+/g, " ").trim();
  const nameProblem = !NAME.test(name) ? "English letters, numbers and spaces only (it becomes the web address)." : null;
  const renamed = name.toLowerCase() !== (was.name ?? "").toLowerCase();
  const set = (patch: Partial<Text>) => setT({ ...t, ...patch });
  const pair = (key: "title" | "subtitle" | "summary" | "about", lang: "en" | "ta", v: string) => set({ [key]: { ...t[key], [lang]: v } } as Partial<Text>);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (nameProblem || !t) return;
    if (renamed && !confirm(`Rename to "${name}"? The product's web address changes for every size, so old links to it stop working.`)) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const saved = await api<Text>(`/api/admin/products/${productId}/text`, {
        method: "PUT",
        body: {
          name,
          categoryId: t.categoryId,
          tag: t.tag,
          seasonal: t.seasonal,
          title: t.title,
          subtitle: t.subtitle,
          summary: t.summary,
          about: t.about,
          story: t.story.map((s) => ({ key: s.key, en: s.en, ta: s.ta })),
          allSizes,
        },
      });
      setT(saved);
      setOriginal(JSON.stringify(saved));
      setRound((r) => r + 1);
      setNotice(allSizes || renamed ? `Saved${saved.sizes > 1 ? ` for all ${saved.sizes} sizes` : ""}.` : "Saved for this size.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The words could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  // English and Tamil side by side on a wide screen, one above the other on a phone.
  // A plain function, not a component: a component declared here would remount on every keystroke.
  const both = (k: "subtitle" | "summary" | "about", heading: string, rows = 3) => (
    <div className="grid gap-3 md:grid-cols-2">
      <RichText key={`${k}-en-${round}`} id={`${k}-en`} label={`${heading} (English)`} value={t[k].en ?? ""} onChange={(v) => pair(k, "en", v)} minRows={rows} />
      <RichText key={`${k}-ta-${round}`} id={`${k}-ta`} label={`${heading} (Tamil)`} value={t[k].ta ?? ""} onChange={(v) => pair(k, "ta", v)} lang="ta" minRows={rows} />
    </div>
  );

  return (
    <form onSubmit={save} className="flex flex-col gap-5 pb-24">
      <div className="flex flex-col gap-2">
        <Link href={`/admin/products/${productId}`} className="text-sm font-medium text-forest-700 hover:underline">← {was.name}</Link>
        <h1 className="text-2xl font-semibold">Words and story</h1>
        <p className="text-sm text-muted">Empty sections are left out of the shop page. Pasted text loses its formatting; use the buttons for bold and lists.</p>
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-line bg-white p-4">
        <h2 className="font-semibold">Name and category</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className={label}>
            Name (English, makes the web address)
            <input id="text-name" required maxLength={80} value={t.name} onChange={(e) => set({ name: e.target.value })} className={input} aria-invalid={!!nameProblem} />
            {nameProblem ? <span className="font-normal text-kumkum-700">{nameProblem}</span> : renamed && <span className="font-normal text-[#6b4a00]">Renaming changes the web address of every size.</span>}
          </label>
          <label className={label}>
            Category
            <select id="text-category" value={t.categoryId ?? ""} onChange={(e) => set({ categoryId: Number(e.target.value) || null })} className={input}>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.active ? "" : " (hidden)"}</option>
              ))}
            </select>
          </label>
          <label className={label}>
            Title (English)
            <input id="title-en" value={t.title.en ?? ""} onChange={(e) => pair("title", "en", e.target.value)} placeholder={t.name} className={input} />
          </label>
          <label className={label}>
            Title (Tamil)
            <input id="title-ta" lang="ta" value={t.title.ta ?? ""} onChange={(e) => pair("title", "ta", e.target.value)} className={input} />
          </label>
          <label className={label}>
            Tag (for search)
            <input id="text-tag" value={t.tag ?? ""} onChange={(e) => set({ tag: e.target.value })} className={input} />
          </label>
          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input type="checkbox" checked={t.seasonal} onChange={(e) => set({ seasonal: e.target.checked })} className="size-4 accent-forest-800" />
            Seasonal product
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-line bg-white p-4">
        <h2 className="font-semibold">Descriptions</h2>
        {both("subtitle", "One line under the title", 1)}
        {both("summary", "Short description")}
        {both("about", "About this product", 5)}
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-line bg-white p-4">
        <h2 className="font-semibold">Story sections</h2>
        {t.story.map((s, i) => (
          <div key={s.key} className="grid gap-3 border-t border-line pt-4 first:border-0 first:pt-0 md:grid-cols-2">
            {(["en", "ta"] as const).map((lang) => (
              <RichText
                key={`${s.key}-${lang}-${round}`}
                id={`story-${s.key}-${lang}`}
                label={`${s.label} (${lang === "en" ? "English" : "Tamil"})`}
                lang={lang === "ta" ? "ta" : undefined}
                value={s[lang] ?? ""}
                onChange={(v) => set({ story: t.story.map((x, j) => (j === i ? { ...x, [lang]: v } : x)) })}
              />
            ))}
          </div>
        ))}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 px-4 py-3 backdrop-blur" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom, 0px))" }}>
        <div className="flex flex-wrap items-center gap-3">
          <button disabled={busy || !!nameProblem || !dirty} className={primary}>{busy ? "Saving…" : "Save"}</button>
          {t.sizes > 1 && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={allSizes || renamed} disabled={renamed} onChange={(e) => setAllSizes(e.target.checked)} className="size-4 accent-forest-800" />
              For all {t.sizes} sizes
            </label>
          )}
          <span aria-live="polite" className="text-sm">
            {error && <span role="alert" className="text-kumkum-700">{error}</span>}
            {notice && !error && !dirty && <span className="text-forest-800">{notice}</span>}
            {dirty && !error && <span className="text-muted">Unsaved changes</span>}
          </span>
        </div>
      </div>
    </form>
  );
}
