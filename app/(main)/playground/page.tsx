import React from "react";
import PythonPlayground from "@/components/PythonPlayground";
import { Terminal, Cpu } from "lucide-react";

export const metadata = {
  title: "Training Ground | SSC2 League",
  description: "Execute Python code in a secure sandbox environment.",
};

export default function PlaygroundPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4">
      
      {/* --- HEADER (MATCHING LEADERBOARD STYLE) --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-800 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Cpu className="text-cyan-400" size={32} />
                Training Ground
            </h1>
            <p className="text-slate-400 text-sm mt-1">
                Secure sandbox environment for algorithm testing and syntax drills.
            </p>
        </div>
        
        <div className="flex items-center gap-4">
             {/* Status Badge */}
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider font-mono">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                KERNEL_READY
             </div>
        </div>
      </div>

      {/* The Playground */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Main Editor Area - Full Width */}
        <div className="w-full">
             <PythonPlayground initialCode={`# Welcome to the SSC2 Training Ground
# Write your Python code below and click "Run"

def mission_report(agent_name):
    return f"Agent {agent_name} is ready for deployment."

print(mission_report("Ezz"))
`} />
        </div>

      </div>
    </div>
  );
}