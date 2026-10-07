import PageHeaderSkeleton from "@/components/PageHeaderSkeleton";

export default function AdminLoading() {
  return (
    <div className="app-page-stack w-full pb-16" aria-busy="true" aria-label="Loading admin workspace">
      <PageHeaderSkeleton titleWidth="w-64" actionWidths={["w-36", "w-44"]} actionHeight="h-11" />
      <section className="grid animate-pulse grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="instrument-panel min-h-32 border border-border bg-surface/50 app-panel-padding">
            <div className="h-3 w-24 rounded bg-surface-light/25" />
            <div className="mt-4 h-7 w-16 rounded bg-surface-light/35" />
            <div className="mt-3 h-3 w-32 max-w-full rounded bg-surface-light/15" />
          </div>
        ))}
      </section>
      <div className="grid gap-5 xl:grid-cols-2">
        {[0, 1].map((item) => <section key={item} className="h-72 animate-pulse rounded-2xl border border-border bg-surface/45" />)}
      </div>
    </div>
  );
}
