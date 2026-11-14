// FILE: lib/script-format.ts
// Highlight marks: the AI wraps its strongest lines in ==double equals signs==.
// The app shows them in colour, and removes them whenever the text is copied,
// downloaded, or sent back to the AI.
export function stripMarks(text: string): string {
  return text.replace(/==/g, "");
}
