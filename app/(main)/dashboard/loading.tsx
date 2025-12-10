import React from "react";
import SkeletonCard from "@/components/SkeletonCard";

export default function DashboardLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 animate-pulse pb-20">
      
      {/* 1. Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-800 pb-6">
        <div>
            {/* Title + Icon */}
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-slate-800" />
                <div className="h-8 w-48 bg-slate-800 rounded-lg" />
            </div>
            {/* Subtitle */}
            <div className="h-4 w-64 bg-slate-800/50 rounded-lg ml-11" />
        </div>
        <div className="h-8 w-32 bg-slate-800 rounded-lg" />
      </div>

      {/* 2. Hero HUD Skeleton (Operative Status) */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
         <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Identity Side */}
            <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-24 h-24 rounded-full bg-slate-800 shrink-0 border-4 border-slate-900" />
                <div className="space-y-3">
                    <div className="h-8 w-48 bg-slate-800 rounded-lg" />
                    <div className="flex gap-2">
                        <div className="h-5 w-24 bg-slate-800/50 rounded" />
                        <div className="h-5 w-20 bg-slate-800/50 rounded" />
                    </div>
                </div>
            </div>
            {/* Rank Card Side */}
            <div className="h-24 w-full md:w-64 bg-slate-950/50 rounded-xl border border-slate-800" />
         </div>
      </div>

      {/* 3. Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
             <SkeletonCard />
             <SkeletonCard />
             <SkeletonCard />
             <SkeletonCard />
          </div>

          {/* Rivals Widget Placeholder */}
          <div className="h-48 w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-6" />

          {/* Activity Feed Placeholder */}
          <div className="h-64 w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
             <div className="h-4 w-40 bg-slate-800 rounded mb-6" />
             <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-slate-800 mt-2" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 bg-slate-800/50 rounded" />
                            <div className="h-3 w-1/4 bg-slate-800/30 rounded" />
                        </div>
                    </div>
                ))}
             </div>
          </div>

        </div>

        {/* RIGHT COLUMN (1/3) */}
        <div className="lg:col-span-1 space-y-6">
            {/* Next Objective Placeholder */}
            <div className="h-[500px] w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col">
                <div className="h-4 w-32 bg-slate-800 rounded mb-8" />
                
                <div className="flex-1 space-y-4">
                    <div className="h-10 w-24 bg-slate-800/50 rounded" />
                    <div className="h-6 w-48 bg-slate-800/50 rounded" />
                    <div className="h-32 w-full bg-slate-800/20 rounded-xl" />
                </div>
                
                <div className="h-14 w-full bg-slate-800 rounded-xl mt-auto" />
            </div>
        </div>

      </div>
    </div>
  );
}