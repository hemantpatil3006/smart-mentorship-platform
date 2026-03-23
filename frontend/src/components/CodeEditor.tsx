import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  language: string;
  code: string;
  onChange: (value: string | undefined) => void;
  onLanguageChange: (lang: string) => void;
}

export default function CodeEditor({ language, code, onChange, onLanguageChange }: CodeEditorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const languages = ['javascript', 'typescript', 'python', 'html', 'css'];

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      <div className="flex justify-between items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900 border-b border-white/10 shrink-0">
        <div className="text-white text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-1.5 sm:gap-2">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
          Shared Editor
        </div>

        <div className="relative group/lang flex-shrink-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-slate-800 text-slate-300 text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg border border-white/10 outline-none focus:border-emerald-500 transition-all cursor-pointer flex items-center gap-2 hover:bg-slate-700 w-24 sm:w-28 justify-between"
          >
            <span className="capitalize truncate">{language}</span>
            <svg className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute top-full right-0 mt-1 w-full bg-slate-900 border border-white/20 rounded-lg shadow-2xl z-[100] overflow-hidden backdrop-blur-xl">
              {languages.map(lang => (
                <button
                  key={lang}
                  onClick={() => { onLanguageChange(lang); setIsOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-[10px] sm:text-xs transition-colors capitalize ${language === lang ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:bg-white/5'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 w-full relative min-h-0">
        <Editor
          height="100%"
          theme="vs-dark"
          language={language}
          value={code}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
          }}
        />
      </div>
    </div >
  );
}
