// components/chat/StreamOutput.tsx
"use client";

import { useState, useEffect } from "react";

interface StreamOutputProps {
  content: string;
  speed?: number; // Typing speed in milliseconds
}

export default function StreamOutput({ content, speed = 15 }: StreamOutputProps) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedText(""); // Reset hone par shuru se
    
    const timer = setInterval(() => {
      if (i < content.length) {
        setDisplayedText((prev) => prev + content.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [content, speed]);

  return (
    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-serif">
      {displayedText}
      {displayedText.length < content.length && (
        <span className="inline-block w-2 h-4 bg-black ml-1 animate-pulse" /> // Blinking cursor
      )}
    </div>
  );
}
