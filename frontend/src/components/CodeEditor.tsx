import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  language: string;
  code: string;
  onChange: (value: string | undefined) => void;
  onLanguageChange: (lang: string) => void;
}

export default function CodeEditor({ language, code, onChange, onLanguageChange }: CodeEditorProps) {
  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      <div className="flex justify-between items-center px-4 py-2 bg-slate-900 border-b border-white/10">
        <div className="text-white text-sm font-semibold tracking-wide flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
          Shared Editor
        </div>
        <select 
          className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-white/10 outline-none focus:border-emerald-500 transition-colors cursor-pointer"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
        </select>
      </div>
      <div className="flex-1 w-full relative min-h-[500px]">
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
    </div>
  );
}
