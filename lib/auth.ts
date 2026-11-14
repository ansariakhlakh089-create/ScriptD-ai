// FILE: lib/auth.ts
// Server side of login: Google + Email/Password + Email OTP (Better Auth)
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { db } from "@/lib/db";
import { APP_NAME } from "@/lib/constants";

// ---- Trusted origins: local + all Vercel URLs ----
function buildTrustedOrigins(): string[] {
  const origins = new Set<string>(["http://localhost:3000"]);
  const add = (value?: string) => {
    if (!value) return;
    const cleaned = value.trim().replace(/\/+$/, "");
    if (!cleaned) return;
    origins.add(cleaned.startsWith("http") ? cleaned : `https://${cleaned}`);
  };
  add(process.env.NEXT_PUBLIC_APP_URL);
  add(process.env.BETTER_AUTH_URL);
  add(process.env.VERCEL_URL);
  add(process.env.VERCEL_BRANCH_URL);
  add(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  add("https://scriptd-ai.vercel.app");
  return Array.from(origins);
}

// ---- Small helper that sends email (Resend API) ----
async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Local testing: the OTP is printed in the terminal. Never print it in production (logs can leak).
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n[DEV EMAIL] To: ${to}\nSubject: ${subject}\n${html.replace(/<[^>]+>/g, " ")}\n`);
      return;
    }
    throw new Error("RESEND_API_KEY is missing - cannot send email");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? `${APP_NAME} <onboarding@resend.dev>`,
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    throw new Error(`Email send failed (${res.status})`);
  }
}

const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  appName: APP_NAME,
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: buildTrustedOrigins(),

  database: prismaAdapter(db, { provider: "postgresql" }),

  // 1) Email + password
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },

  // 2) Google
  socialProviders: googleEnabled
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : {},

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh daily
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  plugins: [
    // 3) Email OTP (6 digit code, 5 minute valid)
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      async sendVerificationOTP({ email, otp, type }) {
        const subject =
          type === "sign-in"
            ? `${otp} is your ${APP_NAME} login code`
            : `${otp} is your ${APP_NAME} verification code`;
        const html = `
          <div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;color:#13222A">
            <h2 style="margin:0 0 8px">${APP_NAME}</h2>
            <p style="margin:0 0 16px">Your one-time code:</p>
            <p style="font-size:32px;font-weight:700;letter-spacing:6px;margin:0 0 16px">${otp}</p>
            <p style="color:#5C7078;margin:0">This code works for 5 minutes. If you did not ask for it, ignore this email.</p>
          </div>`;
        await sendEmail(email, subject, html);
      },
    }),
    nextCookies(), // always keep this last
  ],
});
