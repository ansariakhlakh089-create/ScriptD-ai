// FILE: components/shared/ColorText.tsx
"use client";

import type { ReactNode } from "react";

// Colour roles used across the app:
//   gold        -> numbers, dates, key terms, headings
//   ember-soft  -> structure (hook tag, bullets, labels)
//   blush       -> highlighted / emotional lines
//   mist        -> quotes, hashtags, links, camera terms
//   cream       -> normal text

const TOKEN_RE = /(==[^=\n]+==|\*\*[^*\n]+\*\*|`[^`\n]+`)/g;
const QUOTE_RE = /(\u201C[^\u201D\n]{2,}\u201D|"[^"\n]{2,}"|\u2018[^\u2019\n]{2,}\u2019)/g;
const FACT_RE = /(\b(?:disputed|unverified)\b|\d(?:[\d,.]*\d)?%?|[\u0966-\u096F](?:[\u0966-\u096F,.]*[\u0966-\u096F])?%?)/gi;

function colorPlain(text: string, keyBase: string): ReactNode[] {
  const clean = text.replace(/==/g, "");
  // Yahan <ReactNode> add kiya gaya hai
  return clean.split(QUOTE_RE).flatMap<ReactNode>((part, i) => {
    if (i % 2 === 1) {
      return [
        <span key={`${keyBase}-q${i}`} className="text-mist-soft">
          {part}
        </span>,
      ];
    }
    // Yahan bhi <ReactNode> add kiya gaya hai
    return part.split(FACT_RE).map<ReactNode>((seg, j) => {
      if (j % 2 === 1) {
        const isWord = /^[a-z]/i.test(seg);
        return isWord ? (
          <span key={`${keyBase}-${i}-${j}`} className="rounded bg-gold/15 px-1 text-gold">
            {seg}
          </span>
        ) : (
          <span key={`${keyBase}-${i}-${j}`} className="font-medium text-gold">
            {seg}
          </span>
        );
      }
      return seg;
    });
  });
}

// Inline colouring for any text: ==highlight==, **bold**, `code`, "quotes", numbers
export function renderRich(text: string): ReactNode[] {
  // Line 47 fix: Yahan <ReactNode> add kiya gaya hai
  return text.split(TOKEN_RE).flatMap<ReactNode>((part, i) => {
    if (i % 2 === 1) {
      if (part.startsWith("==")) {
        return [
          <mark key={`m${i}`} className="box-decoration-clone rounded-md bg-blush/15 px-1 py-0.5 text-blush-soft">
            {part.slice(2, -2)}
          </mark>,
        ];
      }
      if (part.startsWith("**")) {
        return [
          <strong key={`b${i}`} className="font-semibold text-gold">
            {part.slice(2, -2)}
          </strong>,
        ];
      }
      return [
        <code key={`c${i}`} className="rounded bg-white/10 px-1 py-0.5 font-mono text-[0.9em] text-ember-soft">
          {part.slice(1, -1)}
        </code>,
      ];
    }
    return colorPlain(part, `p${i}`);
  });
}

// The script: Hook and Closing are tagged, strongest lines are highlighted
export function ScriptText({ text }: { text: string }) {
  let paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (paras.length < 3) paras = text.split(/\n/).map((p) => p.trim()).filter(Boolean);
  const last = paras.length - 1;

  return (
    <div className="space-y-5">
      {paras.map((p, i) => {
        const role = paras.length >= 2 && i === 0 ? "hook" : paras.length >= 3 && i === last ? "closing" : "body";
        return (
          <div
            key={i}
            className={
              role === "hook"
                ? "border-l-4 border-l-ember/70 pl-3"
                : role === "closing"
                  ? "border-l-4 border-l-gold/70 pl-3"
                  : ""
            }
          >
            {role !== "body" && (
              <span
                className={`mb-1.5 inline-block rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${
                  role === "hook" ? "bg-ember/20 text-ember-soft" : "bg-gold/15 text-gold"
                }`}
              >
                {role === "hook" ? "Hook" : "Closing"}
              </span>
            )}
            <p className="whitespace-pre-wrap text-base leading-[1.8] text-cream">{renderRich(p)}</p>
          </div>
        );
      })}
    </div>
  );
}

// Research notes: headings in gold, bullets in teal, warnings and numbers stand out
export function NotesText({ text }: { text: string }) {
  const rows: ReactNode[] = [];
  text.split(/\r?\n/).forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) return;

    const heading = line.match(/^#{1,4}\s+(.*)$/);
    if (heading) {
      rows.push(
        <h4 key={idx} className="pt-3 text-base font-semibold text-gold first:pt-0">
          {renderRich(heading[1])}
        </h4>
      );
      return;
    }

    const numbered = line.match(/^(\d+)[.)]\s+(.*)$/);
    const bullet = line.match(/^[-*\u2022]\s+(.*)$/);
    if (numbered || bullet) {
      const itemText = numbered ? numbered[2] : bullet ? bullet[1] : "";
      rows.push(
        <div key={idx} className="flex gap-2 text-sm leading-relaxed text-cream">
          {numbered ? (
            <span className="w-5 shrink-0 font-semibold text-ember-soft">{numbered[1]}.</span>
          ) : (
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-soft" aria-hidden />
          )}
          <span className="min-w-0">{renderRich(itemText)}</span>
        </div>
      );
      return;
    }

    rows.push(
      <p key={idx} className="text-sm leading-relaxed text-cream-dim">
        {renderRich(line)}
      </p>
    );
  });

  return <div className="space-y-2">{rows}</div>;
}

// Image prompts: camera terms (blue), light (sand), mood (rose)
const PROMPT_RE =
  /\b(close-up|close up|wide shot|wide-angle|aerial|drone shot|low angle|high angle|macro|bokeh|depth of field|35mm|50mm|85mm|cinematic|photorealistic|4k|8k|camera|lens|golden hour|sunset|sunrise|backlit|rim light|soft light|dramatic lighting|moody lighting|natural light|lighting|neon|candlelight|moonlight|volumetric|shadows?|somber|melancholic|tense|hopeful|joyful|eerie|mysterious|epic|nostalgic|dramatic|serene|calm|intense|emotional|haunting)\b/gi;
const LIGHT_WORD =
  /^(golden hour|sunset|sunrise|backlit|rim light|soft light|dramatic lighting|moody lighting|natural light|lighting|neon|candlelight|moonlight|volumetric|shadows?)$/i;
const MOOD_WORD = /^(somber|melancholic|tense|hopeful|joyful|eerie|mysterious|epic|nostalgic|dramatic|serene|calm|intense|emotional|haunting)$/i;

export function PromptText({ text }: { text: string }) {
  return (
    <>
      {text.split(PROMPT_RE).map((part, i) => {
        if (i % 2 === 0) return part;
        const cls = LIGHT_WORD.test(part)
          ? "text-gold"
          : MOOD_WORD.test(part)
            ? "text-blush-soft"
            : "text-mist-soft";
        return (
          <span key={i} className={`font-medium ${cls}`}>
            {part}
          </span>
        );
      })}
    </>
  );
}

export function PromptLegend() {
  return (
    <p className="text-sm text-cream-dim">
      <span className="font-medium text-mist-soft">Camera</span>
      {" · "}
      <span className="font-medium text-gold">Light</span>
      {" · "}
      <span className="font-medium text-blush-soft">Mood</span>
    </p>
  );
}

// Video description: hashtags and links in blue
const DESC_RE = /(#[\w\u0900-\u097F]+|https?:\/\/\S+)/g;

export function DescriptionText({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-wrap text-base leading-relaxed text-cream">
      {text.split(DESC_RE).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="text-mist-soft">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </p>
  );
}
