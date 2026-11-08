// components/monetization/UpgradeModal.tsx
"use client";

import { useState } from "react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export default function UpgradeModal({ isOpen, onClose, message }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgradeClick = async () => {
    setIsLoading(true);
    try {
      // Part 8 wali Checkout API call
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "user_id_here", planPriceId: "price_premium_123" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe/Razorpay
      }
    } catch (error) {
      console.error("Payment initiation failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🚀
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Limit Reached!</h3>
          <p className="text-gray-600 mb-6">{message || "Aapki free limit khatam ho chuki hai."}</p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">Premium Plan Benefits:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">✅ <span>Deep Research with Perplexity Agent</span></li>
              <li className="flex gap-2">✅ <span>Claude Sonnet 5.5 High-Retention Scripts</span></li>
              <li className="flex gap-2">✅ <span>Scene-by-scene Grok Visual Prompts</span></li>
              <li className="flex gap-2">✅ <span>Pay as you go (Credits System)</span></li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
            >
              Maybe Later
            </button>
            <button 
              onClick={handleUpgradeClick}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400"
            >
              {isLoading ? "Redirecting..." : "Upgrade Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
