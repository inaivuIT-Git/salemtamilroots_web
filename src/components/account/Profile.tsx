"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { api, ApiError } from "@/lib/client-api";
import { useAuth } from "@/lib/session";

type P = { firstName: string; lastName: string; email: string; phone?: string | null };

export function Profile() {
  const t = useTranslations("account");
  const { refresh } = useAuth();
  const [p, setP] = useState<P | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<P>("/api/account/profile")
      .then((r) => setP({ firstName: r.firstName ?? "", lastName: r.lastName ?? "", email: r.email ?? "", phone: r.phone }))
      .catch(() => setMsg({ ok: false, text: t("errLoad") }));
  }, [t]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!p) return;
    setSaving(true);
    setErrors({});
    setMsg(null);
    try {
      const r = await api<P>("/api/account/profile", { method: "PUT", body: { firstName: p.firstName, lastName: p.lastName, email: p.email } });
      setP({ firstName: r.firstName ?? "", lastName: r.lastName ?? "", email: r.email ?? "", phone: r.phone });
      await refresh();
      setMsg({ ok: true, text: t("saved") });
    } catch (err) {
      if (err instanceof ApiError && err.fields) setErrors(err.fields);
      else setMsg({ ok: false, text: err instanceof ApiError ? err.message : t("errGeneric") });
    } finally {
      setSaving(false);
    }
  }

  if (!p) return <p className={msg ? "text-kumkum-700" : "text-muted"}>{msg?.text ?? t("loading")}</p>;
  const input = "w-full rounded-xl border-2 border-line bg-white px-3 py-2.5 outline-none focus:border-forest-600 aria-[invalid=true]:border-kumkum-600";
  const field = (k: "firstName" | "lastName" | "email", label: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-semibold">{label}</span>
      <input value={p[k]} onChange={(e) => setP({ ...p, [k]: e.target.value })} className={input} aria-invalid={!!errors[k]} {...extra} />
      {errors[k] && <span className="text-kumkum-600">{errors[k]}</span>}
    </label>
  );

  return (
    <form onSubmit={save} className="grid max-w-xl gap-4 rounded-[var(--radius-card)] bg-paper p-5 shadow-[var(--shadow-card)] sm:grid-cols-2 sm:p-6" noValidate>
      {field("firstName", t("firstName"), { autoComplete: "given-name" })}
      {field("lastName", t("lastName"), { autoComplete: "family-name" })}
      <div className="sm:col-span-2">{field("email", t("email"), { type: "email", autoComplete: "email" })}</div>
      <div className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="font-semibold">{t("mobile")}</span>
        <span className="rounded-xl bg-cream px-3 py-2.5">+91 {p.phone}</span>
        <span className="text-muted">{t("mobileNote")}</span>
      </div>
      {msg && (
        <p role="status" className={`text-sm sm:col-span-2 ${msg.ok ? "text-forest-700" : "text-kumkum-700"}`}>
          {msg.text}
        </p>
      )}
      <button className="btn btn-primary justify-self-start" disabled={saving}>
        {saving ? t("saving") : t("save")}
      </button>
    </form>
  );
}
