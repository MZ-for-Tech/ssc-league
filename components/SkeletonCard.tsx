export default function SkeletonCard() {
  return (
    <div aria-hidden="true" className="instrument-panel relative flex h-24 animate-pulse flex-col justify-between overflow-hidden rounded-xl border border-border bg-slate-900/50 p-4">
      <div className="h-[18px] w-[18px] rounded bg-primary/25" />
      <div>
        <div className="mb-1 h-3 w-28 max-w-full rounded bg-surface-light/30" />
        <div className="h-5 w-20 max-w-full rounded bg-surface-light/45" />
      </div>
      <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full bg-white/5 blur-xl" />
    </div>
  );
}
