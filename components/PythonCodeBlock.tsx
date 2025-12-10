"use client";

import React from 'react';
// 1. Use PrismLight to manually control languages
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
// 2. Import ONLY Python language (Fixes the loading issue)
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
// 3. Import the theme
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// 4. Register Python explicitly
SyntaxHighlighter.registerLanguage('python', python);

interface PythonCodeBlockProps {
  code: string;
  filename?: string;
}

const PythonCodeBlock: React.FC<PythonCodeBlockProps> = ({ code, filename = 'script.py' }) => {
  return (
    <div className="my-6 rounded-lg overflow-hidden border border-border shadow-2xl bg-[#1e1e1e] text-left">
      
      {/* Header (VS Code Tab Style) */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] border-b border-border">
        <div className="flex gap-1.5 mr-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        
        <div className="px-3 py-1 text-xs font-mono text-muted bg-surface-light/50 rounded-t-md border-t border-x border-surface-light/50 flex items-center gap-2">
          <span className="text-blue-400">def</span> 
          {filename}
        </div>
      </div>

      {/* Code Area */}
      <div className="relative text-sm md:text-base">
        <SyntaxHighlighter
          language="python"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            backgroundColor: '#1e1e1e', // Matches VS Code background
            fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace", // Better fonts
          }}
          showLineNumbers={true}
          lineNumberStyle={{ minWidth: "2.5em", paddingRight: "1em", color: "#5c6370" }}
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default PythonCodeBlock;