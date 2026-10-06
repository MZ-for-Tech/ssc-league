import PageHeaderSkeleton from "@/components/PageHeaderSkeleton";

function LessonRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface/50 p-4">
      <div className="h-11 w-11 shrink-0 rounded-xl bg-surface-light/30" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-2/3 max-w-72 rounded bg-surface-light/40" />
        <div className="h-3 w-1/3 max-w-40 rounded bg-surface-light/25" />
      </div>
      <div className="hidden h-8 w-20 rounded-lg bg-surface-light/20 sm:block" />
    </div>
  );
}

export default function ModulesLoading() {
  return (
    <div className="w-full space-y-8 pb-20" aria-busy="true" aria-label="Loading modules">
      <PageHeaderSkeleton titleWidth="w-64" descriptionWidth="w-80" actionWidth="w-28" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {[0, 1, 2].map((module) => (
            <section key={module} className="space-y-3">
              <div className="animate-pulse rounded-xl border border-primary/15 bg-primary/5 px-5 py-4">
                <div className="mb-2 h-3 w-20 rounded bg-primary/20" />
                <div className="mb-2 h-6 w-2/3 max-w-80 rounded bg-surface-light/40" />
                <div className="h-3 w-full max-w-xl rounded bg-surface-light/25" />
              </div>
              <div className="space-y-3">
                <LessonRowSkeleton />
                <LessonRowSkeleton />
              </div>
            </section>
          ))}
        </div>

        <aside className="h-fit space-y-6 lg:sticky lg:top-8">
          <div className="animate-pulse space-y-4 rounded-2xl border border-border bg-surface/50 p-6">
            <div className="h-4 w-32 rounded bg-surface-light/40" />
            <div className="flex items-end justify-between">
              <div className="h-10 w-14 rounded bg-surface-light/50" />
              <div className="h-4 w-24 rounded bg-surface-light/30" />
            </div>
            <div className="h-2 w-full rounded-full bg-surface-light/30" />
            <div className="h-16 w-full rounded-lg bg-surface-light/15" />
          </div>
          <div className="flex animate-pulse items-center justify-between rounded-2xl border border-border bg-surface/50 p-6">
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-surface-light/30" />
              <div className="h-7 w-24 rounded bg-surface-light/45" />
            </div>
            <div className="h-10 w-10 rounded-xl bg-surface-light/25" />
          </div>
          <div className="animate-pulse space-y-4 rounded-2xl border border-border bg-surface/50 p-6">
            <div className="h-4 w-24 rounded bg-surface-light/40" />
            <div className="space-y-2">
              {[0, 1, 2].map((item) => <div key={item} className="h-12 rounded-lg bg-surface-light/15" />)}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
