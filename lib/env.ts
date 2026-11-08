// lib/env.ts
export const env = {
  DATABASE_URL: process.env.DATABASE_URL as string,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY as string,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

// App start hote hi check karo
Object.entries(env).forEach(([key, value]) => {
  if (!value) {
    console.warn(`⚠️ Warning: Environment variable ${key} is missing.`);
  }
});
