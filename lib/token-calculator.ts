export function calculateTokens(text: string): number {
  // Simple logic: 1 word = roughly 1.3 tokens
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words * 1.3);
}
