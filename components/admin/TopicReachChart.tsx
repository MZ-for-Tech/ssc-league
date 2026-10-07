import DashboardEmptyChart from "@/components/admin/DashboardEmptyChart";
import { adminPanelClass } from "@/components/admin/admin-dashboard-styles";
import type { AdminDashboardViewProps } from "@/components/admin/admin-dashboard-types";

export default function TopicReachChart({
  topics,
  totalStudents,
}: {
  topics: AdminDashboardViewProps["topicStats"];
  totalStudents: number;
}) {
  return (
    <section aria-labelledby="topic-reach-heading" className={`${adminPanelClass} app-panel-padding`}>
      <div className="mb-5">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">All season</p>
        <h2 id="topic-reach-heading" className="mt-1 text-lg font-semibold text-foreground">Module reach</h2>
        <p className="mt-1 text-sm text-muted">Students who have tried at least one question in each module.</p>
      </div>
      {topics.length ? (
        <div className="space-y-4 pr-1 sm:max-h-80 sm:overflow-y-auto">
          {topics.map((topic) => {
            const percent = totalStudents ? Math.round((topic.learners / totalStudents) * 100) : 0;
            return (
              <div key={topic.topicId}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate font-medium text-slate-300">{topic.name}</span>
                  <span className="shrink-0 tabular-nums text-slate-500">{topic.learners} / {totalStudents}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-light/50" role="img" aria-label={`${topic.name}: ${percent}% of students reached`}>
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-300 shadow-glow-primary-subtle" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : <DashboardEmptyChart message="No modules are available in this season yet." />}
    </section>
  );
}
