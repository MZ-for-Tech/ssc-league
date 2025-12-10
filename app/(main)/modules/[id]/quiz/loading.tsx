import React from "react";

export default function QuizLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8 animate-pulse pb-20">
      
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <div className="h-8 w-20 bg-surface-light/30 rounded-lg" /> {/* Badge Placeholder */}
            <div className="h-8 w-48 bg-surface-light/50 rounded-lg" /> {/* Title Placeholder */}
        </div>
        <div className="hidden md:block h-6 w-32 bg-surface-light/30 rounded" /> {/* Protocol Text */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COL: Question Card Skeleton */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface/50 border border-border rounded-2xl p-6 md:p-8 relative overflow-hidden h-[600px] flex flex-col">
                
                {/* Progress Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-surface-light/30" />

                {/* Question Header */}
                <div className="mt-4 mb-8 flex justify-between items-start">
                    <div className="h-4 w-24 bg-surface-light/30 rounded" />
                    <div className="h-4 w-12 bg-surface-light/30 rounded" />
                </div>

                {/* Question Text Block */}
                <div className="space-y-3 mb-8">
                    <div className="h-6 w-full bg-surface-light/40 rounded" />
                    <div className="h-6 w-3/4 bg-surface-light/40 rounded" />
                    <div className="h-6 w-1/2 bg-surface-light/40 rounded" />
                </div>

                {/* Options List */}
                <div className="space-y-3 flex-1">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-16 w-full rounded-xl border border-border bg-surface-light/20 flex items-center px-4">
                             <div className="h-4 w-1/3 bg-surface-light/30 rounded" />
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <div className="mt-8 flex justify-end pt-4 border-t border-border/50">
                    <div className="h-12 w-40 bg-surface-light/40 rounded-xl" />
                </div>
            </div>
        </div>

        {/* RIGHT COL: Stats Skeleton */}
        <div className="space-y-6">
            
            {/* Session Stats */}
            <div className="bg-surface/50 border border-border rounded-2xl p-6 space-y-4">
                <div className="h-4 w-32 bg-surface-light/40 rounded mb-4" />
                <div className="h-16 w-full bg-surface-light/20 rounded-lg border border-border/50" />
                <div className="h-16 w-full bg-surface-light/20 rounded-lg border border-border/50" />
            </div>

            {/* Question Map */}
            <div className="bg-surface/50 border border-border rounded-2xl p-6 hidden lg:block space-y-4">
                <div className="h-4 w-32 bg-surface-light/40 rounded mb-4" />
                <div className="grid grid-cols-5 gap-2">
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className="h-10 rounded-lg bg-surface-light/20 border border-border/50" />
                    ))}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}