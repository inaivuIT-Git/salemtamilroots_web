"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { api, ApiError } from "@/lib/client-api";
import { PaymentBadge, StatusBadge, human, inr, when } from "./labels";

type Next = { id: number; text: string };
type Item = {
  orderItemId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  stage: string;
  stageId: number;
  expectedDeliveryDate?: string | null;
  comment?: string | null;
  next: Next[];
};
type Order = {
  orderId: number;
  orderNumber: string;
  orderDate?: string | null;
  status: string;
  stage?: string | null;
  paymentMethod: "COD" | "ONLINE";
  paymentStatus?: string | null;
  amounts: { subtotal: number; discount: number; coupon: number; shipping: number; total: number };
  customer: { userId: number; name?: string | null; email?: string | null; phone?: string | null };
  address?: { name?: string | null; phone?: string | null; line1?: string | null; line2?: string | null; city?: string | null; district?: string | null; state?: string | null; pincode?: string | null } | null;
  shipping: { trackingId?: string | null; courier?: string | null; shippedAt?: string | null; deliveredAt?: string | null };
  cancellation?: { at?: string | null; reason?: string | null; note?: string | null } | null;
  items: Item[];
  couriers: { id: number; name: string }[];
  payments: { id: number; reference: string; method?: string | null; amount: number; status: string; at?: string | null; failure?: string | null }[];
  invoice?: { number?: string | null; hasFile: boolean } | null;
  actions: { markPaid: boolean; cancel: boolean; refund: boolean; refundable: number; emailInvoice: boolean };
};

const SHIPMENT_ASSIGNED = 69; // InternalOrderStatus: needs courier and tracking

const REASONS = [
  { id: 5, label: "Address problem" },
  { id: 1, label: "Customer changed their mind" },
  { id: 3, label: "Ordered by mistake" },
  { id: 4, label: "Delivery would take too long" },
  { id: 99, label: "Other" },
];

export function AdminOrder({ orderId }: { orderId: number }) {
  const [o, setO] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [panel, setPanel] = useState<null | "paid" | "cancel" | "refund">(null);

  const load = useCallback(() => {
    api<Order>(`/api/admin/orders/${orderId}`)
      .then(setO)
      .catch((e) => setError(e instanceof ApiError ? e.message : "This order could not be loaded."));
  }, [orderId]);
  useEffect(load, [load]);

  /** Runs an action that answers with the updated order. */
  async function run(path: string, body: Record<string, unknown>, done: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const next = await api<Order | boolean>(path, { method: "POST", body });
      if (next && typeof next === "object") setO(next);
      setNotice(done);
      setPanel(null);
      return true;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "That didn't work. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (!o) return error ? <p className="rounded-lg bg-kumkum-100 p-3 text-sm text-kumkum-700">{error}</p> : <p className="text-muted">Loading order…</p>;

  // Next steps the items share; each applies to every item that can take it.
  const nextSteps = Object.values(
    o.items.flatMap((i) => i.next).reduce<Record<number, Next & { n: number }>>((acc, s) => {
      acc[s.id] = { ...s, n: (acc[s.id]?.n ?? 0) + 1 };
      return acc;
    }, {}),
  );
  const a = o.address;

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/orders" className="self-start text-sm font-medium text-forest-700 hover:underline">← Orders</Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tabular-nums">{o.orderNumber}</h1>
          <p className="text-sm text-muted">Placed {when(o.orderDate, true)} · {o.items.reduce((n, i) => n + i.quantity, 0)} items</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={o.status} />
          <PaymentBadge status={o.paymentStatus} method={o.paymentMethod} />
          <span className="text-xl font-semibold tabular-nums">{inr(o.amounts.total)}</span>
        </div>
      </header>

      {notice && <p role="status" className="rounded-lg bg-leaf-100 p-3 text-sm text-forest-800">{notice}</p>}
      {error && <p role="alert" className="rounded-lg bg-kumkum-100 p-3 text-sm text-kumkum-700">{error}</p>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          {nextSteps.length > 0 && (
            <NextStep steps={nextSteps} itemCount={o.items.length} couriers={o.couriers} hasTracking={!!o.shipping.trackingId} busy={busy}
              onApply={(body) => run(`/api/admin/orders/${o.orderId}/advance`, body, "Status updated.")} />
          )}

          <section className="overflow-x-auto rounded-xl border border-line bg-white">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-[#f6f7f5] text-left text-xs font-semibold tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Move this item</th>
                </tr>
              </thead>
              <tbody>
                {o.items.map((i) => (
                  <ItemRow key={i.orderItemId} item={i} busy={busy}
                    onMove={(status) => run(`/api/admin/orders/${o.orderId}/items/${i.orderItemId}/status`, { status }, `${i.productName}: status updated.`)} />
                ))}
              </tbody>
            </table>
          </section>

          <section className="rounded-xl border border-line bg-white p-4">
            <h2 className="mb-3 font-semibold">Payments</h2>
            {o.payments.length === 0 ? (
              <p className="text-sm text-muted">{o.paymentMethod === "COD" ? "Cash on delivery: collected by the courier." : "No payment attempts recorded."}</p>
            ) : (
              <ul className="flex flex-col divide-y divide-line text-sm">
                {o.payments.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span className="min-w-0">
                      <span className="block font-mono text-xs break-all">{p.reference}</span>
                      <span className="text-xs text-muted">{[p.method, when(p.at, true)].filter(Boolean).join(" · ")}{p.failure ? ` · ${p.failure}` : ""}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <PaymentBadge status={p.status} method={o.paymentMethod} />
                      <span className="font-semibold tabular-nums">{inr(p.amount)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-5">
          <section className="rounded-xl border border-line bg-white p-4 text-sm">
            <h2 className="mb-2 font-semibold">Deliver to</h2>
            {a ? (
              <p className="leading-relaxed">
                <strong>{a.name}</strong>
                <br />
                {[a.line1, a.line2].filter(Boolean).join(", ")}
                <br />
                {[a.city, a.district !== a.city ? a.district : null, a.state].filter(Boolean).join(", ")} {a.pincode}
                <br />
                <span className="tabular-nums">{a.phone}</span>
              </p>
            ) : (
              <p className="text-muted">No delivery address on this order.</p>
            )}
            <h2 className="mt-4 mb-1 font-semibold">Customer</h2>
            <p>{o.customer.name || "—"}</p>
            <p className="text-muted tabular-nums">{[o.customer.phone, o.customer.email].filter(Boolean).join(" · ")}</p>
          </section>

          <section className="rounded-xl border border-line bg-white p-4 text-sm">
            <h2 className="mb-2 font-semibold">Shipping</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <dt className="text-muted">Courier</dt><dd>{o.shipping.courier || "—"}</dd>
              <dt className="text-muted">Tracking</dt><dd className="font-mono text-xs break-all">{o.shipping.trackingId || "—"}</dd>
              <dt className="text-muted">Shipped</dt><dd>{when(o.shipping.shippedAt)}</dd>
              <dt className="text-muted">Delivered</dt><dd>{when(o.shipping.deliveredAt)}</dd>
            </dl>
          </section>

          <section className="rounded-xl border border-line bg-white p-4 text-sm">
            <h2 className="mb-2 font-semibold">Amounts</h2>
            <dl className="grid grid-cols-[1fr_auto] gap-y-1 tabular-nums">
              <dt className="text-muted">Items (MRP)</dt><dd>{inr(o.amounts.subtotal)}</dd>
              {o.amounts.discount > 0 && (<><dt className="text-muted">Discount</dt><dd>− {inr(o.amounts.discount)}</dd></>)}
              {o.amounts.coupon > 0 && (<><dt className="text-muted">Coupon</dt><dd>− {inr(o.amounts.coupon)}</dd></>)}
              <dt className="text-muted">Shipping</dt><dd>{o.amounts.shipping ? inr(o.amounts.shipping) : "Free"}</dd>
              <dt className="border-t border-line pt-1 font-semibold">Total</dt><dd className="border-t border-line pt-1 font-semibold">{inr(o.amounts.total)}</dd>
            </dl>
          </section>

          {o.cancellation && (
            <section className="rounded-xl border border-kumkum-100 bg-kumkum-100/40 p-4 text-sm">
              <h2 className="mb-1 font-semibold text-kumkum-700">Cancelled {when(o.cancellation.at, true)}</h2>
              {o.cancellation.reason && <p>Reason: {o.cancellation.reason.replace(/([a-z])([A-Z])/g, "$1 $2")}</p>}
              {o.cancellation.note && <p className="text-muted">{o.cancellation.note}</p>}
            </section>
          )}

          <section className="flex flex-col gap-2 rounded-xl border border-line bg-white p-4 text-sm">
            <h2 className="font-semibold">Actions</h2>
            {o.actions.emailInvoice && (
              <button type="button" disabled={busy} className="rounded-lg border border-line px-3 py-2 text-left hover:bg-[#f6f7f5]"
                onClick={() => run(`/api/admin/orders/${o.orderId}/invoice/email`, {}, `Invoice ${o.invoice?.number ?? ""} emailed to the customer.`)}>
                Email the invoice to the customer
              </button>
            )}
            {o.actions.markPaid && <ActionToggle label="Mark as paid" open={panel === "paid"} onOpen={() => setPanel(panel === "paid" ? null : "paid")} />}
            {panel === "paid" && (
              <NoteForm busy={busy} hint="Only for payments you've confirmed outside the website, e.g. a bank transfer. This confirms the order and takes the stock."
                button="Confirm payment received" onSubmit={(note) => run(`/api/admin/orders/${o.orderId}/mark-paid`, { note }, "Payment recorded; the order is confirmed.")} />
            )}
            {o.actions.cancel && <ActionToggle label="Cancel order" danger open={panel === "cancel"} onOpen={() => setPanel(panel === "cancel" ? null : "cancel")} />}
            {panel === "cancel" && (
              <CancelForm busy={busy} paidOnline={o.paymentMethod === "ONLINE" && o.paymentStatus === "Success"}
                onSubmit={(reason, note) => run(`/api/admin/orders/${o.orderId}/cancel`, { reason, note }, "Order cancelled.")} />
            )}
            {o.actions.refund && <ActionToggle label={`Refund (up to ${inr(o.actions.refundable)})`} open={panel === "refund"} onOpen={() => setPanel(panel === "refund" ? null : "refund")} />}
            {panel === "refund" && (
              <RefundForm busy={busy} max={o.actions.refundable}
                onSubmit={(amount, note) => run(`/api/admin/orders/${o.orderId}/refund`, { amount, note }, "Refund sent to Cashfree. It usually reaches the customer in 5–7 working days.")} />
            )}
            {!o.actions.emailInvoice && !o.actions.markPaid && !o.actions.cancel && !o.actions.refund && (
              <p className="text-muted">No actions for this order right now.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function NextStep({ steps, itemCount, couriers, hasTracking, busy, onApply }: {
  steps: (Next & { n: number })[];
  itemCount: number;
  couriers: { id: number; name: string }[];
  hasTracking: boolean;
  busy: boolean;
  onApply: (body: Record<string, unknown>) => Promise<boolean>;
}) {
  const [status, setStatus] = useState<number>(steps[0].id);
  const [courierId, setCourierId] = useState<string>("");
  const [tracking, setTracking] = useState("");
  const [comment, setComment] = useState("");
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => setStatus(steps[0].id), [steps]);
  const shipping = status === SHIPMENT_ASSIGNED && !hasTracking;
  const chosen = steps.find((s) => s.id === status);
  const input = "rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-forest-600";

  return (
    <form
      className="flex flex-col gap-3 rounded-xl border-2 border-forest-800/15 bg-white p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr(null);
        if (shipping && (!courierId || !tracking.trim())) return setErr("Choose the courier and enter the tracking number.");
        const ok = await onApply({ status, courierId: courierId ? Number(courierId) : undefined, trackingId: tracking || undefined, comment: comment || undefined });
        if (ok) {
          setComment("");
          setTracking("");
        }
      }}
    >
      <h2 className="font-semibold">Next step</h2>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Next status">
        {steps.map((s) => (
          <label key={s.id} className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${status === s.id ? "border-forest-800 bg-forest-800 text-white" : "border-line hover:bg-[#f6f7f5]"}`}>
            <input type="radio" name="next-status" className="sr-only" checked={status === s.id} onChange={() => setStatus(s.id)} />
            {human(s.text)}
            {s.n < itemCount && <span className="ml-1 opacity-75">({s.n} of {itemCount})</span>}
          </label>
        ))}
      </div>
      {shipping && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Courier</span>
            <select id="ship-courier" value={courierId} onChange={(e) => setCourierId(e.target.value)} className={input}>
              <option value="">Choose…</option>
              {couriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Tracking number</span>
            <input id="ship-tracking" value={tracking} onChange={(e) => setTracking(e.target.value)} maxLength={60} className={input} />
          </label>
        </div>
      )}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Note <span className="font-normal text-muted">(optional, kept with the order)</span></span>
        <input id="step-note" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={300} className={input} />
      </label>
      {err && <p className="text-sm text-kumkum-700">{err}</p>}
      <button className="self-start rounded-lg bg-forest-800 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-700 disabled:opacity-50" disabled={busy}>
        {busy ? "Saving…" : `Mark ${chosen?.n === itemCount ? "order" : `${chosen?.n} item${chosen?.n === 1 ? "" : "s"}`} as “${human(chosen?.text)}”`}
      </button>
    </form>
  );
}

function ItemRow({ item, busy, onMove }: { item: Item; busy: boolean; onMove: (status: number) => void }) {
  const [to, setTo] = useState<string>("");
  return (
    <tr className="border-t border-line align-top">
      <td className="px-4 py-3">
        <span className="font-medium">{item.productName}</span>
        <span className="block text-xs text-muted tabular-nums">{inr(item.unitPrice)} each{item.expectedDeliveryDate ? ` · due ${when(item.expectedDeliveryDate)}` : ""}</span>
        {item.comment && <span className="mt-1 block text-xs text-muted">“{item.comment}”</span>}
      </td>
      <td className="px-4 py-3 text-right tabular-nums">{item.quantity}</td>
      <td className="px-4 py-3 text-right tabular-nums">{inr(item.lineTotal)}</td>
      <td className="px-4 py-3">{human(item.stage)}</td>
      <td className="px-4 py-3">
        {item.next.length === 0 ? (
          <span className="text-xs text-muted">No further steps</span>
        ) : (
          <div className="flex gap-2">
            <select aria-label={`Move ${item.productName} to`} value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm">
              <option value="">Choose…</option>
              {item.next.filter((n) => n.id !== SHIPMENT_ASSIGNED).map((n) => <option key={n.id} value={n.id}>{human(n.text)}</option>)}
            </select>
            <button type="button" disabled={!to || busy} onClick={() => onMove(Number(to))} className="rounded-lg border border-line px-3 py-1.5 text-sm disabled:opacity-40">Apply</button>
          </div>
        )}
      </td>
    </tr>
  );
}

function ActionToggle({ label, open, onOpen, danger }: { label: string; open: boolean; onOpen: () => void; danger?: boolean }) {
  return (
    <button type="button" aria-expanded={open} onClick={onOpen}
      className={`rounded-lg border px-3 py-2 text-left ${danger ? "border-kumkum-100 text-kumkum-700 hover:bg-kumkum-100/50" : "border-line hover:bg-[#f6f7f5]"}`}>
      {label}
    </button>
  );
}

function NoteForm({ hint, button, busy, onSubmit }: { hint: string; button: string; busy: boolean; onSubmit: (note: string) => void }) {
  const [note, setNote] = useState("");
  return (
    <form className="flex flex-col gap-2 rounded-lg bg-[#f6f7f5] p-3" onSubmit={(e) => { e.preventDefault(); onSubmit(note); }}>
      <p className="text-xs text-muted">{hint}</p>
      <input id="paid-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reference or note" maxLength={200} className="rounded-lg border border-line bg-white px-3 py-2" />
      <button className="self-start rounded-lg bg-forest-800 px-3 py-2 font-semibold text-white disabled:opacity-50" disabled={busy}>{button}</button>
    </form>
  );
}

function CancelForm({ paidOnline, busy, onSubmit }: { paidOnline: boolean; busy: boolean; onSubmit: (reason: number, note: string) => void }) {
  const [reason, setReason] = useState(5);
  const [note, setNote] = useState("");
  return (
    <form className="flex flex-col gap-2 rounded-lg bg-kumkum-100/40 p-3" onSubmit={(e) => { e.preventDefault(); onSubmit(reason, note); }}>
      <p className="text-xs">
        Cancelling puts any reserved stock back{paidOnline ? " and marks the payment for refund (then use Refund)" : ""}. The customer is told by email.
      </p>
      <select id="cancel-reason" value={reason} onChange={(e) => setReason(Number(e.target.value))} className="rounded-lg border border-line bg-white px-3 py-2" aria-label="Reason">
        {REASONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
      </select>
      <input id="cancel-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note for the record (optional)" maxLength={300} className="rounded-lg border border-line bg-white px-3 py-2" />
      <button className="self-start rounded-lg bg-kumkum-600 px-3 py-2 font-semibold text-white disabled:opacity-50" disabled={busy}>Cancel this order</button>
    </form>
  );
}

function RefundForm({ max, busy, onSubmit }: { max: number; busy: boolean; onSubmit: (amount: number, note: string) => void }) {
  const [amount, setAmount] = useState(String(max));
  const [note, setNote] = useState("");
  const value = Number(amount);
  const valid = value > 0 && value <= max;
  return (
    <form className="flex flex-col gap-2 rounded-lg bg-[#f6f7f5] p-3" onSubmit={(e) => { e.preventDefault(); if (valid) onSubmit(value, note); }}>
      <p className="text-xs text-muted">Sent through Cashfree to the account the customer paid from.</p>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium">Amount (₹, at most {max.toFixed(2)})</span>
        <input id="refund-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-lg border border-line bg-white px-3 py-2 tabular-nums" />
      </label>
      <input id="refund-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" maxLength={200} className="rounded-lg border border-line bg-white px-3 py-2" />
      <button className="self-start rounded-lg bg-forest-800 px-3 py-2 font-semibold text-white disabled:opacity-50" disabled={busy || !valid}>Send refund</button>
    </form>
  );
}
