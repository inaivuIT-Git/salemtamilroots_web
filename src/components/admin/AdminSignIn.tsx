"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { api, ApiError } from "@/lib/client-api";
import { useAuth } from "@/lib/session";
import { isAdminRole } from "./AdminShell";

/* Admins sign in with email (or phone) and password, as on the current admin pages. */
export function AdminSignIn() {
  const router = useRouter();
  const params = useSearchParams();
  const next = (() => {
    const n = params.get("next");
    return n && n.startsWith("/admin") && !n.startsWith("//") ? n : "/admin/orders";
  })();
  const { ready, me, refresh, signOut } = useAuth();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && isAdminRole(me?.role)) router.replace(next);
  }, [ready, me, next, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!id.trim() || !password) return setError("Enter your email or phone and your password.");
    setBusy(true);
    try {
      await api("/api/Auth/login", { method: "POST", body: { emailOrPhone: id.trim(), password } });
      const who = await refresh();
      if (!isAdminRole(who?.role)) {
        await signOut();
        setError("This account isn't an admin account.");
        setBusy(false);
        return;
      }
      router.replace(next);
    } catch (err) {
      setError(err instanceof ApiError && err.status !== 500 ? err.message || "Those details didn't match." : "Sign-in failed. Please try again.");
      setBusy(false);
    }
  }

  const input = "w-full rounded-lg border border-line bg-white px-3 py-2.5 outline-none focus:border-forest-600 focus:ring-2 focus:ring-leaf-200";
  return (
    <div className="grid min-h-dvh place-items-center bg-[#f3f5f2] px-4">
      <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-7 shadow-[var(--shadow-card)]" noValidate>
        <div className="flex items-center gap-3">
          <Image src="/brand/logo.png" alt="" width={40} height={38} />
          <div>
            <p className="font-semibold">Salem Tamil Roots</p>
            <p className="text-sm text-muted">Admin sign in</p>
          </div>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Email or phone</span>
          <input id="admin-id" value={id} onChange={(e) => setId(e.target.value)} className={input} autoComplete="username" autoFocus />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Password</span>
          <input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} autoComplete="current-password" />
        </label>
        {error && <p role="alert" className="text-sm text-kumkum-700">{error}</p>}
        <button className="btn btn-primary w-full rounded-lg" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}
