import React from "react";

export default function ModulesLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 animate-pulse pb-20">
      
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
        <div className="space-y-2">
            <div className="h-8 w-48 bg-surface-light/50 rounded-lg" />
            <div className="h-4 w-64 bg-surface-light/30 rounded-lg" />
        </div>
        <div className="hidden md:block h-8 w-24 bg-surface-light/30 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Timeline Skeleton */}
        <div className="lg:col-span-2 relative">
           
           {/* Vertical Line Placeholder */}
           <div className="absolute left-6 top-4 bottom-0 w-0.5 bg-surface-light/30 hidden md:block" />

           <div className="space-y-8">
              {/* Generate 5 Mock Modules */}
              {[...Array(5)].map((_, i) => (
                 <div key={i} className="relative flex gap-6">
                    
                    {/* Left Rail Icon */}
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-xl bg-surface-light/40 border-2 border-surface-light/50 z-10" />
                    </div>

                    {/* Right Content Card */}
                    <div className="flex-1 mb-2 p-6 rounded-2xl border border-border bg-surface/50">
                        <div className="h-6 w-32 bg-surface-light/40 rounded mb-3" />
                        <div className="space-y-2 mb-6">
                            <div className="h-4 w-full bg-surface-light/20 rounded" />
                            <div className="h-4 w-3/4 bg-surface-light/20 rounded" />
                        </div>
                        
                        {/* Resource Grid Placeholder */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                             <div className="h-12 w-full bg-surface-light/30 rounded-lg border border-border/50" />
                             <div className="h-12 w-full bg-surface-light/30 rounded-lg border border-border/50" />
                        </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* RIGHT COLUMN: HUD Skeleton */}
        <div className="space-y-6 h-fit lg:sticky lg:top-8">
            
            {/* Card 1: Campaign Status */}
            <div className="bg-surface/50 border border-border rounded-2xl p-6 space-y-4">
                 <div className="h-4 w-32 bg-surface-light/40 rounded" />
                 <div className="flex items-end justify-between">
                    <div className="h-8 w-12 bg-surface-light/50 rounded" />
                    <div className="h-4 w-20 bg-surface-light/30 rounded" />
                 </div>
                 <div className="h-2 w-full bg-surface-light/30 rounded-full" />
                 <div className="h-16 w-full bg-surface-light/10 rounded-lg" />
            </div>

            {/* Card 2: XP */}
            <div className="bg-surface/50 border border-border rounded-2xl p-6 flex items-center justify-between">
                 <div className="space-y-2">
                    <div className="h-3 w-20 bg-surface-light/40 rounded" />
                    <div className="h-8 w-24 bg-surface-light/50 rounded" />
                 </div>
                 <div className="h-10 w-10 bg-surface-light/30 rounded-xl" />
            </div>

            {/* Card 3: Intel Bank */}
            <div className="bg-surface/50 border border-border rounded-2xl p-6 space-y-4">
                 <div className="h-4 w-24 bg-surface-light/40 rounded mb-2" />
                 <div className="space-y-2">
                     {[...Array(4)].map((_, i) => (
                         <div key={i} className="h-12 w-full bg-surface-light/20 rounded-lg" />
                     ))}
                 </div>
            </div>

        </div>

      </div>
    </div>
  );
}