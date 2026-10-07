import React from "react";

export default function LessonEssaysLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 pb-16" aria-busy="true" aria-label="Loading written practice">
      <div className="h-4 w-32 animate-pulse rounded bg-surface-light/30" />
      <header className="animate-pulse rounded-2xl border border-border bg-surface/70 app-panel-padding">
        <div className="h-4 w-36 rounded bg-primary/20" />
        <div className="mt-4 h-9 w-2/3 max-w-lg rounded bg-surface-light/40" />
        <div className="mt-3 h-4 w-full max-w-2xl rounded bg-surface-light/25" />
        <div className="mt-2 h-4 w-4/5 max-w-xl rounded bg-surface-light/20" />
      </header>
      <div className="space-y-5">
        {[0, 1, 2].map((index) => (
          <article key={index} className="animate-pulse rounded-2xl border border-border bg-surface/70 p-5 md:p-7">
            <header className="mb-5 border-b border-border pb-4">
              <div className="h-3 w-36 rounded bg-primary/20" />
              <div className="mt-2 h-5 w-48 rounded bg-surface-light/35" />
            </header>
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-surface-light/25" />
              <div className="h-4 w-full rounded bg-surface-light/25" />
              <div className="h-4 w-4/5 rounded bg-surface-light/25" />
            </div>
            <div className="mt-6 h-40 w-full rounded-xl border border-border bg-background/60" />
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              <div className="h-3 w-64 max-w-full rounded bg-surface-light/20" />
              <div className="h-10 w-36 rounded-lg bg-primary/20" />
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
