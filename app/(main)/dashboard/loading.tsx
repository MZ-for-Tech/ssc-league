"use client";

import { useSyncExternalStore } from "react";
import SkeletonCard from "@/components/SkeletonCard";

export default function DashboardLoading() {
  const isStudentPreview = useSyncExternalStore(
    (callback) => { window.addEventListener("popstate", callback); return () => window.removeEventListener("popstate", callback); },
    () => new URLSearchParams(window.location.search).get("view") === "student",
    () => false,
  );
  return isStudentPreview ? <StudentPreviewSkeleton /> : <StudentDashboardSkeleton />;
}

function StudentPreviewSkeleton() {
  return (
    <div className="app-page-stack w-full pb-16" aria-busy="true" aria-label="Loading student preview">
      <div className="h-20 animate-pulse rounded-xl border border-primary/20 bg-primary/5" />
      <section className="h-56 animate-pulse rounded-2xl border border-border bg-surface/60 app-panel-padding" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <SkeletonCard key={item} />)}</div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2"><div className="h-44 animate-pulse rounded-2xl border border-border bg-surface/50" /><div className="h-44 animate-pulse rounded-2xl border border-border bg-surface/50" /></div>
        <div className="h-72 animate-pulse rounded-2xl border border-border bg-surface/50" />
      </div>
    </div>
  );
}


function StudentDashboardSkeleton() {
  return (
    <div className="app-page-stack w-full pb-20" aria-busy="true" aria-label="Loading dashboard">
      {/* DashboardHero: identity and global standing */}
      <section className="relative animate-pulse overflow-hidden rounded-2xl border border-border bg-surface/50 p-6 shadow-2xl sm:p-8">
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="relative flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex w-full items-center gap-6 md:w-auto">
            <div className="relative shrink-0">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/35 via-primary/20 to-primary/10 p-1">
                <div className="h-full w-full rounded-full border-4 border-background bg-surface-light/30" />
              </div>
              <div className="absolute -bottom-3 left-1/2 h-6 w-12 -translate-x-1/2 rounded-md border border-border bg-background" />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-9 w-56 max-w-full rounded bg-surface-light/35" />
              <div className="flex flex-wrap items-center gap-3">
                <div className="h-5 w-28 rounded border border-primary/15 bg-primary/10" />
                <div className="h-3 w-24 rounded bg-surface-light/20" />
              </div>
            </div>
          </div>
          <div className="flex w-full items-center gap-6 rounded-2xl border border-border bg-background/40 p-5 md:w-auto md:min-w-60">
            <div className="flex-1 space-y-2 text-right">
              <div className="ml-auto h-3 w-28 rounded bg-surface-light/25" />
              <div className="ml-auto h-10 w-36 rounded bg-surface-light/35" />
              <div className="ml-auto h-3 w-20 rounded bg-success/15" />
            </div>
            <div className="h-12 w-12 shrink-0 rounded-xl border border-warning/15 bg-warning/10" />
          </div>
        </div>
      </section>

      {/* DashboardStats spans the content width above the two-column panels. */}
      <section className="grid animate-pulse grid-cols-2 gap-4 sm:grid-cols-4" aria-label="Loading student stats">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="flex min-h-28 items-start justify-between gap-3 rounded-2xl border border-border bg-surface/50 app-panel-padding">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-3 w-24 max-w-full rounded bg-surface-light/25" />
              <div className="h-7 w-20 max-w-full rounded bg-surface-light/40" />
            </div>
            <div className="h-10 w-10 shrink-0 rounded-xl border border-primary/15 bg-primary/10" />
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.85fr)]">
        <div className="space-y-5">
          {/* Next lesson with course progress */}
          <section className="grid animate-pulse gap-6 rounded-2xl border border-primary/20 bg-surface/60 app-panel-padding md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
            <div>
              <div className="mb-5 h-3 w-28 rounded bg-primary/25" />
              <div className="mb-3 h-5 w-28 rounded border border-primary/20 bg-primary/10" />
              <div className="mb-3 h-8 w-3/4 max-w-full rounded bg-surface-light/35" />
              <div className="space-y-2"><div className="h-3 w-full rounded bg-surface-light/20" /><div className="h-3 w-4/5 rounded bg-surface-light/20" /></div>
              <div className="mt-5 h-11 w-36 rounded-lg bg-primary/25" />
            </div>
            <div className="rounded-xl border border-border bg-background/45 app-panel-padding">
              <div className="mb-6 flex justify-between"><div className="h-4 w-28 rounded bg-surface-light/30" /><div className="h-4 w-4 rounded bg-surface-light/20" /></div>
              <div className="mb-3 flex items-end justify-between"><div className="h-8 w-20 rounded bg-surface-light/35" /><div className="h-3 w-10 rounded bg-primary/20" /></div>
              <div className="h-2 rounded-full bg-surface-light/20" />
              <div className="mt-4 border-t border-border pt-3"><div className="h-3 w-full rounded bg-surface-light/15" /></div>
            </div>
          </section>

          {/* Module comparison bar chart */}
          <section className="animate-pulse rounded-2xl border border-border bg-surface/45 app-panel-padding">
            <div className="mb-4 flex items-end justify-between gap-4"><div className="space-y-2"><div className="h-3 w-24 rounded bg-primary/20" /><div className="h-5 w-44 rounded bg-surface-light/30" /><div className="h-3 w-48 max-w-full rounded bg-surface-light/15" /></div><div className="h-12 w-24 rounded-xl border border-primary/15 bg-primary/10" /></div>
            <div className="space-y-7 py-3">
              {[0, 1, 2].map((module) => (
                <div key={module} className="grid grid-cols-[minmax(6rem,9rem)_minmax(0,1fr)] items-center gap-3 sm:gap-5">
                  <div className="h-3 w-full rounded bg-surface-light/25" />
                  <div className="h-6 overflow-hidden rounded-r-lg bg-surface-light/10"><div className={`h-full rounded-r-lg ${module === 0 ? "w-3/5" : module === 1 ? "w-2/5" : "w-4/5"} bg-primary/35`} /></div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between border-t border-border/70 pt-3"><div className="h-3 w-20 rounded bg-surface-light/15" /><div className="h-3 w-20 rounded bg-surface-light/15" /><div className="h-3 w-20 rounded bg-surface-light/15" /></div>
          </section>
        </div>

        <aside className="space-y-5">
          {/* Recent Intel */}
          <section className="animate-pulse rounded-2xl border border-border bg-surface/50 p-5">
            <div className="mb-4 h-4 w-28 rounded bg-surface-light/30" />
            <div className="space-y-3">{[0, 1, 2].map((item) => <div key={item} className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/30 p-3"><div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-surface-light/35" /><div className="min-w-0 flex-1 space-y-2"><div className="h-3 w-3/4 rounded bg-surface-light/30" /><div className="h-2.5 w-20 rounded bg-surface-light/15" /></div></div>)}</div>
          </section>

          {/* League standings nearby */}
          <section className="animate-pulse rounded-2xl border border-border bg-surface/50 p-4">
            <div className="mb-4 flex items-center justify-between gap-4"><div className="h-4 w-36 rounded bg-surface-light/35" /><div className="h-5 w-12 rounded border border-success/15 bg-success/5" /></div>
            <div className="space-y-2">{[0, 1, 2].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/30 p-2.5"><div className="h-3 w-5 rounded bg-surface-light/20" /><div className="h-8 w-8 shrink-0 rounded-full bg-surface-light/30" /><div className="min-w-0 flex-1 space-y-2"><div className="h-3 w-32 max-w-full rounded bg-surface-light/30" /><div className="h-2 w-24 max-w-full rounded bg-surface-light/15" /></div><div className="h-7 w-7 rounded-lg bg-surface-light/15" /></div>)}</div>
          </section>
          <div className="flex animate-pulse items-center justify-between gap-4 rounded-xl border border-border/80 bg-background/35 px-4 py-4"><div className="h-3 w-40 max-w-full rounded bg-surface-light/20" /><div className="h-3 w-24 rounded bg-primary/20" /></div>
        </aside>
      </div>
    </div>
  );
}
