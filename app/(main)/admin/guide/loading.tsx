function TextLine({ width = "w-full" }: { width?: string }) {
  return <div className={`h-3 rounded-sm bg-surface-light/25 ${width}`} />;
}

function ChapterSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <section className="border-b border-border/70 py-8 last:border-0">
      <div className="mb-5 flex items-center gap-4">
        <div className="h-4 w-6 rounded-sm bg-primary/20" />
        <div className="h-6 w-48 max-w-[70%] rounded-sm bg-surface-light/35" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex gap-3">
            <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-primary/15" />
            <div className="flex-1 space-y-2">
              <TextLine width={index % 2 === 0 ? "w-full" : "w-11/12"} />
              {index !== rows - 1 && <TextLine width="w-3/4" />}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AdminGuideLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl pb-16" aria-busy="true" aria-label="Loading admin handbook">
      <header className="animate-pulse border-b border-border pb-7">
        <div className="h-3 w-56 rounded-sm bg-primary/20" />
        <div className="mt-5 h-10 w-3/4 max-w-lg rounded-sm bg-surface-light/35" />
        <div className="mt-4 space-y-2"><TextLine /><TextLine width="w-4/5" /></div>
      </header>

      <nav aria-hidden="true" className="animate-pulse border-b border-border/70 py-6">
        <div className="mb-4 h-3 w-20 rounded-sm bg-surface-light/25" />
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {Array.from({ length: 7 }, (_, index) => <div key={index} className="flex items-center gap-3"><div className="h-3 w-5 rounded-sm bg-primary/15" /><div className={`h-3 rounded-sm bg-surface-light/25 ${index % 2 ? "w-40" : "w-32"}`} /></div>)}
        </div>
      </nav>

      <div className="animate-pulse">
        <ChapterSkeleton rows={4} />
        <ChapterSkeleton rows={5} />
        <ChapterSkeleton rows={4} />
        <ChapterSkeleton rows={3} />
      </div>
    </div>
  );
}
