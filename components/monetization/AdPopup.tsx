// components/monetization/AdPopup.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AdPopupProps {
  plan: "FREE" | "PAID";
}

export default function AdPopup({ plan }: AdPopupProps) {
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    // Sirf free users ko 10 second baad ek ad popup dikhayega
    if (plan === "FREE") {
      const timer = setTimeout(() => {
        setShowAd(true);
      }, 10000); // 10 seconds delay
      return () => clearTimeout(timer);
    }
  }, [plan]);

  if (!showAd) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-bounce-short">
      <div className="bg-gray-100 p-2 flex justify-between items-center border-b border-gray-200">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Advertisement</span>
        <button onClick={() => setShowAd(false)} className="text-gray-400 hover:text-black font-bold">✕</button>
      </div>
      <div className="p-4 text-center">
        <h4 className="font-bold text-lg mb-1">Tired of limits?</h4>
        <p className="text-sm text-gray-600 mb-4">Upgrade to Pro to remove ads, unlock Claude 5.5, and get 5,000 credits!</p>
        <Link href="/dashboard" className="block w-full bg-purple-600 text-white font-medium py-2 rounded-lg hover:bg-purple-700 transition">
          Upgrade Now
        </Link>
      </div>
    </div>
  );
}
