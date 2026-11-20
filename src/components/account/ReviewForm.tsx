"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api, ApiError } from "@/lib/client-api";
import { StarIcon } from "@/components/ui/icons";

/** Review a delivered product. Opens from a "Write a review" link under the item. */
export function ReviewForm({ orderId, productId, productName, onDone }: { orderId: number; productId: number; productName: string; onDone: () => void }) {
  const t = useTranslations("review");
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!open)
    return (
      <button type="button" className="text-sm font-semibold text-forest-700 hover:underline" onClick={() => setOpen(true)}>
        ★ {t("write")}
      </button>
    );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) return setError(t("errRating"));
    setBusy(true);
    setError(null);
    try {
      await api("/api/account/reviews", { method: "POST", body: { orderId, productId, rating, title, comment } });
      onDone(); // the order page then shows the thank-you in place of this form
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("errGeneric"));
      setBusy(false);
    }
  }

  const shown = hover || rating;
  return (
    <form onSubmit={submit} className="mt-1 flex flex-col gap-3 rounded-2xl bg-cream p-4" noValidate>
      <fieldset>
        <legend className="mb-1 text-sm font-semibold">{t("rate", { name: productName })}</legend>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
              <input type="radio" name={`rating-${productId}`} value={n} checked={rating === n} onChange={() => setRating(n)} className="sr-only" />
              <StarIcon filled={n <= shown} className={`size-8 ${n <= shown ? "text-turmeric-500" : "text-line"}`} />
              <span className="sr-only">{t("stars", { count: n })}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={100}
        placeholder={t("titlePlaceholder")}
        aria-label={t("titlePlaceholder")}
        className="rounded-xl border-2 border-line bg-white px-3 py-2 text-sm outline-none focus:border-forest-600"
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={2000}
        rows={3}
        placeholder={t("commentPlaceholder")}
        aria-label={t("commentPlaceholder")}
        className="rounded-xl border-2 border-line bg-white px-3 py-2 text-sm outline-none focus:border-forest-600"
      />
      {error && <p role="alert" className="text-sm text-kumkum-700">{error}</p>}
      <div className="flex gap-3">
        <button className="btn btn-primary px-5 py-2.5" disabled={busy}>{busy ? t("sending") : t("submit")}</button>
        <button type="button" className="btn btn-ghost px-5 py-2.5" onClick={() => setOpen(false)} disabled={busy}>{t("cancel")}</button>
      </div>
    </form>
  );
}
