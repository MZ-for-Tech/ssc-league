export default function ProfileLoading() {
  return (
    <div className="app-page-stack w-full animate-pulse pb-20" aria-busy="true" aria-label="Loading profile">
      <section aria-hidden="true" className="instrument-panel relative isolate overflow-hidden rounded-[1.75rem] border border-cyan-200/15 bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] p-4 shadow-2xl shadow-black/15 sm:p-5">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-[0.08] [mask-image:linear-gradient(90deg,black,transparent)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
            <div className="h-24 w-24 shrink-0 rounded-full bg-gradient-to-br from-cyan-300/40 via-primary/30 to-indigo-500/30 p-[3px] sm:h-28 sm:w-28">
              <div className="h-full w-full rounded-full border-[3px] border-[rgb(var(--surface-deep))] bg-surface-light/30" />
            </div>
            <div className="min-w-0 space-y-3">
              <div className="h-3 w-40 rounded bg-primary/25" />
              <div className="h-9 w-56 max-w-full rounded bg-surface-light/40 sm:h-10" />
              <div className="h-4 w-44 max-w-full rounded bg-surface-light/20" />
              <div className="flex flex-wrap gap-3 pt-1">
                <div className="h-3 w-24 rounded bg-surface-light/25" />
                <div className="h-3 w-20 rounded bg-surface-light/25" />
                <div className="h-3 w-36 rounded bg-surface-light/25" />
              </div>
            </div>
          </div>
          <div className="instrument-panel w-full max-w-sm rounded-2xl border border-cyan-100/10 bg-[rgb(var(--surface-deep))]/65 p-3 sm:p-4 xl:w-[300px] xl:shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2"><div className="h-4 w-24 rounded bg-surface-light/30" /><div className="h-8 w-32 rounded bg-surface-light/40" /></div>
              <div className="h-10 w-10 rounded-lg border border-primary/20 bg-primary/10" />
            </div>
            <div className="mt-4 flex justify-between"><div className="h-3 w-10 rounded bg-surface-light/20" /><div className="h-3 w-10 rounded bg-primary/20" /></div>
            <div className="mt-2 h-2 rounded-full border border-cyan-100/10 bg-slate-950/70"><div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-400/35 via-primary/35 to-indigo-400/35" /></div>
            <div className="mt-2 flex justify-end"><div className="h-3 w-24 rounded bg-surface-light/20" /></div>
            <div className="mt-3 border-t border-border/70 pt-2"><div className="ml-auto h-3 w-36 rounded bg-surface-light/20" /></div>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.8fr)]">
        <section aria-hidden="true" className="instrument-panel rounded-2xl border border-border bg-surface/45 app-panel-padding">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div className="h-9 w-44 rounded border-l-2 border-primary/50 bg-background/60" />
            <div className="h-4 w-24 rounded bg-surface-light/20" />
          </div>
          <div className="h-28 rounded-xl border border-border/60 bg-background/35 sm:h-32" />
        </section>
        <section aria-hidden="true" className="instrument-panel rounded-2xl border border-border bg-surface/45 app-panel-padding">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="h-9 w-40 rounded border-l-2 border-primary/50 bg-background/60" />
            <div className="h-3 w-16 rounded bg-surface-light/20" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[0, 1, 2, 3].map((item) => <div key={item} className="h-[4.25rem] rounded-xl border border-border bg-surface/55 p-3"><div className="mb-2 h-5 w-12 rounded bg-surface-light/35" /><div className="h-3 w-20 max-w-full rounded bg-surface-light/20" /></div>)}
          </div>
          <div className="mt-3 flex justify-between border-t border-border/70 pt-3"><div className="h-3 w-24 rounded bg-surface-light/20" /><div className="h-3 w-20 rounded bg-primary/20" /></div>
        </section>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(17rem,0.75fr)_minmax(0,1.35fr)]">
        <section aria-hidden="true" className="instrument-panel order-2 rounded-2xl border border-border bg-surface/45 app-panel-padding">
          <div className="mb-5 flex items-end justify-between gap-4"><div className="h-9 w-40 rounded border-l-2 border-amber-300/50 bg-background/60" /><div className="h-8 w-16 rounded-lg border border-border bg-background/40" /></div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 8 }, (_, item) => <div key={item} className="h-[4.5rem] rounded-xl border border-border bg-background/30 p-3"><div className="flex items-center gap-3"><div className="h-9 w-9 rounded-lg bg-surface-light/20" /><div className="min-w-0 flex-1 space-y-2"><div className="h-3 w-28 max-w-full rounded bg-surface-light/30" /><div className="h-3 w-full rounded bg-surface-light/15" /></div></div></div>)}
          </div>
        </section>
        <section aria-hidden="true" className="instrument-panel order-1 rounded-2xl border border-border bg-surface/45 app-panel-padding">
          <div className="mb-5 h-9 w-44 rounded border-l-2 border-primary/50 bg-background/60" />
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, item) => <div key={item} className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/30 p-3"><div className="h-8 w-8 shrink-0 rounded-lg bg-surface-light/20" /><div className="min-w-0 flex-1 space-y-2"><div className="h-3 w-3/4 rounded bg-surface-light/30" /><div className="h-3 w-2/5 rounded bg-surface-light/15" /></div><div className="h-3 w-12 rounded bg-primary/15" /></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}
