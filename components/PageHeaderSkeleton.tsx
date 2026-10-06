interface PageHeaderSkeletonProps {
  titleWidth?: string;
  descriptionWidth?: string;
  actionWidth?: string;
  actionHeight?: string;
}

export default function PageHeaderSkeleton({
  titleWidth = "w-52",
  descriptionWidth = "w-72",
  actionWidth = "w-32",
  actionHeight = "h-10",
}: PageHeaderSkeletonProps) {
  return (
    <header
      aria-hidden="true"
      className="flex animate-pulse flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 shrink-0 rounded-md bg-primary/20" />
          <div className={`h-10 max-w-full rounded-lg bg-surface-light/50 ${titleWidth}`} />
        </div>
        <div className={`mt-3 h-4 max-w-full rounded bg-surface-light/30 ${descriptionWidth}`} />
      </div>
      <div className={`${actionHeight} max-w-full rounded-lg border border-border bg-surface/70 ${actionWidth}`} />
    </header>
  );
}
