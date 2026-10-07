import PageHeaderSkeleton from "@/components/PageHeaderSkeleton";

function LessonRowSkeleton({ isLast = false }: { isLast?: boolean }) {
  return (
    <div className="relative pl-8 pb-8">
      {!isLast && <div className="absolute bottom-0 left-[11px] top-8 w-0.5 bg-slate-800" />}
      <div className="absolute left-0 top-1 z-10 h-6 w-6 rounded-full border-2 border-primary/35 bg-slate-950" />
      <div className="animate-pulse rounded-xl border border-primary/20 bg-slate-900/50 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-3 w-24 rounded bg-primary/20" />
            <div className="h-5 w-2/3 max-w-72 rounded bg-surface-light/35" />
            <div className="space-y-2"><div className="h-3 w-full max-w-lg rounded bg-surface-light/20" /><div className="h-3 w-4/5 max-w-md rounded bg-surface-light/20" /></div>
          </div>
          <div className="h-10 w-10 shrink-0 rounded-full border border-primary/20 bg-primary/10" />
        </div>
      </div>
    </div>
  );
}

export default function ModulesLoading() {
  return (
    <div className="w-full space-y-8 pb-20" aria-busy="true" aria-label="Loading modules">
      <PageHeaderSkeleton titleWidth="w-64" actionWidth="w-28" />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.8fr)]">
        <div className="min-w-0 space-y-8">
          {[0, 1, 2].map((module) => (
            <section key={module} className="space-y-3">
              <div className="instrument-panel grid animate-pulse gap-4 border border-primary/20 bg-surface/55 p-4 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-center sm:px-5">
                <div>
                  <div className="mb-2 h-3 w-20 rounded bg-primary/20" />
                  <div className="mb-2 h-6 w-2/3 max-w-80 rounded bg-surface-light/35" />
                  <div className="h-3 w-full max-w-xl rounded bg-surface-light/20" />
                </div>
                <div className="space-y-2 sm:border-l sm:border-border/70 sm:pl-4">
                  <div className="flex justify-between"><div className="h-3 w-24 rounded bg-surface-light/20" /><div className="h-3 w-10 rounded bg-surface-light/25" /></div>
                  <div className="h-1.5 bg-surface-light/25" />
                </div>
              </div>
              <div className="space-y-3">
                <LessonRowSkeleton />
                <LessonRowSkeleton isLast />
              </div>
            </section>
          ))}
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-6">
          <div className="instrument-panel animate-pulse border border-border bg-surface/50 app-panel-padding">
            <div className="mb-4 flex justify-between"><div className="h-3 w-28 rounded bg-surface-light/30" /><div className="h-2 w-2 rounded-full bg-primary/25" /></div>
            <div className="flex items-end justify-between gap-3"><div className="h-8 w-20 rounded bg-surface-light/35" /><div className="h-3 w-28 rounded bg-surface-light/20" /></div>
            <div className="mt-3 h-1.5 bg-surface-light/25" />
            <div className="mt-4 flex justify-between border-t border-border/70 pt-3"><div className="h-3 w-16 rounded bg-surface-light/20" /><div className="h-4 w-12 rounded bg-warning/20" /></div>
          </div>
          <div className="instrument-panel animate-pulse relative overflow-hidden border border-amber-200/20 bg-amber-950/20 app-panel-padding">
            <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rotate-45 border border-amber-100/[.08]" />
            <div className="relative">
              <div className="ml-auto h-4 w-4 rounded bg-amber-200/25" />
              <div className="mt-1 h-3 w-40 max-w-full rounded bg-amber-100/25" />
              <div className="mt-3 h-6 w-4/5 rounded bg-surface-light/35" />
              <div className="mt-3 space-y-2"><div className="h-3 w-full rounded bg-surface-light/20" /><div className="h-3 w-4/5 rounded bg-surface-light/20" /></div>
              <div className="mt-4 flex items-center justify-between border-t border-amber-100/15 pt-3"><div className="h-3 w-36 rounded bg-amber-100/25" /><div className="h-4 w-4 rounded bg-amber-100/25" /></div>
            </div>
          </div>
          <div className="instrument-panel animate-pulse border border-border bg-surface/50 app-panel-padding">
            <div className="mb-3 flex justify-between"><div className="h-3 w-28 rounded bg-surface-light/30" /><div className="h-3 w-12 rounded bg-surface-light/20" /></div>
            <div className="space-y-1">{[0, 1, 2, 3].map((item) => <div key={item} className="flex items-center gap-3 border-b border-border/50 px-2 py-2.5 last:border-0"><div className="h-4 w-4 rounded bg-primary/15" /><div className="min-w-0 flex-1 space-y-1.5"><div className="h-3 w-4/5 rounded bg-surface-light/25" /><div className="h-3 w-2/5 rounded bg-surface-light/15" /></div></div>)}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
