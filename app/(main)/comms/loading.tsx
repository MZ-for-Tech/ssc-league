import React from "react";

export default function CommsLoading() {
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

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/20">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-slate-800 shrink-0" />

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                        <div className="h-4 w-24 bg-slate-800 rounded" />
                        <div className="h-3 w-32 bg-slate-800/50 rounded" />
                        
                        <div className="pt-3 mt-1 border-t border-slate-800/50 flex justify-between">
                            <div className="h-3 w-20 bg-slate-800/50 rounded" />
                            <div className="h-3 w-12 bg-slate-800/30 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}