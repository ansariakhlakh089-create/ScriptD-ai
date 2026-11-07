"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'chat' | 'image'>('chat');
  const [input, setInput] = useState('');
  
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
        body: JSON.stringify({ userQuery: input, plan: 'FREE', tone: 'Documentary' }),
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
    <div className="flex flex-col h-screen bg-[#352c2e] text-white font-sans">
      
      {/* 1. Top Navbar */}
      <div className="flex justify-between items-center p-4 border-b border-white/5">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/dashboard')}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span className="font-medium text-sm">Back to Home</span>
        </div>
        
        {/* Token / Scripts Left Badge */}
        <div className="bg-[#FF6A3D]/20 text-[#FF6A3D] px-3 py-1 rounded-full text-xs font-semibold border border-[#FF6A3D]/30">
          2 scripts left
        </div>
      </div>

      {/* 2. Sub-Navbar (Menu, Toggle, Plus, Dots) */}
      <div className="flex items-center justify-between p-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
        </svg>

        {/* Chat/Image Toggle */}
        <div className="flex bg-[#423739] rounded-full p-1 border border-white/5">
          <button 
            onClick={() => setMode('chat')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${mode === 'chat' ? 'bg-[#FF6A3D] text-white shadow-md' : 'text-gray-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            Chat
          </button>
          <button 
            onClick={() => setMode('image')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${mode === 'image' ? 'bg-[#FF6A3D] text-white shadow-md' : 'text-gray-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            Image
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center text-gray-300">
            +
          </button>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
          </svg>
        </div>
      </div>

      {/* 3. Main Chat / Output Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        
        {/* Empty State */}
        {!research && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center mt-20">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-[#FF6A3D]">
                <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Kis topic par video banani hai?</h2>
            <p className="text-sm text-gray-400 px-8">
              Neeche likho, aur script + visual ideas paao.
            </p>
          </div>
        )}

        {/* Streaming Cards */}
        {research && (
          <div className="bg-[#423739] border border-green-500/30 p-4 rounded-2xl mb-4 shadow-lg">
            <h3 className="text-green-400 text-sm font-semibold mb-1">✅ Research Done</h3>
            <p className="text-gray-300 text-sm">{research}</p>
          </div>
        )}

        {script && (
          <div className="bg-[#423739] border border-[#FF6A3D]/30 p-4 rounded-2xl mb-4 shadow-lg">
            <h3 className="text-[#FF6A3D] text-sm font-semibold mb-1">📝 Script Generated</h3>
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{script}</p>
          </div>
        )}

        {visuals && (
          <div className="bg-[#423739] border border-blue-500/30 p-4 rounded-2xl mb-4 shadow-lg">
            <h3 className="text-blue-400 text-sm font-semibold mb-1">🎬 Visual Prompts</h3>
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{visuals}</p>
          </div>
        )}
      </div>

      {/* 4. Bottom Input Box */}
      <div className="p-4 bg-[#352c2e]">
        <div className="relative bg-[#423739] rounded-3xl p-3 flex items-end gap-2 border border-white/5">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          
          <textarea 
            placeholder="What's on your mind?"
            className="w-full bg-transparent text-white outline-none resize-none placeholder-gray-500 max-h-32 min-h-[44px] py-2"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />

          {input.trim() ? (
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="p-2 bg-[#FF6A3D] text-white rounded-full transition-colors disabled:opacity-50 mb-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          ) : (
            <button className="p-2 text-gray-400 hover:text-white transition-colors mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}
        </div>
      </div>

    </div>
  );
        }
