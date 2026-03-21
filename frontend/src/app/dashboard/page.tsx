'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut, Calendar, MessageSquare, UserCircle, Plus, Video, Play, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [studentEmail, setStudentEmail] = useState('');
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState('');

  const router = useRouter();

  const fetchActiveSessions = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;

    try {
      const res = await fetch('http://localhost:5000/api/sessions/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        setProfile(profileData);
        await fetchActiveSessions();
      } else {
        router.push('/login');
      }
      setLoading(false);
    };

    fetchUser();
    
    // Auto-refresh active sessions every 5 seconds on the dashboard
    const interval = setInterval(() => {
      fetchActiveSessions();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [router, fetchActiveSessions]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSessionLoading(true);
    setSessionError('');
    
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    
    try {
      const res = await fetch('http://localhost:5000/api/sessions/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ student_email: studentEmail })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create session');
      }
      
      setStudentEmail('');
      await fetchActiveSessions();
    } catch(err: any) {
      setSessionError(err.message);
    } finally {
      setSessionLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = 'sb-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      <nav className="bg-slate-900/50 backdrop-blur-lg border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center">
            <span className="font-bold text-white text-sm">MP</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Mentorship Platform</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-red-500/20 border border-transparent hover:border-red-500/50 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </nav>

      <main className="max-w-5xl mx-auto mt-10 p-6 md:p-10 mb-20 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
            <UserCircle className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Welcome back</h2>
            <p className="text-slate-400">{user?.email}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
          <h3 className="text-lg font-semibold text-white mb-2 relative z-10">Account Status</h3>
          <p className="text-sm font-medium text-slate-300 relative z-10">
            Registered Role: 
            <span className="uppercase tracking-wider font-bold text-emerald-400 ml-3 py-1.5 px-3 bg-emerald-500/10 rounded-full text-xs border border-emerald-500/20">
              {profile?.role || 'Pending'}
            </span>
          </p>
        </div>

        {/* Sessions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 group border border-white/10 p-8 rounded-2xl bg-slate-900/50 hover:bg-slate-800/80 hover:border-white/20 transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-teal-500/20 w-12 h-12 rounded-xl flex items-center justify-center text-teal-500 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white transition-all">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-white">Active Sessions</h3>
                <p className="text-slate-400 text-sm">Your upcoming and ongoing mentoring calls.</p>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {sessions.length === 0 ? (
                <div className="bg-slate-900/50 rounded-xl p-6 text-center border border-white/5">
                  <p className="text-slate-400">No active or pending sessions.</p>
                </div>
              ) : (
                sessions.map(session => (
                  <div key={session.id} className="bg-slate-800/50 rounded-xl p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${session.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {session.status}
                        </span>
                        <span className="text-slate-400 text-xs">
                          {new Date(session.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-white font-medium text-sm">
                        {profile?.role === 'mentor' ? `Student: ${session.student?.email}` : `Mentor: ${session.mentor?.email}`}
                      </p>
                    </div>
                    
                    <Link 
                      href={`/session/${session.id}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold rounded-lg hover:from-emerald-400 hover:to-teal-500 transition-all"
                    >
                      Enter Room
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6 h-full">
            {profile?.role === 'mentor' && (
              <div className="border border-white/10 p-6 rounded-2xl bg-gradient-to-b from-slate-900/50 to-slate-900/30">
                <h3 className="font-bold text-white mb-1">Create New Session</h3>
                <p className="text-slate-400 text-xs mb-4">Invite a student to a 1-on-1.</p>
                
                {sessionError && (
                  <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs text-center">
                    {sessionError}
                  </div>
                )}

                <form onSubmit={handleCreateSession} className="space-y-3">
                  <input
                    type="email"
                    placeholder="Student Email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-500 transition-all"
                    required
                  />
                  <button
                    type="submit"
                    disabled={sessionLoading}
                    className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl border border-white/10 transition-all disabled:opacity-50"
                  >
                    {sessionLoading ? 'Creating...' : 'Generate Session URL'}
                  </button>
                </form>
              </div>
            )}

            <div className="group border border-white/10 p-6 rounded-2xl bg-slate-900/50 hover:bg-slate-800/80 transition-all flex-1">
              <div className="bg-emerald-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white mb-1">Messages</h3>
              <p className="text-slate-400 text-xs">Review code snippets and share resources.</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
