"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api, ApiError } from "@/lib/client-api";
import type { Address } from "./types";

const STATES = [
  "Tamil Nadu", "Puducherry", "Karnataka", "Kerala", "Andhra Pradesh", "Telangana", "Maharashtra", "Goa", "Gujarat",
  "Delhi", "Haryana", "Punjab", "Rajasthan", "Uttar Pradesh", "Uttarakhand", "Himachal Pradesh", "Jammu and Kashmir",
  "Ladakh", "Madhya Pradesh", "Chhattisgarh", "Bihar", "Jharkhand", "Odisha", "West Bengal", "Sikkim", "Assam",
  "Arunachal Pradesh", "Nagaland", "Manipur", "Mizoram", "Tripura", "Meghalaya", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep",
];

type Fields = { name: string; phone: string; line1: string; line2: string; city: string; state: string; pincode: string };

export function AddressForm({ defaultPhone, onSaved, onCancel }: { defaultPhone: string; onSaved: (list: Address[]) => void; onCancel?: () => void }) {
  const t = useTranslations("address");
  const [f, setF] = useState<Fields>({ name: "", phone: defaultPhone, line1: "", line2: "", city: "", state: "Tamil Nadu", pincode: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((v) => ({ ...v, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setError(null);
    setSaving(true);
    try {
      onSaved(await api<Address[]>("/api/checkout/addresses", { method: "POST", body: f }));
    } catch (err) {
      if (err instanceof ApiError && err.fields) setErrors(err.fields);
      else setError(err instanceof ApiError ? err.message : t("errGeneric"));
    } finally {
      setSaving(false);
    }
  }

  const input = "w-full rounded-xl border-2 border-line bg-white px-3 py-2.5 outline-none focus:border-forest-600 aria-[invalid=true]:border-kumkum-600";
  const field = (k: keyof Fields, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-semibold">{label}</span>
      <input value={f[k]} onChange={set(k)} className={input} aria-invalid={!!errors[k]} {...props} />
      {errors[k] && <span className="text-kumkum-600">{errors[k]}</span>}
    </label>
  );

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-2xl border-2 border-dashed border-leaf-400 p-4 sm:grid-cols-2" noValidate>
      <p className="font-semibold sm:col-span-2">{t("title")}</p>
      {field("name", t("name"), { autoComplete: "name" })}
      {field("phone", t("phone"), { type: "tel", inputMode: "numeric", autoComplete: "tel-national" })}
      <div className="sm:col-span-2">{field("line1", t("line1"), { autoComplete: "address-line1" })}</div>
      <div className="sm:col-span-2">{field("line2", t("line2"), { autoComplete: "address-line2" })}</div>
      {field("city", t("city"), { autoComplete: "address-level2" })}
      {field("pincode", t("pincode"), { inputMode: "numeric", maxLength: 6, autoComplete: "postal-code" })}
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="font-semibold">{t("state")}</span>
        <select value={f.state} onChange={set("state")} className={input} aria-invalid={!!errors.state}>
          {STATES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      {error && <p className="text-sm text-kumkum-600 sm:col-span-2">{error}</p>}
      <div className="flex gap-3 sm:col-span-2">
        <button className="btn btn-primary" disabled={saving}>{saving ? t("saving") : t("save")}</button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>{t("cancel")}</button>
        )}
      </div>
    </form>
  );
}
