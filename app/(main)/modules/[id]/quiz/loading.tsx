import React from "react";

export default function QuizLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto animate-pulse pb-20">
      
      {/* 1. Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            {/* Badge (M-ID) */}
            <div className="h-6 w-16 bg-surface-light/50 rounded" />
            {/* Title (Active Mission) */}
            <div className="h-8 w-48 bg-surface-light/30 rounded-lg" />
        </div>
        {/* Right Label (Hidden on mobile usually, but good for skeleton) */}
        <div className="hidden md:flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-surface-light/30" />
            <div className="h-4 w-24 bg-surface-light/30 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COL: Main Question Card */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface/50 border border-border rounded-2xl p-6 md:p-8 relative overflow-hidden h-[600px] flex flex-col">
                
                {/* Progress Bar Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-surface-light/30" />

                {/* Question Meta (Query ID + XP) */}
                <div className="mt-4 mb-8 flex justify-between items-start">
                    <div className="h-4 w-24 bg-surface-light/40 rounded" />
                    <div className="h-4 w-12 bg-surface-light/40 rounded" />
                </div>

                {/* Question Text */}
                <div className="space-y-3 mb-10">
                    <div className="h-6 w-full bg-surface-light/30 rounded" />
                    <div className="h-6 w-5/6 bg-surface-light/30 rounded" />
                    <div className="h-6 w-4/6 bg-surface-light/30 rounded" />
                </div>

                {/* Options List */}
                <div className="space-y-3 flex-1">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-16 w-full rounded-xl border border-border bg-surface-light/10 flex items-center px-4 justify-between">
                             <div className="h-4 w-1/3 bg-surface-light/30 rounded" />
                             <div className="h-5 w-5 rounded-full bg-surface-light/20" />
                        </div>
                    ))}
                </div>

                {/* Footer Buttons */}
                <div className="mt-8 flex justify-between items-center pt-4 border-t border-border/50">
                    <div className="h-8 w-24 bg-surface-light/20 rounded-lg" /> {/* Report Btn */}
                    <div className="h-12 w-40 bg-surface-light/40 rounded-xl" /> {/* Submit Btn */}
                </div>
            </div>
        </div>

        {/* RIGHT COL: Stats & Map */}
        <div className="space-y-6">
            
            {/* Session Stats Card */}
            <div className="bg-surface/50 border border-border rounded-2xl p-6">
                <div className="h-3 w-24 bg-surface-light/40 rounded mb-4 uppercase tracking-widest" /> {/* Title */}
                <div className="space-y-4">
                    {/* Stat Row 1 */}
                    <div className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg h-16">
                        <div className="flex items-center gap-3 w-full">
                            <div className="h-10 w-10 rounded-lg bg-surface-light/30" />
                            <div className="space-y-1.5 flex-1">
                                <div className="h-2 w-16 bg-surface-light/30 rounded" />
                                <div className="h-4 w-12 bg-surface-light/50 rounded" />
                            </div>
                        </div>
                    </div>
                    {/* Stat Row 2 */}
                    <div className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg h-16">
                        <div className="flex items-center gap-3 w-full">
                            <div className="h-10 w-10 rounded-lg bg-surface-light/30" />
                            <div className="space-y-1.5 flex-1">
                                <div className="h-2 w-16 bg-surface-light/30 rounded" />
                                <div className="h-4 w-12 bg-surface-light/50 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Question Map Card */}
            <div className="bg-surface/50 border border-border rounded-2xl p-6 hidden lg:block">
                <div className="h-3 w-24 bg-surface-light/40 rounded mb-4 uppercase tracking-widest" />
                <div className="grid grid-cols-5 gap-2">
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className="h-10 rounded-lg bg-surface-light/10 border border-border/50" />
                    ))}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}