"use client";

export default function HistoryPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Your History</h1>
      <div className="space-y-4">
        <div className="bg-[#111] border border-white/10 p-4 rounded-xl cursor-pointer hover:bg-white/5">
          <h2 className="text-lg font-semibold text-white">History of the Lightbulb</h2>
          <p className="text-sm text-slate-400">Generated on 24 Oct 2026</p>
        </div>
        <div className="bg-[#111] border border-white/10 p-4 rounded-xl cursor-pointer hover:bg-white/5">
          <h2 className="text-lg font-semibold text-white">Horror Story in Abandoned Hospital</h2>
          <p className="text-sm text-slate-400">Generated on 23 Oct 2026</p>
        </div>
      </div>
    </div>
  );
}
