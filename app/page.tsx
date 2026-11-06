"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [topic, setTopic] = useState('');
  const router = useRouter();

  const handleStart = () => {
    if (!topic.trim()) return alert("Please enter a topic!");
    // Aage chal kar hum topic ko database/state me save karenge
    router.push('/chat');
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/30 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/30 blur-[120px] rounded-full"></div>

      <div className="relative z-10 w-full max-w-2xl px-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
            AI Content Creator
          </h1>
          <p className="text-slate-400 text-lg">
            Turn your ideas into viral scripts and visuals in seconds.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2">
          <input 
            type="text" 
            placeholder="What do you want to create? (e.g., History of the Lightbulb)"
            className="flex-1 bg-transparent text-white p-4 outline-none placeholder-slate-500"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          />
          <button 
            onClick={handleStart}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-4 px-8 rounded-xl transition-all shadow-lg whitespace-nowrap"
          >
            Generate
          </button>
        </div>
        
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Try: "Horror story in a abandoned hospital" or "Comedy skit on Indian parents"</p>
        </div>
      </div>
    </main>
  );
}
