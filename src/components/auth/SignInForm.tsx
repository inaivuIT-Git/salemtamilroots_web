"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { api, ApiError } from "@/lib/client-api";
import { msg91Configured, resendOtp, sendOtp, verifyOtp } from "@/lib/msg91";
import { rememberWelcomeGift, useAuth, type WelcomeGiftInfo } from "@/lib/session";

/*
  One screen for sign-in and sign-up: mobile number, then the OTP sent by SMS.
  A number we haven't seen before becomes a new customer account (POST /api/Auth/login-via-otp
  does both), so there is no separate sign-up form.
*/
type LoginResult = { user?: { welcomeGift?: WelcomeGiftInfo | null } };

const RESEND_AFTER = 30; // seconds

/** Only come back to a page on this site. */
function safeNext(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "/";
  return raw.replace(/^\/ta(?=\/|$)/, "") || "/";
}

export function SignInForm() {
  const t = useTranslations("signin");
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { signedIn, ready, refresh } = useAuth();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wait, setWait] = useState(0);
  const otpRef = useRef<HTMLInputElement>(null);

  // Already signed in: carry on.
  useEffect(() => {
    if (ready && signedIn) router.replace(next);
  }, [ready, signedIn, next, router]);

  useEffect(() => {
    if (wait <= 0) return;
    const id = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(id);
  }, [wait]);

  const mobile = phone.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
  const validMobile = /^[6-9]\d{9}$/.test(mobile);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validMobile) return setError(t("errPhone"));
    if (!msg91Configured()) return setError(t("errNotConfigured"));
    setBusy(true);
    try {
      await sendOtp(mobile);
      setStep("otp");
      setOtp("");
      setWait(RESEND_AFTER);
      window.setTimeout(() => otpRef.current?.focus(), 50);
    } catch {
      setError(t("errSend"));
    } finally {
      setBusy(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const code = otp.replace(/\D/g, "");
    if (code.length < 4) return setError(t("errOtp"));
    setBusy(true);
    try {
      const accessToken = await verifyOtp(code).catch(() => {
        throw new ApiError(400, "OTP_WRONG", t("errOtpWrong"));
      });
      // The API confirms the OTP with MSG91 itself, then signs in (or creates the account).
      await api("/api/Auth/verifyToken", { method: "POST", body: { accessToken } });
      const result = await api<LoginResult>("/api/Auth/login-via-otp", { method: "POST", body: { phone: mobile } });
      rememberWelcomeGift(result?.user?.welcomeGift ?? null);
      await refresh();
      router.replace(next);
    } catch (err) {
      setError(messageFor(err));
      setBusy(false);
    }
  }

  async function onResend() {
    setError(null);
    setBusy(true);
    try {
      await resendOtp();
      setWait(RESEND_AFTER);
    } catch {
      setError(t("errSend"));
    } finally {
      setBusy(false);
    }
  }

  function messageFor(err: unknown) {
    if (!(err instanceof ApiError)) return t("errGeneric");
    switch (err.code) {
      case "OTP_WRONG":
        return t("errOtpWrong");
      case "OTP_REQUIRED":
      case "OTP_NUMBER_UNKNOWN":
        return t("errOtpExpired");
      case "ACCOUNT_DEACTIVATED":
      case "ACCOUNT_BLOCKED":
      case "ACCOUNT_SUSPENDED":
        return t("errBlocked");
      case "LOGIN_METHOD_MISMATCH":
      case "LOGIN_METHOD_NOT_ALLOWED":
        return t("errMethod");
      case "NETWORK":
        return t("errNetwork");
      default:
        return err.status >= 500 ? t("errGeneric") : err.message || t("errGeneric");
    }
  }

  return (
    <div className="w-full max-w-md rounded-[2rem] bg-paper p-7 shadow-[var(--shadow-lift)] sm:p-9">
      <div className="mb-6 flex items-center gap-3">
        <Image src="/brand/logo.png" alt="" width={44} height={42} />
        <p className="eyebrow">{t("eyebrow")}</p>
      </div>
      <h1 className="font-display text-3xl font-semibold text-forest-800">{step === "phone" ? t("title") : t("otpTitle")}</h1>
      <p className="mt-2 text-muted">{step === "phone" ? t("intro") : t("otpIntro", { phone: `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}` })}</p>

      {step === "phone" ? (
        <form onSubmit={onSend} className="mt-7 flex flex-col gap-4" noValidate>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">{t("phoneLabel")}</span>
            <div className="flex items-center rounded-2xl border-2 border-line bg-white focus-within:border-forest-600">
              <span className="pl-4 font-semibold text-muted">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={14}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent px-3 py-3.5 text-lg tracking-wide outline-none"
                placeholder="98765 43210"
                aria-invalid={!!error}
                autoFocus
              />
            </div>
          </label>
          {error && <p role="alert" className="text-sm font-medium text-kumkum-600">{error}</p>}
          <button type="submit" className="btn btn-primary w-full py-4 text-base" disabled={busy}>
            {busy ? t("sending") : t("sendOtp")}
          </button>
          <p className="text-xs text-muted">{t("newHere")}</p>
        </form>
      ) : (
        <form onSubmit={onVerify} className="mt-7 flex flex-col gap-4" noValidate>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">{t("otpLabel")}</span>
            <input
              ref={otpRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="rounded-2xl border-2 border-line bg-white px-4 py-3.5 text-center text-2xl font-semibold tracking-[0.5em] outline-none focus:border-forest-600"
              aria-invalid={!!error}
            />
          </label>
          {error && <p role="alert" className="text-sm font-medium text-kumkum-600">{error}</p>}
          <button type="submit" className="btn btn-primary w-full py-4 text-base" disabled={busy}>
            {busy ? t("verifying") : t("verify")}
          </button>
          <div className="flex items-center justify-between text-sm">
            <button type="button" className="font-semibold text-forest-700 hover:underline" onClick={() => { setStep("phone"); setError(null); }}>
              {t("changeNumber")}
            </button>
            {wait > 0 ? (
              <span className="text-muted">{t("resendIn", { seconds: wait })}</span>
            ) : (
              <button type="button" className="font-semibold text-forest-700 hover:underline disabled:opacity-50" onClick={onResend} disabled={busy}>
                {t("resend")}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
