"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Yahan aap apna signup logic (API call) daal sakte hain
    console.log("Signup attempt:", { name, email, password });
    // Abhi ke liye seedha chat page par bhej rahe hain
    router.push('/chat');
  };

  return (
    <div className="w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
      <h2 className="text-3xl font-bold text-center text-white mb-8">Create Account</h2>
      
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="you@example.com"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="••••••••"
            required
          />
        </div>

        <button 
          type="submit" 
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all"
        >
          Sign Up
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}
