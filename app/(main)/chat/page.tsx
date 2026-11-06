"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('solve'); // 'discussion' ya 'solve'
  const router = useRouter();

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-slate-200 overflow-hidden font-sans">
      
      {/* Left Sidebar (History & Tokens) - Mobile par hidden rahega, desktop par dikhega */}
      <div className="hidden md:flex flex-col w-64 border-r border-white/10 bg-[#111111] p-4">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-lg transition-all mb-6 text-sm font-medium"
        >
          <span>+</span> New Chat
        </button>

        <div className="flex-1 overflow-y-auto space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent History</p>
          {/* Dummy History - Baad me Database se aayega */}
          <div className="p-3 bg-white/5 rounded-lg text-sm truncate cursor-pointer hover:bg-white/10">History of Bulb</div>
          <div className="p-3 rounded-lg text-sm truncate cursor-pointer hover:bg-white/5 text-slate-400">Horror Story Ideas</div>
        </div>

        {/* Token Counter (Glassmorphism) */}
        <div className="mt-4 bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-white/10 p-4 rounded-xl">
          <p className="text-xs text-slate-400 mb-1">Tokens Remaining</p>
          <div className="text-2xl font-bold text-white">3,000</div>
          <div className="w-full bg-black/50 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-blue-500 h-full w-[100%]"></div>
          </div>
          <button className="w-full mt-3 text-xs bg-white text-black font-semibold py-2 rounded-lg">Upgrade Plan</button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Top Navbar (Tabs) */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => setActiveTab('discussion')}
              className={`px-4 py-1.5 text-sm rounded-md transition-all ${activeTab === 'discussion' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Discussion
            </button>
            <button 
              onClick={() => setActiveTab('solve')}
              className={`px-4 py-1.5 text-sm rounded-md transition-all ${activeTab === 'solve' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Solve (AI)
            </button>
          </div>
          <div className="text-sm font-semibold md:hidden text-blue-400">Tokens: 3,000</div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
            {/* Empty State */}
            <div className="text-center">
                <div className="text-5xl mb-4">✨</div>
                <h2 className="text-2xl font-bold text-white mb-2">Ready to create magic?</h2>
                <p className="text-slate-400 max-w-md mx-auto">
                    Type your topic below. Make sure to use <strong className="text-blue-400">Solve</strong> mode for deep research and script generation.
                </p>
            </div>
        </div>

        {/* Input Box Area (Fixed at bottom) */}
        <div className="p-4 bg-[#0a0a0a] border-t border-white/10">
          <div className="max-w-3xl mx-auto relative bg-white/5 border border-white/10 rounded-2xl p-2 flex items-end gap-2 focus-within:border-blue-500/50 transition-all">
            <textarea 
              placeholder="Ask anything or paste your topic..."
              className="w-full bg-transparent text-white p-3 outline-none resize-none placeholder-slate-500 max-h-32 min-h-[50px]"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl mb-1 transition-colors disabled:opacity-50"
              disabled={!input.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
          <p className="text-center text-xs text-slate-500 mt-2">
            AI can make mistakes. Consider verifying important information.
          </p>
        </div>

      </div>
    </div>
  );
}
