// FILE: components/monetization/AdGateModal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import { api, errorMessage } from "@/lib/api-client";

interface Props {
  open: boolean;
  projectId: string | null;
  adsNeeded: number; // 2 ya 4
  unlocksLeft: number;
  onClose: () => void;
  onUnlocked: () => void; // unlock ho gaya: ab ruka hua message bhej do
}

const AD_SECONDS = 5;

// TODO (asli ads): neeche "Sponsored" wale dabbe mein asli rewarded-ad SDK lagana hai.
// Abhi ye sirf 5 second ka countdown hai (placeholder), taaki poora flow test ho sake.
export default function AdGateModal({ open, projectId, adsNeeded, unlocksLeft, onClose, onUnlocked }: Props) {
  const [watched, setWatched] = useState(0); // kitne ads poore hue
  const [seconds, setSeconds] = useState<number | null>(null); // None = ad chal nahi raha
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savedOnce = useRef(false);

  // Har baar modal khule to naye sire se
  useEffect(() => {
    if (!open) return;
    setWatched(0);
    setSeconds(null);
    setSaving(false);
    setError(null);
    savedOnce.current = false;
  }, [open]);

  // Countdown
  useEffect(() => {
    if (seconds === null) return;
    if (seconds <= 0) {
      setWatched((w) => w + 1);
      setSeconds(null);
      return;
    }
    const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  // Saare ads poore -> server ko batao
  useEffect(() => {
    if (!open || !projectId || watched < adsNeeded || savedOnce.current) return;
    savedOnce.current = true;
    setSaving(true);
    api("/api/ads/unlock", { method: "POST", json: { projectId, adsWatched: adsNeeded } })
      .then(() => onUnlocked())
      .catch((e) => {
        setError(errorMessage(e));
        setSaving(false);
        savedOnce.current = false;
        setWatched(0);
      });
  }, [open, projectId, watched, adsNeeded, onUnlocked]);

  if (!open) return null;

  const playing = seconds !== null;
  const nextNumber = Math.min(watched + 1, adsNeeded);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Unlock one more message">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-black/60" />

      <div className="relative z-10 w-full max-w-md rounded-t-3xl border border-white/20 bg-plum-deep p-5 pb-8 shadow-glass animate-fade-up sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Unlock one more message</h2>
            <p className="mt-1 text-sm leading-relaxed text-cream-dim">
              Your free messages for this chat are finished. Watch {adsNeeded} short ads to send one more.
              {unlocksLeft > 0 ? ` You can unlock ${unlocksLeft} more time${unlocksLeft === 1 ? "" : "s"} today.` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Ad ka dabba */}
        <div className="mt-5 flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-white/30 bg-black/20 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-cream-dim">Sponsored</p>
          {playing ? (
            <p className="mt-2 text-3xl font-bold text-ember-soft" aria-live="polite">
              {seconds}s
            </p>
          ) : (
            <p className="mt-2 px-6 text-sm text-cream-dim">
              {watched >= adsNeeded ? "All ads watched" : `Ad ${nextNumber} of ${adsNeeded}`}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2" aria-hidden>
          {Array.from({ length: adsNeeded }).map((_, i) => (
            <span key={i} className={`h-2 w-10 rounded-full ${i < watched ? "bg-ember" : "bg-white/25"}`} />
          ))}
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-2xl bg-red-950/50 px-4 py-3 text-sm text-red-100">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={playing || saving || watched >= adsNeeded}
          onClick={() => {
            setError(null);
            setSeconds(AD_SECONDS);
          }}
          className="btn-ember mt-5 w-full"
        >
          {saving ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> Unlocking...
            </>
          ) : playing ? (
            "Ad playing..."
          ) : (
            `Watch ad ${nextNumber} of ${adsNeeded}`
          )}
        </button>
      </div>
    </div>
  );
}
