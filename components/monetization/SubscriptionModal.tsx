// components/monetization/SubscriptionModal.tsx
"use client";

import { useState } from "react";

export default function SubscriptionModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "user_id_here", planPriceId: planId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error(error);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">✖</button>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Upgrade to Pro</h2>
          <p className="text-gray-500">Unleash Claude 5.5, Perplexity Agent & Grok Visuals.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Creator Plan */}
          <div className="border border-gray-200 rounded-xl p-6 hover:border-black transition-colors relative">
            <h3 className="text-xl font-bold">Creator Pack</h3>
            <p className="text-3xl font-extrabold my-4">$9<span className="text-sm font-normal text-gray-500">/mo</span></p>
            <ul className="text-sm space-y-3 mb-6 text-gray-600">
              <li>✅ 1,000 Premium Credits</li>
              <li>✅ Claude Sonnet 5.5 Scripts</li>
              <li>✅ Standard Server Speed</li>
            </ul>
            <button 
              onClick={() => handleCheckout("price_creator_9")}
              disabled={loadingPlan !== null}
              className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400"
            >
              {loadingPlan === "price_creator_9" ? "Wait..." : "Choose Creator"}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-purple-600 rounded-xl p-6 relative bg-purple-50">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">MOST POPULAR</span>
            <h3 className="text-xl font-bold">Pro Pack</h3>
            <p className="text-3xl font-extrabold my-4">$29<span className="text-sm font-normal text-gray-500">/mo</span></p>
            <ul className="text-sm space-y-3 mb-6 text-gray-600">
              <li>✅ 5,000 Premium Credits</li>
              <li>✅ Grok Visual Prompts (Full)</li>
              <li>✅ Priority Fast Generation</li>
            </ul>
            <button 
              onClick={() => handleCheckout("price_pro_29")}
              disabled={loadingPlan !== null}
              className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-medium hover:bg-purple-700 disabled:bg-purple-400"
            >
              {loadingPlan === "price_pro_29" ? "Wait..." : "Choose Pro"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
