"use client";

/*
  Cashfree's hosted checkout (sdk.cashfree.com/js/v3). The API creates the Cashfree order and
  hands back a payment session id; the customer pays on Cashfree's page and comes back to
  returnUrl. Whether they paid is then asked of the API, which asks Cashfree.
*/
type CashfreeFactory = (opts: { mode: "sandbox" | "production" }) => {
  checkout: (opts: { paymentSessionId: string; redirectTarget?: "_self" | "_blank" | "_top"; returnUrl?: string }) => Promise<unknown>;
};

const SRC = "https://sdk.cashfree.com/js/v3/cashfree.js";
let loading: Promise<CashfreeFactory> | null = null;

function load(): Promise<CashfreeFactory> {
  const w = window as Window & { Cashfree?: CashfreeFactory };
  if (w.Cashfree) return Promise.resolve(w.Cashfree);
  loading ??= new Promise<CashfreeFactory>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.onload = () => (w.Cashfree ? resolve(w.Cashfree) : reject(new Error("Cashfree did not load")));
    s.onerror = () => reject(new Error("Cashfree could not be reached"));
    document.body.appendChild(s);
  }).catch((e) => {
    loading = null;
    throw e;
  });
  return loading;
}

/** Sends the browser to Cashfree's payment page. */
export async function openCashfree(paymentSessionId: string, mode: string, returnUrl: string) {
  const Cashfree = await load();
  await Cashfree({ mode: mode === "production" ? "production" : "sandbox" }).checkout({
    paymentSessionId,
    redirectTarget: "_self",
    returnUrl,
  });
}
