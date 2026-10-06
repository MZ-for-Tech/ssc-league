import PageHeaderSkeleton from "@/components/PageHeaderSkeleton";

export default function CommsLoading() {
  return (
    <div className="w-full space-y-8 pb-20" aria-busy="true" aria-label="Loading communications">
      <PageHeaderSkeleton titleWidth="w-56" actionWidth="w-36" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <article key={index} className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 shrink-0 rounded-full border-2 border-slate-700 bg-slate-950" />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="h-4 w-28 rounded bg-slate-700/70" />
                <div className="h-3 w-36 max-w-full rounded bg-slate-700/45" />
                <div className="space-y-2 pt-2">
                  <div className="h-3 w-full rounded bg-slate-700/35" />
                  <div className="h-3 w-4/5 rounded bg-slate-700/35" />
                </div>
                <div className="mt-4 flex justify-between border-t border-slate-800/70 pt-3">
                  <div className="h-3 w-20 rounded bg-rose-500/20" />
                  <div className="h-3 w-12 rounded bg-slate-700/35" />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
