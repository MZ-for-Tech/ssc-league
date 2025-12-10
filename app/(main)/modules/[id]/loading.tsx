import React from "react";

export default function ModuleBriefingLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse pb-20">
      
      {/* Back Link */}
      <div className="h-4 w-32 bg-surface-light/30 rounded mb-8" />

      {/* Hero Header Skeleton */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/50 p-8 mb-8 h-64 flex flex-col justify-end">
         <div className="space-y-4 relative z-10">
             <div className="h-4 w-40 bg-surface-light/40 rounded" /> {/* Badge */}
             <div className="h-10 w-3/4 md:w-1/2 bg-surface-light/30 rounded-lg" /> {/* Title */}
             <div className="h-4 w-full md:w-2/3 bg-surface-light/20 rounded" /> {/* Desc Line 1 */}
             <div className="h-4 w-1/2 md:w-1/3 bg-surface-light/20 rounded" /> {/* Desc Line 2 */}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Resources Skeleton */}
          <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                  <div className="h-4 w-48 bg-surface-light/40 rounded mb-4" /> {/* Section Title */}
                  
                  {/* Resource Item 1 */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border h-20">
                      <div className="w-10 h-10 rounded-lg bg-surface-light/30" />
                      <div className="flex-1 space-y-2">
                          <div className="h-4 w-1/2 bg-surface-light/30 rounded" />
                          <div className="h-3 w-16 bg-surface-light/20 rounded" />
                      </div>
                  </div>
                  
                  {/* Resource Item 2 */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border h-20">
                      <div className="w-10 h-10 rounded-lg bg-surface-light/30" />
                      <div className="flex-1 space-y-2">
                          <div className="h-4 w-2/3 bg-surface-light/30 rounded" />
                          <div className="h-3 w-16 bg-surface-light/20 rounded" />
                      </div>
                  </div>
              </div>
          </div>

          {/* RIGHT: Action Card Skeleton */}
          <div className="space-y-6">
              <div className="bg-surface/80 border border-border rounded-2xl p-6 h-72 flex flex-col">
                  <div className="h-4 w-40 bg-surface-light/40 rounded mb-8" /> {/* Title */}

                  <div className="space-y-4 mb-8 flex-1">
                      <div className="flex justify-between">
                          <div className="h-3 w-20 bg-surface-light/20 rounded" />
                          <div className="h-3 w-10 bg-surface-light/30 rounded" />
                      </div>
                      <div className="flex justify-between">
                          <div className="h-3 w-20 bg-surface-light/20 rounded" />
                          <div className="h-3 w-16 bg-surface-light/30 rounded" />
                      </div>
                      <div className="flex justify-between">
                          <div className="h-3 w-20 bg-surface-light/20 rounded" />
                          <div className="h-3 w-24 bg-surface-light/30 rounded" />
                      </div>
                  </div>

                  <div className="h-12 w-full bg-surface-light/40 rounded-xl" /> {/* Button */}
              </div>
          </div>

      </div>
    </div>
  );
}