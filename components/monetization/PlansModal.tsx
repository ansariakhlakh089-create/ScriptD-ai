// FILE: components/monetization/PlansModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Check, LoaderCircle, X } from "lucide-react";
import { PACK_KEYS, PLAN_KEYS, PRODUCTS, formatINR, type ProductKey } from "@/lib/constants";
import { api, errorMessage } from "@/lib/api-client";

interface Props {
  open: boolean;
  onClose: () => void;
  onPurchased: () => void;
  message?: string; // e.g. "Long scripts need a plan"
}

interface OrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  label: string;
  appName: string;
  prefill: { name: string; email: string };
}

interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

type RazorpayCtor = new (options: Record<string, unknown>) => {
  open: () => void;
  on: (event: string, callback: () => void) => void;
};

function loadRazorpay(): Promise<RazorpayCtor> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as { Razorpay?: RazorpayCtor };
    if (w.Razorpay) return resolve(w.Razorpay);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => (w.Razorpay ? resolve(w.Razorpay) : reject(new Error("Payment window is not available.")));
    script.onerror = () => reject(new Error("Could not load the payment window. Please check your internet."));
    document.body.appendChild(script);
  });
}

export default function PlansModal({ open, onClose, onPurchased, message }: Props) {
  const [busyKey, setBusyKey] = useState<ProductKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSuccess(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function buy(key: ProductKey) {
    setError(null);
    setBusyKey(key);
    try {
      const order = await api<OrderResponse>("/api/checkout", { method: "POST", json: { productKey: key } });
      const Razorpay = await loadRazorpay();

      const checkout = new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: order.appName,
        description: order.label,
        order_id: order.orderId,
        prefill: order.prefill,
        theme: { color: "#F43F5E" }, // Updated to Rose/Red button color
        handler: async (resp: RazorpaySuccess) => {
          try {
            await api("/api/checkout", {
              method: "PUT",
              json: {
                orderId: resp.razorpay_order_id,
                paymentId: resp.razorpay_payment_id,
                signature: resp.razorpay_signature,
              },
            });
            setSuccess(true);
            onPurchased();
          } catch (e) {
            setError(errorMessage(e, "Payment received, but we could not confirm it yet. It will update shortly."));
          } finally {
            setBusyKey(null);
          }
        },
        modal: { ondismiss: () => setBusyKey(null) },
      });

      checkout.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setBusyKey(null);
      });
      checkout.open();
    } catch (e) {
      setError(errorMessage(e));
      setBusyKey(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Plans">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-black/60" />

      <div className="relative z-10 max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/20 bg-plum-deep p-5 pb-8 shadow-glass animate-fade-up sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Plans &amp; top-up</h2>
            <p className="mt-1 text-sm text-cream-dim">{message ?? "Pay once, no auto-renewal."}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-cream hover:bg-white/20"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {success && (
          <p role="status" className="mt-4 rounded-2xl bg-emerald-900/50 px-4 py-3 text-sm text-emerald-100">
            Payment successful. Your plan is active.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 rounded-2xl bg-red-950/50 px-4 py-3 text-sm text-red-100">
            {error}
          </p>
        )}

        <div className="mt-5 space-y-3">
          {PLAN_KEYS.map((key) => {
            const p = PRODUCTS[key];
            return (
              <div
                key={key}
                className={`rounded-2xl border p-4 ${p.highlight ? "border-ember bg-ember/10" : "border-white/20 bg-white/5"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-base font-semibold text-white">
                      {p.label}
                      {p.badge && (
                        <span className="rounded-full bg-ember px-2.5 py-0.5 text-xs font-semibold text-white">
                          {p.badge}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-cream-dim">{p.days} days</p>
                  </div>
                  <p className="text-xl font-bold text-ember-soft">{formatINR(p.pricePaise)}</p>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-base text-cream">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-ember-soft" aria-hidden /> {perk}
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-base text-cream">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-ember-soft" aria-hidden />
                    {p.tokens.toLocaleString("en-IN")} tokens
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={() => void buy(key)}
                  disabled={busyKey !== null}
                  className="btn-ember mt-4 w-full"
                >
                  {busyKey === key ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : `Buy ${p.label}`}
                </button>
              </div>
            );
          })}
        </div>

        <h3 className="mt-6 text-base font-semibold text-cream-dim">Script packs</h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {PACK_KEYS.map((key) => {
            const p = PRODUCTS[key];
            return (
              <div key={key} className="flex flex-col justify-between rounded-2xl border border-white/20 bg-white/5 p-4">
                <div>
                  <p className="text-base font-semibold text-white">{p.label}</p>
                  <p className="mt-1 text-lg font-bold text-ember-soft">{formatINR(p.pricePaise)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void buy(key)}
                  disabled={busyKey !== null}
                  className="btn-glass mt-3 w-full px-3 py-2"
                >
                  {busyKey === key ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : "Buy"}
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-5 text-center text-sm text-cream-dim">Secure payment by Razorpay (UPI, cards, netbanking).</p>
      </div>
    </div>
  );
        }
