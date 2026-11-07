"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleLogin = () => {
    // Yahan aap future mein authentication logic daalenge
    router.push('/chat'); 
  };

  return (
    // Background color jo aapne screenshot me dikhaya (Muted Mauve/Brown)
    <main className="relative flex flex-col items-center justify-between min-h-screen bg-[#352c2e] text-white p-6 overflow-hidden font-sans">
      
      {/* Top Section: Logo & Tagline */}
      <div className="mt-16 text-center">
        <h1 className="text-3xl font-extrabold tracking-widest mb-2 text-white">SCRIPTD AI</h1>
        <p className="text-[#b3a3a5] text-sm">Your Content Creation Journey</p>
      </div>

      {/* Middle Section: The Glowing Card */}
      <div className="w-full max-w-sm mt-10 relative">
        {/* Glow effect back side */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF6A3D]/20 to-transparent blur-xl rounded-3xl"></div>
        
        {/* Main Card */}
        <div className="relative bg-[#423739] border border-[#FF6A3D]/30 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-sm">
          <p className="text-[#b3a3a5] text-sm mb-2">This is the</p>
          <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-200 to-[#FF6A3D] mb-4">
            SCRIPTD.AI
          </h2>
          <p className="text-white font-medium text-lg leading-tight">
            Solve your Content Creation<br/>Problems
          </p>
        </div>
      </div>

      {/* Bottom Section: Auth Buttons */}
      <div className="w-full max-w-sm mb-10 space-y-4">
        <button 
          onClick={() => setShowGoogleModal(true)}
          className="w-full flex items-center justify-center gap-3 bg-[#423739] hover:bg-[#4d4042] border border-white/10 text-white py-3.5 rounded-full transition-all"
        >
          <div className="bg-white p-1 rounded-full flex items-center justify-center w-6 h-6">
            {/* Google Icon SVG */}
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </div>
          <span className="font-semibold text-sm">Continue with Google</span>
        </button>

        <div className="flex items-center gap-4 px-4">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-[#b3a3a5] text-xs">or</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center bg-transparent border border-white/20 hover:bg-white/5 text-white py-3.5 rounded-full transition-all"
        >
          <span className="font-semibold text-sm">Enter your email</span>
        </button>
      </div>

      {/* Google Login Modal (Screenshot 3) */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#423739] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-white/10">
            <h3 className="text-xl font-bold mb-6 text-white">Continue with Google</h3>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs text-[#b3a3a5] mb-1 block">Aapka Naam</label>
                <input type="text" value="Creator" readOnly className="w-full bg-transparent border-b border-white/20 text-white pb-2 outline-none" />
              </div>
              <div>
                <label className="text-xs text-[#b3a3a5] mb-1 block">Google Email ID</label>
                <input type="email" value="creator@gmail.com" readOnly className="w-full bg-transparent border-b border-white/20 text-white pb-2 outline-none" />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowGoogleModal(false)} className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#b3a3a5] hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={handleLogin} className="px-6 py-2.5 rounded-full text-sm font-bold bg-[#FF6A3D] hover:bg-[#ff5a2a] text-white transition-colors">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
