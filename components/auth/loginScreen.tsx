// FILE: components/auth/LoginScreen.tsx
"use client";

import { useEffect, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { authClient, signIn } from "@/lib/auth-client";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

const TYPED_LINE = "Solve your Content Creation Problems";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Typewriter: akshar ek-ek karke likhta hai
function useTypewriter(text: string, speedMs = 55) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setCount(text.length);
  }, [text]);

  useEffect(() => {
    if (count >= text.length) return;
    const timer = setTimeout(() => setCount(count + 1), speedMs);
    return () => clearTimeout(timer);
  }, [count, text, speedMs]);

  return { shown: text.slice(0, count), done: count >= text.length };
}

export default function LoginScreen({ next }: { next: string }) {
  const [step, setStep] = useState<"start" | "otp">("start");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState<"google" | "email" | "otp" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const typed = useTypewriter(TYPED_LINE);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const cleanEmail = email.trim().toLowerCase();

  async function handleGoogle() {
    setError(null);
    setBusy("google");
    const { error: err } = await signIn.social({ provider: "google", callbackURL: next });
    if (err) {
      setError(err.message ?? "Google login is not available right now.");
      setBusy(null);
    }
  }

  async function sendCode() {
    if (!EMAIL_RE.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setBusy("email");
    const { error: err } = await authClient.emailOtp.sendVerificationOtp({ email: cleanEmail, type: "sign-in" });
    setBusy(null);
    if (err) {
      setError(err.message ?? "Could not send the code. Please try again.");
      return;
    }
    setOtp("");
    setStep("otp");
    setCooldown(30);
  }

  async function verifyCode(code: string) {
    setError(null);
    setBusy("otp");
    const { error: err } = await signIn.emailOtp({ email: cleanEmail, otp: code });
    if (err) {
      setError(err.message ?? "That code is not correct.");
      setBusy(null);
      return;
    }
    window.location.href = next; // poora reload, taaki session cookie pakki ho jaye
  }

  function handleOtpChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setOtp(digits);
    if (digits.length === 6) void verifyCode(digits);
  }

  return (
    <main className="auth-bg min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-between px-6 pb-10 pt-12">
        {/* Upar: naam + tagline */}
        <header className="animate-fade-up text-center">
          <h1 className="text-3xl font-bold uppercase tracking-[0.18em] text-white">{APP_NAME}</h1>
          <p className="mt-3 text-base tracking-wide text-cream-dim">{APP_TAGLINE}</p>
        </header>

        {/* Beech mein: shishe wala card */}
        <section
          className="glass-card animate-fade-up flex w-full flex-col items-center px-6 py-10 text-center"
          style={{ animationDelay: "120ms" }}
          aria-label="About ScriptD AI"
        >
          <p className="text-xl tracking-wide text-cream-dim">This is the</p>
          <p className="gradient-text mt-3 text-4xl font-extrabold tracking-[0.12em]">SCRIPTD.AI</p>
          <p className="mt-8 min-h-[3.5rem] text-lg font-semibold leading-snug text-white" aria-live="polite">
            {typed.shown}
            {!typed.done && <span className="ml-0.5 inline-block h-5 w-2 translate-y-0.5 animate-blink bg-white/90" />}
          </p>
        </section>

        {/* Neeche: login ke tareeke */}
        <section className="w-full animate-fade-up" style={{ animationDelay: "240ms" }}>
          {step === "start" ? (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={busy !== null}
                className="btn-glass w-full gap-3 py-4 text-base"
              >
                {busy === "google" ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-plum-deep">
                    G
                  </span>
                )}
                Continue with Google
              </button>

              <div className="my-5 flex items-center gap-4 text-sm text-cream-dim">
                <span className="h-px flex-1 bg-white/30" />
                or
                <span className="h-px flex-1 bg-white/30" />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendCode();
                }}
                className="relative"
              >
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field pr-16 text-center"
                />
                <button
                  type="submit"
                  disabled={busy !== null || !EMAIL_RE.test(cleanEmail)}
                  aria-label="Send login code"
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ember text-white transition hover:bg-ember-hover disabled:opacity-40"
                >
                  {busy === "email" ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden />
                  ) : (
                    <ArrowRight className="h-5 w-5" aria-hidden />
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <p className="text-sm text-cream-dim">
                We sent a 6-digit code to <span className="font-semibold text-white">{cleanEmail}</span>
              </p>
              <label htmlFor="otp" className="sr-only">
                6-digit code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                placeholder="------"
                value={otp}
                onChange={(e) => handleOtpChange(e.target.value)}
                disabled={busy === "otp"}
                className="field mt-4 text-center text-2xl font-semibold tracking-[0.5em]"
              />
              <div className="mt-4 flex items-center justify-center gap-5 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("start");
                    setError(null);
                  }}
                  className="text-cream-dim underline-offset-4 hover:underline"
                >
                  Change email
                </button>
                <button
                  type="button"
                  onClick={() => void sendCode()}
                  disabled={cooldown > 0 || busy !== null}
                  className="text-ember-soft underline-offset-4 hover:underline disabled:text-cream-dim/60 disabled:no-underline"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
              </div>
              {busy === "otp" && (
                <p className="mt-3 flex items-center justify-center gap-2 text-sm text-cream-dim">
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> Checking...
                </p>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="mt-4 rounded-2xl bg-red-950/40 px-4 py-2.5 text-center text-sm text-red-100">
              {error}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
