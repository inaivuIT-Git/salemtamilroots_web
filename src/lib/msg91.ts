"use client";

/*
  MSG91 OTP widget, the same one the current site uses (verify.msg91.com/otp-provider.js).
  The widget sends and checks the OTP; it then hands back an access token which the API
  confirms with MSG91 itself (POST /api/Auth/verifyToken) before it signs anyone in.

  Widget id and token: NEXT_PUBLIC_MSG91_WIDGET_ID / NEXT_PUBLIC_MSG91_TOKEN_AUTH (the same
  values as MSG91_CONFIG in the current frontend's config.js). They are public by design:
  MSG91 only lets them send OTPs, and the API never trusts the widget's word alone.
*/
type Cb = (data: { message?: string; type?: string }) => void;
type Msg91Window = Window & {
  initSendOTP?: (config: Record<string, unknown>) => void;
  sendOtp?: (identifier: string, ok: Cb, fail: Cb) => void;
  verifyOtp?: (otp: string, ok: Cb, fail: Cb) => void;
  retryOtp?: (channel: string | null, ok: Cb, fail: Cb) => void;
};

const SRC = "https://verify.msg91.com/otp-provider.js";
let loading: Promise<void> | null = null;

export function msg91Configured() {
  return !!process.env.NEXT_PUBLIC_MSG91_WIDGET_ID && !!process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH;
}

function ready(w: Msg91Window) {
  return typeof w.sendOtp === "function" && typeof w.verifyOtp === "function" && typeof w.retryOtp === "function";
}

export function loadMsg91(): Promise<void> {
  const w = window as Msg91Window;
  if (ready(w)) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const start = () => {
      if (typeof w.initSendOTP !== "function") return reject(new Error("MSG91 did not load"));
      w.initSendOTP({
        widgetId: process.env.NEXT_PUBLIC_MSG91_WIDGET_ID,
        tokenAuth: process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH,
        exposeMethods: true,
        success: () => undefined,
        failure: () => undefined,
      });
      let tries = 0;
      const t = window.setInterval(() => {
        if (ready(w)) {
          window.clearInterval(t);
          resolve();
        } else if (++tries > 40) {
          window.clearInterval(t);
          reject(new Error("MSG91 did not start"));
        }
      }, 150);
    };
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    if (existing && typeof w.initSendOTP === "function") return start();
    const s = existing ?? document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.onload = start;
    s.onerror = () => reject(new Error("MSG91 could not be reached"));
    if (!existing) document.body.appendChild(s);
  }).catch((e) => {
    loading = null;
    throw e;
  });
  return loading;
}

function call(fn: "sendOtp" | "verifyOtp", arg: string): Promise<string | undefined> {
  const w = window as Msg91Window;
  return new Promise((resolve, reject) =>
    w[fn]!(
      arg,
      (d) => resolve(d?.message),
      (d) => reject(new Error(d?.message || "OTP failed")),
    ),
  );
}

/** Sends an OTP by SMS to a 10-digit Indian mobile number. */
export async function sendOtp(mobile10: string) {
  await loadMsg91();
  await call("sendOtp", `91${mobile10}`);
}

/** Checks the OTP; returns the widget's access token for the API to confirm. */
export async function verifyOtp(otp: string): Promise<string> {
  await loadMsg91();
  const token = await call("verifyOtp", otp);
  if (!token) throw new Error("OTP failed");
  return token;
}

export async function resendOtp() {
  await loadMsg91();
  const w = window as Msg91Window;
  await new Promise<void>((resolve, reject) =>
    w.retryOtp!("11", () => resolve(), (d) => reject(new Error(d?.message || "Resend failed"))),
  );
}
