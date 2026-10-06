import PageHeaderSkeleton from "@/components/PageHeaderSkeleton";

export default function PlaygroundLoading() {
  return (
    <div className="w-full space-y-5 pb-20" aria-busy="true" aria-label="Loading training ground">
      <PageHeaderSkeleton titleWidth="w-64" descriptionWidth="w-[34rem]" actionWidth="w-36" />

      <section className="overflow-hidden rounded-xl border border-border bg-surface/70" aria-hidden="true">
        <div className="flex animate-pulse flex-wrap items-center justify-between gap-3 border-b border-border bg-background/60 px-4 py-2.5 md:px-5">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-2 w-2 rounded-full bg-danger/35" />
              <div className="h-2 w-2 rounded-full bg-warning/35" />
              <div className="h-2 w-2 rounded-full bg-success/35" />
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="h-4 w-28 rounded bg-surface-light/35" />
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden h-4 w-36 rounded bg-surface-light/25 sm:block" />
            <div className="h-8 w-8 rounded-md bg-surface-light/20" />
            <div className="h-8 w-20 rounded-md bg-primary/25" />
          </div>
        </div>

        <div className="grid min-h-[31rem] animate-pulse grid-cols-1 lg:grid-cols-2">
          <div className="flex min-h-[25rem] flex-col border-b border-border lg:border-b-0 lg:border-r">
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-border/70 bg-code-editor px-4">
              <div className="h-3 w-16 rounded bg-surface-light/30" />
              <div className="h-3 w-24 rounded bg-surface-light/20" />
            </div>
            <div className="relative flex-1 overflow-hidden bg-code-editor p-4 pl-16">
              <div className="absolute inset-y-0 left-0 w-12 border-r border-border/40 bg-black/10" />
              <div className="space-y-[1.125rem]">
                {["w-2/5", "w-3/4", "w-1/2", "w-5/6", "w-2/3", "w-4/5", "w-1/3", "w-3/5"].map((width, index) => (
                  <div key={index} className={`h-4 rounded ${index % 3 === 0 ? "bg-primary/20" : "bg-surface-light/25"} ${width}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="flex min-h-[25rem] flex-col bg-code-console">
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-border/70 px-4">
              <div className="h-3 w-20 rounded bg-primary/20" />
              <div className="h-3 w-36 rounded bg-surface-light/20" />
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
              <div className="h-12 w-12 rounded-xl border border-success/20 bg-success/10" />
              <div className="h-4 w-28 rounded bg-surface-light/30" />
              <div className="h-3 w-64 max-w-full rounded bg-surface-light/20" />
              <div className="h-9 w-44 rounded-lg border border-border bg-surface/60" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
