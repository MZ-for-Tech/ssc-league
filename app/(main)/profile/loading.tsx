import PageHeaderSkeleton from "@/components/PageHeaderSkeleton";

export default function ProfileLoading() {
  return (
    <div className="w-full space-y-8 pb-20" aria-busy="true" aria-label="Loading profile">
      <PageHeaderSkeleton titleWidth="w-56" descriptionWidth="w-80" actionWidth="w-36" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="animate-pulse rounded-2xl border border-border bg-surface/50 p-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 h-32 w-32 rounded-full border-4 border-border bg-surface-light/35" />
            <div className="mb-2 h-7 w-40 rounded bg-surface-light/40" />
            <div className="mb-6 h-3 w-32 rounded bg-surface-light/25" />
            <div className="mb-6 w-full space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-10 rounded bg-surface-light/25" />
                <div className="h-3 w-10 rounded bg-surface-light/25" />
                <div className="h-3 w-10 rounded bg-surface-light/25" />
              </div>
              <div className="h-2 rounded-full bg-surface-light/30" />
              <div className="mx-auto h-3 w-36 rounded bg-surface-light/20" />
            </div>
            <div className="grid w-full grid-cols-2 gap-3">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="h-20 rounded-xl border border-border bg-surface-light/15" />
              ))}
            </div>
            <div className="mt-4 h-9 w-full rounded-lg bg-primary/15" />
          </div>
          <div className="mt-8 space-y-3 border-t border-border pt-2">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex items-center gap-3 border-b border-border/70 py-3">
                <div className="h-4 w-4 rounded bg-surface-light/25" />
                <div className="h-3 w-4/5 rounded bg-surface-light/25" />
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6 lg:col-span-2">
          <div className="h-[400px] animate-pulse rounded-2xl border border-border bg-surface/40" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="animate-pulse rounded-2xl border border-border bg-surface/40 p-6 md:col-span-2">
              <div className="mb-6 h-4 w-36 rounded bg-surface-light/35" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 8 }, (_, index) => (
                  <div key={index} className="h-20 rounded-xl border border-border bg-surface-light/15" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-48 animate-pulse rounded-2xl border border-border bg-surface/40" />
              <div className="h-48 animate-pulse rounded-2xl border border-border bg-surface/40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
