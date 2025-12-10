import React from "react";

export default function SkeletonCard() {
  return (
    <div className="relative p-6 rounded-2xl border border-border bg-surface/50 overflow-hidden">
      
      {/* The Shimmer Overlay - Moving Wave */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-surface-light/50 to-transparent z-10" />

      {/* The Content Placeholders */}
      <div className="space-y-4">
        {/* Title Bar */}
        <div className="h-3 w-24 bg-surface-light rounded-md" />
        
        {/* Big Number */}
        <div className="h-8 w-16 bg-surface-light rounded-md" />
        
        {/* Footer Text */}
        <div className="flex items-center gap-2 mt-2">
            <div className="h-2 w-2 rounded-full bg-surface-light" />
            <div className="h-2 w-32 bg-surface-light rounded-md" />
        </div>
      </div>
      
      {/* Icon Placeholder */}
      <div className="absolute top-6 right-6 w-12 h-12 rounded-xl bg-surface-light" />
    </div>
  );
}