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
  const [isOpen, setIsOpen] = useState(false);
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

      <div className="w-full max-w-md p-6 sm:p-10 bg-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-white/10 relative z-10">
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            MP
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-1.5 sm:mb-2 text-center text-white tracking-tight">Create Account</h2>
        <p className="text-center text-slate-400 mb-6 sm:mb-8 text-xs sm:text-sm">Join the ecosystem of top-tier talent.</p>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1 sm:mb-1.5">Email Address</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 sm:py-2.5 bg-slate-950/50 border border-white/10 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-500 transition-all font-medium text-xs sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1 sm:mb-1.5">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 sm:py-2.5 bg-slate-950/50 border border-white/10 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-500 transition-all font-medium text-xs sm:text-sm"
              required
            />
          </div>
          <div className="relative">
            <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1 sm:mb-1.5">I am joining as a:</label>
            <div className="relative group">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between pl-4 pr-3 py-2 sm:py-2.5 bg-slate-950/50 border border-white/10 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white font-medium text-xs sm:text-sm cursor-pointer"
              >
                <span>{role === 'student' ? 'Student - Learn' : 'Mentor - Guide'}</span>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="absolute top-full left-0 w-full mt-1.5 bg-slate-900 border border-white/20 rounded-lg sm:rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={() => { setRole('student'); setIsOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 sm:py-3 text-xs sm:text-sm transition-colors ${role === 'student' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:bg-white/5'}`}
                  >
                    Student - Learn
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRole('mentor'); setIsOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 sm:py-3 text-xs sm:text-sm transition-colors ${role === 'mentor' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:bg-white/5'}`}
                  >
                    Mentor - Guide
                  </button>
                </div>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-3.5 px-4 mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg sm:rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:shadow-none text-sm sm:text-base"
          >
            {loading ? 'Processing...' : 'Complete Sign Up'}
          </button>
        </form>
        <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-slate-400">
          Already have an account? <Link href="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors whitespace-nowrap">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
