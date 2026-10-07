import PageHeaderSkeleton from "@/components/PageHeaderSkeleton";

export default function OperationsLoading() {
  return (
    <div className="app-page-stack min-w-0 w-full pb-16" aria-busy="true" aria-label="Loading league operations">
      <PageHeaderSkeleton titleWidth="w-60" actionWidths={["w-40", "w-44"]} actionHeight="h-11" />

      <div aria-hidden="true" className="animate-pulse border-b border-border pb-3 xl:pb-0">
        <div className="h-11 w-full rounded-lg border border-border bg-surface/55 xl:hidden" />
        <div className="hidden gap-1 xl:flex">
          {["w-32", "w-32", "w-36", "w-32", "w-40", "w-32", "w-24"].map((width, index) => (
            <div key={index} className={`h-12 ${width} max-w-full border-b-2 border-border/70 px-4 py-3`}>
              <div className="h-4 w-full rounded bg-surface-light/25" />
            </div>
          ))}
        </div>
      </div>

      <section aria-hidden="true" className="instrument-panel min-w-0 animate-pulse rounded-2xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] app-panel-padding shadow-lg shadow-black/20">
        <div className="mb-4 flex min-h-11 flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-warning/20" />
            <div className="h-6 w-40 rounded bg-surface-light/35" />
          </div>
          <div className="h-9 w-28 rounded-lg bg-surface-light/20" />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[0, 1, 2].map((item) => <div key={item} className="h-10 border border-border bg-background/35" />)}
        </div>

        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
          <div className="min-w-0 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {[0, 1].map((item) => (
                <div key={item} className="space-y-2">
                  <div className="h-3 w-24 rounded bg-surface-light/25" />
                  <div className="h-11 rounded-lg border border-border bg-background/50" />
                </div>
              ))}
            </div>
            <div className="h-14 border border-amber-400/15 bg-amber-400/[.035]" />
            <div className="h-11 rounded-lg border border-border bg-background/50" />
          </div>

          <div className="min-w-0 space-y-3 border border-border/70 bg-background/20 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="h-4 w-40 rounded bg-surface-light/30" />
              <div className="h-4 w-24 rounded bg-surface-light/20" />
            </div>
            {[0, 1, 2].map((item) => (
              <div key={item} className="flex items-center gap-3 border border-border/70 bg-background/30 p-3">
                <div className="h-5 w-5 shrink-0 rounded border border-border bg-surface-light/20" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-surface-light/30" />
                  <div className="h-3 w-4/5 rounded bg-surface-light/20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
