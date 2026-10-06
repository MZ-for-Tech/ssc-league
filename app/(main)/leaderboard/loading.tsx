import PageHeaderSkeleton from "@/components/PageHeaderSkeleton";

export default function LeaderboardLoading() {
  return (
    <div className="w-full space-y-8 pb-20" aria-busy="true" aria-label="Loading leaderboard">
      <PageHeaderSkeleton titleWidth="w-64" actionWidth="w-56" />

      <section className="space-y-3">
        <div className="grid grid-cols-12 border-b border-border/70 px-5 pb-3">
          <div className="col-span-2 md:col-span-1"><div className="h-3 w-8 animate-pulse rounded bg-surface-light/35" /></div>
          <div className="col-span-7 pl-3 md:col-span-8"><div className="h-3 w-20 animate-pulse rounded bg-surface-light/35" /></div>
          <div className="col-span-3 flex justify-end"><div className="h-3 w-12 animate-pulse rounded bg-surface-light/35" /></div>
        </div>
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="grid animate-pulse grid-cols-12 items-center rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 sm:p-4">
            <div className="col-span-2 flex flex-col items-center gap-2 md:col-span-1">
              <div className="h-6 w-6 rounded bg-surface-light/35" />
              <div className="h-4 w-10 rounded-full bg-surface-light/20" />
            </div>
            <div className="col-span-7 flex min-w-0 items-center gap-4 pl-2 sm:pl-6 md:col-span-8">
              <div className="h-10 w-10 shrink-0 rounded-full bg-surface-light/35 sm:h-12 sm:w-12" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-40 max-w-full rounded bg-surface-light/40" />
                <div className="h-3 w-24 rounded bg-surface-light/25" />
              </div>
            </div>
            <div className="col-span-3 flex flex-col items-end gap-2">
              <div className="h-6 w-20 rounded bg-surface-light/35" />
              <div className="h-4 w-16 rounded-full bg-surface-light/20" />
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-6 border-t border-border/70 pt-8">
        <div className="flex items-center gap-2 animate-pulse">
          <div className="h-5 w-5 rounded bg-surface-light/30" />
          <div className="h-6 w-48 rounded bg-surface-light/40" />
        </div>
        <div className="relative h-[400px] animate-pulse overflow-hidden rounded-xl border border-slate-800/50 bg-slate-900/20 p-6">
          <div className="absolute inset-6 flex flex-col justify-between opacity-40">
            {Array.from({ length: 5 }, (_, index) => <div key={index} className="h-px w-full bg-surface-light/40" />)}
          </div>
          <div className="absolute inset-x-10 bottom-6 top-10 flex items-end gap-2 opacity-60">
            {[35, 58, 45, 72, 53, 82, 62, 42, 68, 50, 76, 60].map((height, index) => (
              <div key={index} className="flex-1 rounded-t-md bg-primary/20" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
