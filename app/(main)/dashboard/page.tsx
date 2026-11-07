"use client";
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-[#352c2e] text-white font-sans">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center p-5 border-b border-white/5 bg-[#352c2e]/90 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-2xl font-bold tracking-wide">ScriptD AI</h1>
        <div className="w-10 h-10 rounded-full bg-[#FF6A3D] flex items-center justify-center font-bold text-lg cursor-pointer shadow-lg">
          C
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-5">
        
        {/* Navigation Tabs (Compact & Clean) */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {/* Active Tab */}
          <button className="flex-1 min-w-[100px] flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[#FF6A3D]/10 border border-[#FF6A3D] text-[#FF6A3D] shadow-[0_0_15px_rgba(255,106,61,0.2)]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-2.11m-5.29 8.624a2.25 2.25 0 001.798-1.674m-1.798 1.674c-.048.015-.096.03-.145.044a8.114 8.114 0 01-2.32.494l-3 3v-3.091c-1.134.093-2.111.535-2.86 1.196l-1.317-.626A2.25 2.25 0 002.25 12c0-1.104.896-2 2-2h16a2 2 0 012 2c0 1.104-.896 2-2 2z" />
            </svg>
            <span className="text-xs font-semibold">Your Chats</span>
          </button>

          {/* Inactive Tabs */}
          <button className="flex-1 min-w-[100px] flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[#423739] border border-white/5 text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            <span className="text-xs font-semibold">Creation</span>
          </button>

          <button className="flex-1 min-w-[100px] flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[#423739] border border-white/5 text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
            <span className="text-xs font-semibold">Projects</span>
          </button>
        </div>

        {/* Empty State Message */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="w-20 h-20 mb-4 rounded-full bg-[#423739] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-white mb-2">Abhi koi chat nahi hai.</h2>
          <p className="text-sm text-[#b3a3a5]">Neeche "Go Create" dabakar naya script shuru karein.</p>
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="p-4 bg-[#352c2e] border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-[#423739] rounded-full flex items-center px-4 py-3 border border-white/5">
            <input 
              type="text" 
              placeholder="Naya script shuru karein..." 
              className="w-full bg-transparent text-sm text-white outline-none placeholder-gray-500"
            />
          </div>
          <button 
            onClick={() => router.push('/chat')} // Ye aapko chat screen par le jayega
            className="w-16 h-16 rounded-full bg-[#FF6A3D] hover:bg-[#ff5a2a] flex flex-col items-center justify-center text-xs font-bold leading-tight shadow-[0_0_20px_rgba(255,106,61,0.4)] transition-all active:scale-95"
          >
            <span>Go</span>
            <span>Create</span>
          </button>
        </div>
      </div>

    </div>
  );
}
