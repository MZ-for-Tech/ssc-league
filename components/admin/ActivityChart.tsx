import { adminPanelClass } from "@/components/admin/admin-dashboard-styles";

export default function ActivityChart({
  activityByDay,
  activeLearners,
  totalStudents,
  windowLabel,
}: {
  activityByDay: { date: string; label: string; count: number }[];
  activeLearners: number;
  totalStudents: number;
  windowLabel: string;
}) {
  const maxCount = Math.max(...activityByDay.map((day) => day.count), 1);
  const attemptTotal = activityByDay.reduce((sum, day) => sum + day.count, 0);

  return (
    <section aria-labelledby="activity-heading" className={`${adminPanelClass} p-5 sm:p-6`}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-6">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">{windowLabel}</p>
          <h2 id="activity-heading" className="mt-1 text-lg font-semibold text-foreground">Student activity</h2>
          <p className="mt-1 text-sm text-muted">Question attempts by day</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-6">
          <div><p className="font-mono text-xl font-bold text-foreground">{activeLearners.toLocaleString()}<span className="text-sm font-medium text-muted"> / {totalStudents.toLocaleString()}</span></p><p className="text-xs text-muted">students active</p></div>
          <div><p className="font-mono text-xl font-bold text-primary">{attemptTotal.toLocaleString()}</p><p className="text-xs text-muted">attempts</p></div>
        </div>
      </div>

      <div role="img" aria-label={`Question attempts over the past seven days. ${attemptTotal} total attempts from ${activeLearners} active students.`} className="grid h-36 grid-cols-7 gap-2 sm:gap-4">
        {activityByDay.map((day) => {
          const height = day.count ? Math.max((day.count / maxCount) * 100, 8) : 0;
          return (
            <div key={day.date} className="flex min-w-0 flex-col items-center gap-1.5">
              <span className="h-3 text-xs tabular-nums text-slate-500">{day.count || ""}</span>
              <div className="flex w-full flex-1 items-end rounded-t-md bg-surface/70">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-cyan-600 to-cyan-300 shadow-[0_0_18px_rgb(var(--primary)/0.2)] transition-all"
                  style={{ height: `${height}%` }}
                  title={`${day.label}: ${day.count} attempts`}
                />
              </div>
              <span className="text-xs font-medium text-slate-500">{day.label}</span>
            </div>
          );
        })}
      </div>
      {attemptTotal === 0 && <p className="mt-4 text-center text-xs text-slate-500">No question attempts recorded this week.</p>}
    </section>
  );
}
