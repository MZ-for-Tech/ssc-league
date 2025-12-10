import React from "react";

export default function ProfileLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8 animate-pulse pb-20">
      
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-800 pb-6">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-slate-800" />
                <div className="h-8 w-48 bg-slate-800 rounded-lg" />
            </div>
            <div className="h-4 w-64 bg-slate-800/50 rounded-lg ml-11" />
        </div>
        <div className="h-8 w-32 bg-slate-800 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COL: Identity Card Skeleton */}
        <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 relative overflow-hidden h-[600px]">
                
                {/* Avatar Area */}
                <div className="flex flex-col items-center mt-8 mb-6">
                    <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-900 shadow-xl mb-4" />
                    <div className="h-8 w-40 bg-slate-800 rounded-lg mb-2" />
                    <div className="h-3 w-32 bg-slate-800/50 rounded-lg" />
                </div>

                {/* XP Bar Area */}
                <div className="w-full mb-8 px-4">
                    <div className="flex justify-between mb-2">
                        <div className="h-3 w-10 bg-slate-800 rounded" />
                        <div className="h-3 w-10 bg-slate-800 rounded" />
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full" />
                </div>

                {/* 2x2 Grid */}
                <div className="grid grid-cols-2 gap-3 px-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-20 rounded-xl bg-slate-800/50 border border-slate-800" />
                    ))}
                </div>
            </div>
        </div>

        {/* RIGHT COL: Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* ROW 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 rounded-2xl bg-slate-900/50 border border-slate-800" />
                <div className="h-64 rounded-2xl bg-slate-900/50 border border-slate-800" />
            </div>
            
            {/* ROW 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-48 rounded-2xl bg-slate-900/50 border border-slate-800" />
                <div className="h-48 rounded-2xl bg-slate-900/50 border border-slate-800" />
            </div>
        </div>

      </div>
    </div>
  );
}