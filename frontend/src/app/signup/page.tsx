'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden p-6 font-sans">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md p-10 bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 relative z-10">
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            MP
          </div>
        </div>
        <h2 className="text-3xl font-extrabold mb-2 text-center text-white tracking-tight">Create Account</h2>
        <p className="text-center text-slate-400 mb-8 text-sm">Join the ecosystem of top-tier talent.</p>
        
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center font-medium">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email Address</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-500 transition-all font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-500 transition-all font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">I am joining as a:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white transition-all appearance-none font-medium"
            >
              <option value="student" className="bg-slate-900 text-white">Student - Looking to learn</option>
              <option value="mentor" className="bg-slate-900 text-white">Mentor - Looking to guide</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? 'Processing...' : 'Complete Sign Up'}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account? <Link href="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
