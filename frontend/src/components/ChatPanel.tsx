import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export interface ChatMessage {
  id: string;
  text: string;
  sender_email: string;
  created_at: string;
  isMine: boolean;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export default function ChatPanel({ messages, onSendMessage }: ChatPanelProps) {
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      <div className="bg-slate-900 border-b border-white/10 px-4 py-3 shrink-0">
        <h3 className="text-white font-semibold text-sm tracking-wide flex items-center gap-2">
          Chat Room
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-slate-500 mb-1 px-1">
              {msg.isMine ? 'You' : msg.sender_email.split('@')[0]}
            </span>
            <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${
              msg.isMine 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
            }`}>
              {msg.text}
            </div>
            <span className="text-[9px] text-slate-600 mt-1 px-1">
              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            No messages yet. Say hello!
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 bg-slate-900 border-t border-white/10 flex items-center gap-2 shrink-0">
        <input 
          type="text" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-slate-950 text-white text-sm rounded-xl px-4 py-3 outline-none border border-white/5 focus:border-emerald-500 transition-colors shadow-inner"
        />
        <button 
          type="submit" 
          disabled={!text.trim()}
          className="p-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-all shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
