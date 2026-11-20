"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { api, ApiError } from "@/lib/client-api";
import { useAuth } from "@/lib/session";
import { AddressForm } from "@/components/checkout/AddressForm";
import type { Address } from "@/components/checkout/types";

export function Addresses() {
  const t = useTranslations("account");
  const { me } = useAuth();
  const [list, setList] = useState<Address[] | null>(null);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Address[]>("/api/checkout/addresses")
      .then(setList)
      .catch((e) => setError(e instanceof ApiError ? e.message : t("errLoad")));
  }, [t]);

  async function remove(a: Address) {
    if (!window.confirm(t("deleteConfirm", { name: a.name }))) return;
    try {
      setList(await api<Address[]>(`/api/account/addresses/${a.addressId}`, { method: "DELETE" }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("errGeneric"));
    }
  }

  if (!list) return <p className={error ? "text-kumkum-700" : "text-muted"}>{error ?? t("loading")}</p>;
  const saved = (next: Address[]) => {
    setList(next);
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-kumkum-700">{error}</p>}
      {list.length === 0 && editing !== "new" && <p className="text-muted">{t("noAddresses")}</p>}
      <ul className="grid gap-4 md:grid-cols-2">
        {list.map((a) =>
          editing === a.addressId ? (
            <li key={a.addressId} className="md:col-span-2">
              <AddressForm defaultPhone={me?.phone ?? ""} initial={a} onSaved={saved} onCancel={() => setEditing(null)} />
            </li>
          ) : (
            <li key={a.addressId} className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-paper p-5 shadow-[var(--shadow-card)]">
              <p className="text-sm leading-relaxed">
                <strong className="block text-base">{a.name}</strong>
                {[a.line1, a.line2].filter(Boolean).join(", ")}
                <br />
                {[a.city, a.state].filter(Boolean).join(", ")} {a.pincode}
                {a.phone && <span className="block text-muted">{a.phone}</span>}
              </p>
              <div className="mt-auto flex gap-4 text-sm font-semibold">
                <button type="button" className="text-forest-700 hover:underline" onClick={() => setEditing(a.addressId)}>
                  {t("edit")}
                </button>
                <button type="button" className="text-kumkum-600 hover:underline" onClick={() => remove(a)}>
                  {t("delete")}
                </button>
              </div>
            </li>
          ),
        )}
      </ul>
      {editing === "new" ? (
        <AddressForm defaultPhone={me?.phone ?? ""} onSaved={saved} onCancel={() => setEditing(null)} />
      ) : (
        <button type="button" className="btn btn-ghost self-start" onClick={() => setEditing("new")}>
          + {t("addAddress")}
        </button>
      )}
    </div>
  );
}
