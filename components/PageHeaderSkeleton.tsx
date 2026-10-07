interface PageHeaderSkeletonProps {
  titleWidth?: string;
  actionWidth?: string;
  actionWidths?: string[];
  actionHeight?: string;
}

export default function PageHeaderSkeleton({
  titleWidth = "w-52",
  actionWidth = "w-32",
  actionWidths,
  actionHeight = "h-10",
}: PageHeaderSkeletonProps) {
  const actions = actionWidths ?? [actionWidth];
  return (
    <header
      aria-hidden="true"
      className="instrument-panel relative isolate animate-pulse overflow-hidden rounded-2xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] app-panel-padding shadow-xl shadow-black/20"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="relative z-10 flex flex-col gap-4 sm:gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 shrink-0 rounded-md bg-primary/25 sm:h-7 sm:w-7" />
            <div className={`h-6 max-w-full rounded-lg bg-surface-light/45 sm:h-8 ${titleWidth}`} />
          </div>
        </div>
        <div className="flex max-w-full flex-wrap items-center gap-3">
          {actions.map((width, index) => <div key={index} className={`max-w-full rounded-lg border border-border bg-background/45 ${width} ${actionHeight}`} />)}
        </div>
      </div>
    </header>
  );
}
