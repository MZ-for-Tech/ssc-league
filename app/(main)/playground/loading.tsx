import React from "react";

export default function PlaygroundLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8 animate-pulse pb-20">
      
      {/* --- HEADER SKELETON --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-800 pb-6">
        <div>
            {/* Title + Icon */}
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-slate-800" />
                <div className="h-8 w-64 bg-slate-800 rounded-lg" />
            </div>
            {/* Subtitle */}
            <div className="h-4 w-96 bg-slate-800/50 rounded-lg ml-11" />
        </div>
        
        <div className="flex items-center gap-4">
             {/* Status Badge */}
             <div className="h-8 w-32 bg-slate-800 rounded-lg" />
        </div>
      </div>

      {/* --- EDITOR SKELETON --- */}
      <div className="w-full h-[600px] rounded-xl border border-slate-800 bg-slate-900/50 relative overflow-hidden flex flex-col">
          
          {/* Toolbar */}
          <div className="h-12 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                  <div className="h-4 w-32 bg-slate-800 rounded" />
                  <div className="h-2 w-2 bg-slate-800 rounded-full" />
              </div>
              <div className="h-8 w-20 bg-slate-800 rounded-lg" />
          </div>
          
          {/* Editor Body */}
          <div className="flex-1 flex flex-col md:flex-row">
              
              {/* Left: Code Input Area */}
              <div className="w-full md:w-3/5 border-r border-slate-800 p-6 space-y-3 relative">
                  {/* Line Numbers + Code Lines */}
                  <div className="flex gap-4">
                      <div className="space-y-3 w-6 flex flex-col items-end opacity-30">
                          {[...Array(10)].map((_, i) => <div key={i} className="h-4 w-3 bg-slate-700 rounded" />)}
                      </div>
                      <div className="space-y-3 flex-1">
                          <div className="h-4 w-1/3 bg-slate-800 rounded" />
                          <div className="h-4 w-1/2 bg-slate-800 rounded" />
                          <div className="h-4 w-full bg-slate-800 rounded" />
                          <div className="h-4 w-2/3 bg-slate-800 rounded" />
                          <div className="h-4 w-3/4 bg-slate-800 rounded" />
                      </div>
                  </div>
              </div>

              {/* Right: Console Output Area */}
              <div className="w-full md:w-2/5 bg-[#0d1117] p-6 flex flex-col">
                  <div className="h-3 w-24 bg-slate-800/50 rounded mb-4 border-b border-slate-800 pb-2" />
                  <div className="space-y-2 font-mono">
                      <div className="h-3 w-full bg-emerald-500/10 rounded" />
                      <div className="h-3 w-2/3 bg-emerald-500/10 rounded" />
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}