import "server-only";

function read(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  get databaseUrl() { return read("DATABASE_URL"); },
  get authSecret() { return read("AUTH_SECRET"); },
  get googleClientId() { return read("GOOGLE_CLIENT_ID"); },
  get googleClientSecret() { return read("GOOGLE_CLIENT_SECRET"); },
  get anthropicKey() { return read("ANTHROPIC_API_KEY"); },
  get perplexityKey() { return read("PERPLEXITY_API_KEY"); },
  get xaiKey() { return read("XAI_API_KEY"); },
  get geminiKey() { return read("GEMINI_API_KEY"); },
  get razorpayKeyId() { return read("RAZORPAY_KEY_ID"); },
  get razorpayKeySecret() { return read("RAZORPAY_KEY_SECRET"); },
  get razorpayWebhookSecret() { return read("RAZORPAY_WEBHOOK_SECRET"); },
};
