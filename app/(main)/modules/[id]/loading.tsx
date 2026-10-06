import React from "react";

export default function ModuleBriefingLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse space-y-6 pb-12" aria-busy="true" aria-label="Loading lesson">
      <div className="h-4 w-28 bg-surface-light/30" />

      <header className="instrument-panel flex min-h-[260px] flex-col justify-end gap-4 border border-primary/20 bg-surface/55 px-6 py-7 sm:px-9 sm:py-9">
        <div className="h-9 w-3/4 max-w-2xl bg-surface-light/40 sm:h-12" />
        <div className="h-4 w-full max-w-3xl bg-surface-light/25" />
        <div className="h-4 w-2/3 max-w-xl bg-surface-light/20" />
        <div className="mt-2 flex gap-5 border-t border-border/50 pt-4">
          <div className="h-3 w-24 bg-surface-light/25" />
          <div className="h-3 w-24 bg-surface-light/25" />
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,.8fr)]">
        <div className="space-y-4">
          <div className="h-10 w-full bg-surface-light/25" />
          {[0, 1, 2].map((item) => (
            <div key={item} className="instrument-panel flex h-[76px] items-center gap-4 border border-primary/15 bg-surface/45 p-4">
              <div className="h-11 w-11 shrink-0 bg-primary/15" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-2/3 bg-surface-light/35" />
                <div className="h-3 w-32 bg-surface-light/20" />
              </div>
              <div className="h-4 w-4 bg-surface-light/25" />
            </div>
          ))}
        </div>

        <aside className="instrument-panel border border-border bg-surface/45 p-5 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="h-3 w-32 bg-surface-light/30" />
            <div className="h-4 w-4 bg-primary/20" />
          </div>
          <div className="space-y-5">
            {[0, 1, 2, 3, 4].map((item) => <div key={item} className="flex justify-between gap-4"><div className="h-3 w-24 bg-surface-light/20" /><div className="h-3 w-20 bg-surface-light/30" /></div>)}
          </div>
          <div className="mt-6 space-y-2 border-t border-border/60 pt-5">
            <div className="h-12 w-full bg-primary/25" />
            <div className="h-11 w-full border border-border/60 bg-surface-light/15" />
          </div>
        </aside>
      </div>
    </div>
  );
}
