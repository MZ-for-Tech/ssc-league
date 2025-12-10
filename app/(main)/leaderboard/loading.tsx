import React from "react";

export default function LeaderboardLoading() {
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
            <div className="h-4 w-48 bg-slate-800/50 rounded-lg ml-11" />
        </div>
        
        <div className="flex items-center gap-4">
             {/* Live Badge */}
             <div className="h-8 w-24 bg-slate-800 rounded-lg hidden md:block" />
             
             {/* Trend & Selector */}
             <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                <div className="hidden md:block space-y-1">
                    <div className="h-2 w-16 bg-slate-800/50 rounded ml-auto" />
                    <div className="h-2 w-12 bg-slate-800/50 rounded ml-auto" />
                </div>
                <div className="h-9 w-32 bg-slate-800 rounded-xl" />
             </div>
        </div>
      </div>

      {/* --- TABLE AREA SKELETON --- */}
      <div className="space-y-4 mb-12">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 px-6 pb-2 border-b border-slate-800/50 mb-2">
            <div className="col-span-2 md:col-span-1 flex justify-center"><div className="h-3 w-8 bg-slate-800 rounded" /></div>
            <div className="col-span-7 md:col-span-8 pl-4"><div className="h-3 w-20 bg-slate-800 rounded" /></div>
            <div className="col-span-3 md:col-span-3 flex justify-end"><div className="h-3 w-12 bg-slate-800 rounded" /></div>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-2">
            {[...Array(8)].map((_, i) => (
                <div 
                    key={i}
                    className="grid grid-cols-12 items-center p-3 sm:p-4 rounded-xl border border-slate-800 bg-slate-900/20"
                >
                    {/* Rank Column */}
                    <div className="col-span-2 md:col-span-1 flex flex-col items-center gap-2">
                        <div className="w-6 h-6 rounded bg-slate-800" /> {/* Rank Icon */}
                        <div className="w-10 h-4 rounded-full bg-slate-800/50" /> {/* Trend Pill */}
                    </div>

                    {/* Profile Column */}
                    <div className="col-span-7 md:col-span-8 pl-2 sm:pl-6 flex items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800 shrink-0" />
                        <div className="space-y-2 w-full max-w-[200px]">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-32 bg-slate-800 rounded" />
                                <div className="h-4 w-12 bg-slate-800/50 rounded hidden sm:block" />
                            </div>
                            <div className="h-3 w-24 bg-slate-800/50 rounded" />
                        </div>
                    </div>

                    {/* Stats Column */}
                    <div className="col-span-3 md:col-span-3 flex flex-col items-end gap-2">
                        <div className="h-6 w-20 bg-slate-800 rounded" />
                        <div className="h-4 w-16 bg-slate-800/50 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- GRAPH AREA SKELETON --- */}
      <div className="space-y-6 pt-8 border-t border-slate-800/50">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-slate-800 rounded" />
                <div className="h-6 w-48 bg-slate-800 rounded" />
            </div>
         </div>
         
         <div className="h-[400px] w-full bg-slate-900/20 border border-slate-800/50 rounded-xl p-6 relative overflow-hidden">
             {/* Fake Grid Lines */}
             <div className="absolute inset-0 flex flex-col justify-between p-6 opacity-20">
                 {[...Array(5)].map((_, i) => <div key={i} className="w-full h-px bg-slate-500" />)}
             </div>
             
             {/* Fake Chart Area */}
             <div className="absolute bottom-0 left-0 right-0 top-10 flex items-end px-10 gap-2 opacity-50">
                 {[...Array(12)].map((_, i) => (
                     <div 
                        key={i} 
                        className="flex-1 bg-slate-700/20 rounded-t-lg" 
                        style={{ height: `${Math.random() * 60 + 20}%` }}
                     />
                 ))}
             </div>
         </div>
      </div>

    </div>
  );
}