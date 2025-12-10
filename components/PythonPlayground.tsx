"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Terminal, Loader2, AlertCircle } from "lucide-react";
import PythonCodeBlock from "./PythonCodeBlock"; // We can reuse your syntax highlighter styles if we want, but for editing we use a simple textarea for now
import clsx from "clsx";

// Load Pyodide from CDN
const PYODIDE_VERSION = "0.23.4";

export default function PythonPlayground({ initialCode = "" }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode || "print('Hello Agent')");
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const pyodideRef = useRef<any>(null);

  // 1. Initialize Pyodide on Mount
  useEffect(() => {
    const loadPyodide = async () => {
      try {
        // @ts-ignore
        const pyodide = await window.loadPyodide({
          indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`
        });
        
        // Capture Stdout (Print statements)
        pyodide.setStdout({ batched: (msg: string) => {
            setOutput((prev) => [...prev, msg]);
        }});
        
        pyodideRef.current = pyodide;
        setIsReady(true);
      } catch (err) {
        console.error("Pyodide Load Error:", err);
        setError("Failed to load Python Core.");
      }
    };

    // Inject Script
    const script = document.createElement("script");
    script.src = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`;
    script.onload = loadPyodide;
    document.body.appendChild(script);

    return () => {
        document.body.removeChild(script);
    };
  }, []);

  // 2. Run Code
  const runCode = async () => {
    if (!pyodideRef.current) return;
    
    setIsRunning(true);
    setError(null);
    setOutput([]); // Clear previous output

    try {
      await pyodideRef.current.runPythonAsync(code);
    } catch (err: any) {
      setError(err.toString());
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-background/50 overflow-hidden shadow-2xl">
      
      {/* Header Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-border">
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-2">
            <Terminal size={14} className="text-primary" />
            Python 3.11 Kernel
            </div>
            {isReady ? (
            <span className="h-2 w-2 bg-success rounded-full animate-pulse" title="Ready" />
            ) : (
            <span className="h-2 w-2 bg-warning rounded-full" title="Loading..." />
            )}
        </div>
        
        <button 
            onClick={() => setCode(initialCode)}
          className="p-1.5 text-muted hover:text-foreground transition-colors"
            title="Reset Code"
        >
            <RotateCcw size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 h-[400px]">
        
        {/* Left: Editor (Simple Textarea for now) */}
        <div className="relative border-r border-border">
            <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
            className="w-full h-full bg-[#1e1e1e] text-slate-300 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-inset focus:ring-1 focus:ring-primary/50"
                spellCheck={false}
            />
            
            {/* Run Button Overlay */}
            <div className="absolute bottom-4 right-4">
                <button
                    onClick={runCode}
                    disabled={!isReady || isRunning}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-lg",
                        !isReady || isRunning 
                          ? "bg-surface-light text-muted cursor-wait" 
                          : "bg-primary hover:bg-primary-dim text-foreground hover:shadow-primary/25"
                    )}
                >
                    {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                    {isRunning ? "Executing..." : "Run"}
                </button>
            </div>
        </div>

        {/* Right: Console Output */}
        <div className="bg-[#0d1117] p-4 font-mono text-sm overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
            <div className="text-slate-500 mb-2 text-xs uppercase tracking-widest border-b border-slate-800 pb-2">
                Terminal Output
            </div>
            
            {output.length === 0 && !error && (
                <div className="text-slate-700 italic mt-4 text-center">
                    Ready to execute. Press Run.
                </div>
            )}

            {output.map((line, i) => (
                <div key={i} className="text-emerald-400 whitespace-pre-wrap mb-1">
                    {line}
                </div>
            ))}

            {error && (
                <div className="text-rose-400 whitespace-pre-wrap mt-4 p-3 bg-rose-950/20 border border-rose-500/30 rounded-lg text-xs">
                    <div className="flex items-center gap-2 mb-1 font-bold">
                        <AlertCircle size={14} /> Runtime Error
                    </div>
                    {error}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}