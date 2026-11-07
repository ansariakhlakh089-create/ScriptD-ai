import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export const auth = betterAuth({
  secret: env.authSecret,
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  socialProviders: {
    google: {
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (process.env.NODE_ENV !== "production") {
          console.log(`[OTP] ${type} for ${email}: ${otp}`);
          return;
        }
        throw new Error("Email service is not configured yet");
      },
    }),
    nextCookies(),
  ],
});
