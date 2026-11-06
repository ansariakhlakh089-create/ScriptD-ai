"use client";

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#111] border border-white/10 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-blue-400 mb-2">Current Plan</h2>
          <p className="text-slate-400">You are on the Free Plan.</p>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg">Upgrade to Pro</button>
        </div>
        <div className="bg-[#111] border border-white/10 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-purple-400 mb-2">Token Usage</h2>
          <p className="text-slate-400">3,000 / 3,000 Tokens remaining.</p>
        </div>
      </div>
    </div>
  );
}
