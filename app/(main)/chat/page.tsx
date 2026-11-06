"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('solve'); 
  const [tone, setTone] = useState('Documentary');
  const router = useRouter();

  // Streaming States
  const [loading, setLoading] = useState(false);
  const [research, setResearch] = useState('');
  const [script, setScript] = useState('');
  const [visuals, setVisuals] = useState('');

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResearch(''); setScript(''); setVisuals('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuery: input, plan: 'FREE', tone }), // Abhi ke liye FREE plan fix hai
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('DATA: ')) {
            const data = JSON.parse(line.replace('DATA: ', ''));
            if (data.step === 'research' && data.status === 'done') setResearch(data.content);
            if (data.step === 'script' && data.status === 'done') setScript(data.content);
            if (data.step === 'visuals' && data.status === 'done') setVisuals(data.content);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Kuch gadbad ho gayi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-slate-200 overflow-hidden font-sans">
      
      {/* Sidebar (Same as before) */}
      <div className="hidden md:flex flex-col w-64 border-r border-white/10 bg-[#111111] p-4">
        <button onClick={() => router.push('/')} className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-lg transition-all mb-6 text-sm font-medium">
          <span>+</span> New Chat
        </button>
        <div className="flex-1 overflow-y-auto space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent History</p>
          <div className="p-3 bg-white/5 rounded-lg text-sm truncate cursor-pointer hover:bg-white/10">History of Bulb</div>
        </div>
        <div className="mt-4 bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-white/10 p-4 rounded-xl">
          <p className="text-xs text-slate-400 mb-1">Tokens Remaining</p>
          <div className="text-2xl font-bold text-white">3,000</div>
          <button className="w-full mt-3 text-xs bg-white text-black font-semibold py-2 rounded-lg">Upgrade</button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Navbar */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
            <button onClick={() => setActiveTab('discussion')} className={`px-4 py-1.5 text-sm rounded-md ${activeTab === 'discussion' ? 'bg-white/10 text-white' : 'text-slate-400'}`}>Discussion</button>
            <button onClick={() => setActiveTab('solve')} className={`px-4 py-1.5 text-sm rounded-md ${activeTab === 'solve' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Solve</button>
          </div>
        </div>

        {/* Chat Output Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Empty State */}
            {!research && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="text-5xl mb-4">✨</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Ready to create magic?</h2>
                    <p className="text-slate-400">Type your topic below to start.</p>
                </div>
            )}

            {/* Streaming Cards */}
            {research && (
              <div className="bg-[#111] border border-green-500/30 p-4 rounded-xl shadow-lg">
                <h3 className="text-green-400 font-semibold mb-2 flex items-center gap-2">✅ Research Done</h3>
                <p className="text-slate-300 text-sm">{research}</p>
              </div>
            )}

            {script && (
              <div className="bg-[#111] border border-blue-500/30 p-4 rounded-xl shadow-lg">
                <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">📝 Script Generated</h3>
                <p className="text-slate-300 text-sm whitespace-pre-wrap">{script}</p>
              </div>
            )}

            {visuals && (
              <div className="bg-[#111] border border-purple-500/30 p-4 rounded-xl shadow-lg">
                <h3 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">🎬 Visual Prompts</h3>
                <p className="text-slate-300 text-sm whitespace-pre-wrap">{visuals}</p>
              </div>
            )}
        </div>

        {/* Input Box */}
        <div className="p-4 bg-[#0a0a0a] border-t border-white/10">
          <div className="max-w-3xl mx-auto">
            {/* Tone Selector */}
            <div className="flex gap-2 mb-2">
               <select value={tone} onChange={(e) => setTone(e.target.value)} className="bg-white/5 border border-white/10 text-sm text-slate-300 p-2 rounded-lg outline-none">
                 <option value="Documentary">Documentary</option>
                 <option value="Comedy">Comedy</option>
                 <option value="Horror">Horror</option>
               </select>
            </div>

            <div className="relative bg-white/5 border border-white/10 rounded-2xl p-2 flex items-end gap-2 focus-within:border-blue-500/50 transition-all">
              <textarea 
                placeholder="What do you want to create?"
                className="w-full bg-transparent text-white p-3 outline-none resize-none placeholder-slate-500 max-h-32 min-h-[50px]"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button 
                onClick={handleGenerate}
                disabled={loading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl mb-1 transition-colors disabled:opacity-50"
              >
                {loading ? "Wait..." : "Send"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
        }
