"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkspacePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'chat' | 'script' | 'v-prompt'>('chat');
  const [input, setInput] = useState('');
  
  // Dropdowns
  const [topic, setTopic] = useState('History');
  const [type, setType] = useState('Documentary');
  const [tone, setTone] = useState('Serious');

  // States (Status tracking)
  const [isWorking, setIsWorking] = useState(false); // Upar ka spinner
  const [credits, setCredits] = useState(5); // User ke credits
  
  // Content States
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const [script, setScript] = useState('');
  const [vPrompt, setVPrompt] = useState('');
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [isVPromptLoading, setIsVPromptLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    
    // Reset states
    setChatHistory([{ role: 'user', text: input }]);
    setScript('');
    setVPrompt('');
    setActiveTab('chat'); // Wapas chat tab par le aao
    setIsWorking(true);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuery: input, topic, type, tone }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('DATA: ')) {
              const data = JSON.parse(line.replace('DATA: ', ''));

              // 1. Research aaya
              if (data.step === 'research' && data.status === 'done') {
                setChatHistory(prev => [...prev, { role: 'ai', text: data.content }]);
              }
              // 2. Chat mein auto-message aaya (e.g., "Script ban rahi hai")
              if (data.step === 'chat_msg') {
                setChatHistory(prev => [...prev, { role: 'system', text: data.content }]);
              }
              // 3. Script loading/done
              if (data.step === 'script') {
                if (data.status === 'loading') setIsScriptLoading(true);
                if (data.status === 'done') {
                  setScript(data.content);
                  setIsScriptLoading(false);
                }
              }
              // 4. V-Prompt loading/done
              if (data.step === 'vprompt') {
                if (data.status === 'loading') setIsVPromptLoading(true);
                if (data.status === 'done') {
                  setVPrompt(data.content);
                  setIsVPromptLoading(false);
                }
              }
              // 5. Global working status
              if (data.step === 'status') {
                if (data.status === 'working') setIsWorking(true);
                if (data.status === 'done') setIsWorking(false);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setIsWorking(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#352c2e] text-white font-sans">
      
      {/* 1. TOP NAVBAR */}
      <div className="flex justify-between items-center p-4 border-b border-white/5">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-sm font-medium hover:text-[#FF6A3D] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back home
        </button>
        
        {/* Credits & Working Icon */}
        <div className="flex items-center gap-2">
          {isWorking && (
            <span className="text-xs text-[#FF6A3D] animate-pulse flex items-center gap-1">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Working
            </span>
          )}
          <div className="bg-[#423739] border border-[#FF6A3D]/30 px-3 py-1 rounded-full text-xs font-semibold text-[#FF6A3D]">
            Credits - {credits}
          </div>
        </div>
      </div>

      {/* 2. TABS */}
      <div className="flex items-center justify-between p-4 pb-0 overflow-x-auto scrollbar-hide border-b border-white/5">
        <div className="flex gap-2">
          {['chat', 'script', 'v-prompt'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all capitalize ${activeTab === tab ? 'bg-[#FF6A3D]/10 border-[#FF6A3D] text-[#FF6A3D]' : 'bg-transparent border-white/10 text-gray-400'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 mt-2">
        
        {/* --- CHAT TAB --- */}
        {activeTab === 'chat' && (
          <div className="space-y-4">
            {chatHistory.length === 0 && (
               <div className="text-center mt-20 text-gray-400 text-sm">Start by typing your idea below.</div>
            )}
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' ? 'bg-[#FF6A3D] text-white rounded-br-none' : 
                  msg.role === 'system' ? 'bg-transparent text-[#FF6A3D] font-medium text-center w-full my-2' :
                  'bg-[#423739] text-gray-200 rounded-bl-none border border-white/5'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Jab script ready ho, Chat me clickable link aaye */}
            {script && (
              <div className="flex justify-center mt-4">
                <button onClick={() => setActiveTab('script')} className="bg-[#FF6A3D]/20 text-[#FF6A3D] border border-[#FF6A3D]/50 px-4 py-2 rounded-full text-sm flex items-center gap-2 hover:bg-[#FF6A3D]/30 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  Open Script
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* --- SCRIPT TAB --- */}
        {activeTab === 'script' && (
          <div className="h-full">
            {isScriptLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-[#FF6A3D] animate-pulse">
                <p>Searching & Writing Script...</p>
              </div>
            ) : script ? (
              <div className="bg-[#423739] p-5 rounded-2xl border border-white/5 shadow-lg">
                <div className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed font-serif">
                  {script}
                </div>
              </div>
            ) : (
              <div className="text-center mt-20 text-gray-400 text-sm">No script generated yet.</div>
            )}
          </div>
        )}

        {/* --- V-PROMPT TAB --- */}
        {activeTab === 'v-prompt' && (
          <div className="h-full">
            {isVPromptLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-blue-400 animate-pulse">
                <p>Analyzing script for visual sense...</p>
              </div>
            ) : vPrompt ? (
              <div className="bg-[#423739] p-4 rounded-2xl border border-white/5 shadow-lg space-y-4">
                {vPrompt.split('\n\n').map((scene, idx) => {
                  // Check if the scene requires a document/link
                  const needsDoc = scene.includes('[DOCUMENT_NEEDED]');
                  const isImage = scene.includes('[IMAGE_PROMPT]');
                  
                  return (
                    <div key={idx} className="bg-[#2a2224] p-4 rounded-xl border border-white/5">
                      <p className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">
                        {scene.replace('[IMAGE_PROMPT]', '').replace('[DOCUMENT_NEEDED]', '')}
                      </p>
                      
                      {/* Checkbox Logic (Jo aapne manga tha) */}
                      {needsDoc && (
                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                          <input type="checkbox" className="w-4 h-4 accent-[#FF6A3D]" />
                          <span className="text-xs text-[#FF6A3D]">Include document screenshot/link in this scene</span>
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center mt-20 text-gray-400 text-sm">Visual prompts will appear here once the script is ready.</div>
            )}
          </div>
        )}

      </div>

      {/* 4. BOTTOM INPUT BOX */}
      <div className="p-4 bg-[#352c2e] border-t border-white/5">
        <div className="bg-[#423739] rounded-3xl p-3 border border-white/5 flex flex-col gap-3">
          <textarea 
            placeholder="Type your idea for creation..."
            className="w-full bg-transparent text-white outline-none resize-none placeholder-gray-500 min-h-[50px] px-2 text-sm"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <div className="flex gap-2 text-xs">
              <select value={topic} onChange={(e) => setTopic(e.target.value)} className="bg-[#352c2e] text-gray-300 px-2 py-1 rounded-md border border-white/10 outline-none">
                <option>History</option><option>Science</option>
              </select>
              <select value={type} onChange={(e) => setType(e.target.value)} className="bg-[#352c2e] text-gray-300 px-2 py-1 rounded-md border border-white/10 outline-none">
                <option>Documentary</option><option>Shorts</option>
              </select>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="bg-[#352c2e] text-gray-300 px-2 py-1 rounded-md border border-white/10 outline-none">
                <option>Serious</option><option>Funny</option>
              </select>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isWorking || !input.trim()}
              className="w-10 h-10 rounded-full bg-[#FF6A3D] hover:bg-[#ff5a2a] flex items-center justify-center text-white transition-colors disabled:opacity-50"
            >
              {isWorking ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
                              }
