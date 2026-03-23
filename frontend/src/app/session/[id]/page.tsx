'use client';

import { useEffect, useState, use, useRef, useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Video, Mic, MicOff, VideoOff, PhoneOff, Code, MessageCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import throttle from 'lodash.throttle';
import dynamic from 'next/dynamic';
import ChatPanel, { ChatMessage } from '@/components/ChatPanel';

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center w-full h-full bg-[#1e1e1e] text-slate-500 rounded-2xl border border-white/10 flex-col gap-3">
      <Code className="w-8 h-8 text-emerald-500 animate-[pulse_2s_ease-in-out_infinite]" />
      <span className="font-semibold tracking-wide">Loading Shared Editor...</span>
    </div>
  )
});

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export default function SessionRoom({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  // Layout toggles
  const [showEditor, setShowEditor] = useState(true);
  const [showChat, setShowChat] = useState(true);

  // Socket & Code Editor
  const [socket, setSocket] = useState<Socket | null>(null);
  const [code, setCode] = useState('// Write your code here...\n\n');
  const [language, setLanguage] = useState('javascript');
  const isReceivingCodeRef = useRef(false);

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // WebRTC
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [remoteStreamHasVideo, setRemoteStreamHasVideo] = useState(false);

  // Initialize Room Data
  useEffect(() => {
    const initRoom = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);

      const { data: sessionData, error } = await supabase
        .from('sessions')
        .select('*, mentor:profiles!mentor_id(email), student:profiles!student_id(email)')
        .eq('id', sessionId)
        .single();

      if (error || !sessionData) {
        setError('Session not found or you do not have access.');
      } else {
        setSession(sessionData);
      }
      setLoading(false);
    };
    initRoom();
  }, [sessionId, router]);

  // Load existing Chat Messages
  useEffect(() => {
    if (!sessionId || !profile) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data.map((m: any) => ({ ...m, isMine: m.sender_id === profile.id })));
      }
    };
    fetchMessages();
  }, [sessionId, profile]);

  // Poll for session updates if it's currently pending
  useEffect(() => {
    if (session?.status !== 'pending') return;
    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*, mentor:profiles!mentor_id(email), student:profiles!student_id(email)')
        .eq('id', sessionId)
        .single();
      if (!error && data && data.status === 'active') {
        setSession(data);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [session?.status, sessionId]);

  // Main Socket & WebRTC setup
  useEffect(() => {
    if (session?.status !== 'active' || !profile) return;

    let pc: RTCPeerConnection;
    let currentSocket: Socket;

    const setupRTC = async () => {
      // 1. Get Local Media (Mic/Camera)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // Apply initial hardware state
        stream.getAudioTracks().forEach(t => t.enabled = micOn);
        stream.getVideoTracks().forEach(t => t.enabled = videoOn);
      } catch (err) {
        console.warn('Media devices locked or unavailable:', err);
      }

      // 2. Initialize Socket.io
      currentSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');
      setSocket(currentSocket);

      // 3. Setup RTCPeerConnection
      pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      // Add local stream tracks to connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current!));
      }

      // Receive remote tracks
      pc.ontrack = (event) => {
        if (remoteVideoRef.current && remoteVideoRef.current.srcObject !== event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setRemoteStreamHasVideo(event.track.kind === 'video');
        }
      };

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          currentSocket.emit('webrtc-ice-candidate', { sessionId, candidate: event.candidate });
        }
      };

      // 4. Socket Listeners
      currentSocket.on('connect', () => {
        currentSocket.emit('join-session', sessionId);
        // Alert room to trigger negotiation
        setTimeout(() => currentSocket.emit('user-joined', sessionId), 1000);
      });

      // === SIGNALING ===
      currentSocket.on('user-joined', async () => {
        // Only Mentor generates the offer to avoid collision
        if (profile.role === 'mentor') {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          currentSocket.emit('webrtc-offer', { sessionId, offer });
        }
      });

      currentSocket.on('webrtc-offer', async (offer) => {
        if (profile.role === 'student' && pc.signalingState !== 'closed') {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          currentSocket.emit('webrtc-answer', { sessionId, answer });
        }
      });

      currentSocket.on('webrtc-answer', async (answer) => {
        if (pc.signalingState !== 'closed') {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      currentSocket.on('webrtc-ice-candidate', async (candidate) => {
        try {
          if (pc.remoteDescription && pc.signalingState !== 'closed') {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        } catch (e) { console.error('Error adding ICE candidate', e); }
      });

      // === DATA SYNC: Code & Chat ===
      currentSocket.on('code-change', (data: { code: string, language: string }) => {
        isReceivingCodeRef.current = true;
        setCode(data.code);
        setLanguage(data.language);
        setTimeout(() => isReceivingCodeRef.current = false, 50);
      });

      currentSocket.on('receive-message', (msg: any) => {
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev; // Avoid dupes
          return [...prev, msg].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        });
      });

      currentSocket.on('peer-disconnected', async () => {
        // Show fallback UI when the peer leaves or drops connection
        setRemoteStreamHasVideo(false);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }

        // Verify if they left because they ended the session
        const { data } = await supabase
          .from('sessions')
          .select('*, mentor:profiles!mentor_id(email), student:profiles!student_id(email)')
          .eq('id', sessionId)
          .single();

        if (data && data.status === 'completed') {
          setSession(data);
        }
      });
    };

    setupRTC();

    return () => {
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
      if (pc) pc.close();
      if (currentSocket) currentSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.status, sessionId, profile]); // Ignore micOn/videoOn to avoid endless re-renders of RTC!

  // Toggle A/V hardware state precisely without destroying connection
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => t.enabled = micOn);
      localStreamRef.current.getVideoTracks().forEach(t => t.enabled = videoOn);
    }
  }, [micOn, videoOn]);

  // Code Editor Throttled Emitter
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const emitCodeChange = useCallback(
    throttle((newCode: string, newLang: string) => {
      if (socket) {
        socket.emit('code-change', { sessionId, code: newCode, language: newLang });
      }
    }, 500),
    [socket, sessionId]
  );

  const handleCodeChange = (value: string | undefined) => {
    if (value === undefined) return;
    setCode(value);
    if (!isReceivingCodeRef.current) {
      emitCodeChange(value, language);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (!isReceivingCodeRef.current) {
      emitCodeChange(code, lang);
    }
  };

  // Chat message submission
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !profile) return;

    const { data, error } = await supabase.from('messages').insert([{
      session_id: sessionId,
      sender_id: profile.id,
      sender_email: profile.email,
      text: text.trim(),
    }]).select().single();

    if (!error && data) {
      const dbMessage = { ...data, isMine: true };
      setMessages(p => [...p, dbMessage]);
      socket?.emit('send-message', { sessionId, message: { ...data, isMine: false } });
    }
  };

  // Session Actions
  const handleJoinSession = async () => {
    setActionLoading(true); setError('');
    const { data: authData } = await supabase.auth.getSession();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/sessions/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authData.session?.access_token}` },
        body: JSON.stringify({ session_id: sessionId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSession(data.session);
    } catch (err: any) { setError(err.message); } finally { setActionLoading(false); }
  };

  const handleEndSession = async () => {
    setActionLoading(true); setError('');
    const { data: authData } = await supabase.auth.getSession();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/sessions/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authData.session?.access_token}` },
        body: JSON.stringify({ session_id: sessionId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSession(data.session);
    } catch (err: any) { setError(err.message); } finally { setActionLoading(false); }
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-slate-950"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-2xl max-w-md w-full backdrop-blur-md">
          <h2 className="text-xl font-bold text-red-500 mb-2">Access Denied</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <Link href="/dashboard" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-semibold inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isMentor = profile?.role === 'mentor';
  const otherPersonEmail = isMentor ? session?.student?.email : session?.mentor?.email;

  return (
    <div className="h-screen bg-slate-950 text-slate-200 font-sans flex flex-col overflow-hidden">
      {/* Navbar Header */}
      <nav className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex justify-between items-center z-50 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Dashboard</span>
          </Link>
          <div className="w-px h-6 bg-white/10 hidden sm:block"></div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Mentorship Room
              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold ${session?.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                  session?.status === 'completed' ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                    'bg-amber-500/20 text-amber-400'
                }`}>
                {session?.status}
              </span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 hidden sm:flex bg-slate-800/50 rounded-lg border border-white/5 items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-slate-300 transform max-w-[150px] truncate block" title={"With " + otherPersonEmail}>
              With {otherPersonEmail}
            </span>
          </div>
        </div>
      </nav>

      {/* Workspace */}
      <main className="flex-1 p-2 lg:p-4 flex flex-col relative overflow-hidden min-h-0">
        {session?.status === 'active' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
        )}

        {session?.status === 'completed' ? (
          <div className="w-full max-w-3xl mx-auto my-auto aspect-video bg-slate-900/50 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-500">
              <VideoOff className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Session Completed</h2>
            <p className="text-slate-400">This 1-on-1 mentorship session has ended.</p>
          </div>
        ) : session?.status === 'pending' ? (
          <div className="w-full max-w-3xl mx-auto my-auto aspect-video bg-slate-900/50 border border-white/10 rounded-3xl flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <Video className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to connect?</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              {isMentor
                ? "Waiting for the student to join the session. The room will unlock once they connect."
                : "Your mentor has prepared a coding challenge. Join when ready."}
            </p>
            {!isMentor && (
              <button onClick={handleJoinSession} disabled={actionLoading} className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg disabled:opacity-50 mt-8 inline-flex items-center gap-2">
                <Video className="w-5 h-5" /> {actionLoading ? 'Joining...' : 'Join Session Room'}
              </button>
            )}
          </div>
        ) : (
          /* ACTIVE STATE: FLEX COLUMNS */
          <div className="flex-1 flex flex-col lg:flex-row gap-3 relative z-10 w-full min-h-0">

            {/* Left Col: Code Editor */}
            {showEditor && (
              <div className="w-full lg:w-3/5 xl:w-2/3 min-h-[40vh] lg:min-h-0 lg:h-full transition-all flex flex-col">
                <CodeEditor code={code} language={language} onChange={handleCodeChange} onLanguageChange={handleLanguageChange} />
              </div>
            )}

            {/* Right Col: Video grid + Chat */}
            <div className={`flex flex-col gap-3 transition-all lg:h-full min-h-0 ${showEditor ? 'w-full lg:w-2/5 xl:w-1/3 shrink-0' : 'w-full max-w-4xl mx-auto flex-1'} `}>

              {/* VIDEO GRID (Top half of right col) */}
              <div className="w-full bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative aspect-[16/9] lg:aspect-auto lg:h-[40%] shrink-0">

                {/* Remote WebRTC Video */}
                <video
                  ref={remoteVideoRef}
                  autoPlay playsInline
                  className="w-full h-full object-cover"
                />

                {/* Fallback if remote stream loads but is black/off */}
                {!remoteStreamHasVideo && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700 shadow-xl mb-3">
                      <span className="text-2xl sm:text-3xl text-slate-500 font-bold">{otherPersonEmail?.charAt(0).toUpperCase() || '?'}</span>
                    </div>
                    <p className="font-medium text-white text-xs sm:text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">Waiting for video...</p>
                  </div>
                )}

                {/* Local WebRTC Video (Picture-in-Picture) */}
                <div className="absolute top-4 right-4 w-[30%] sm:w-[25%] aspect-[3/4] sm:aspect-video bg-slate-800 border-2 border-slate-700/80 rounded-xl overflow-hidden shadow-2xl z-20 transition-all hover:scale-105 group/pip bg-black">
                  {videoOn ? (
                    <video
                      ref={localVideoRef}
                      autoPlay playsInline muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                      <VideoOff className="w-4 h-4 sm:w-6 sm:h-6 text-slate-600" />
                    </div>
                  )}
                  {!micOn && (
                    <div className="absolute top-1 right-1 p-1 bg-red-500 rounded backdrop-blur-md">
                      <MicOff className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] text-white backdrop-blur-md">You</div>
                </div>
              </div>

              {/* Chat Panel (Bottom half of right col) */}
              {showChat && (
                <div className="flex-1 min-h-[300px] lg:min-h-0 w-full transition-all">
                  <ChatPanel messages={messages} onSendMessage={handleSendMessage} />
                </div>
              )}

              {/* Toolbar Controls */}
              <div className="h-[64px] bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-between px-3 sm:px-4 shrink-0 shadow-lg">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button onClick={() => setMicOn(!micOn)} className={`p-2.5 rounded-xl transition-all ${micOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'}`} title={micOn ? 'Mute' : 'Unmute'}>
                    {micOn ? <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                  <button onClick={() => setVideoOn(!videoOn)} className={`p-2.5 rounded-xl transition-all ${videoOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'}`} title={videoOn ? 'Stop Video' : 'Start Video'}>
                    {videoOn ? <Video className="w-4 h-4 sm:w-5 sm:h-5" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                  <div className="w-px h-6 bg-white/10 mx-1"></div>
                  <button onClick={() => setShowEditor(!showEditor)} className={`p-2.5 rounded-xl transition-all ${showEditor ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-800 hover:bg-slate-700 text-white'}`} title="Code Editor">
                    <Code className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button onClick={() => setShowChat(!showChat)} className={`p-2.5 rounded-xl transition-all ${showChat ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-800 hover:bg-slate-700 text-white'}`} title="Chat">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <button onClick={handleEndSession} disabled={actionLoading} className="px-3 sm:px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg disabled:opacity-50">
                  <PhoneOff className="w-4 h-4" /> <span className="hidden sm:inline">End Call</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
