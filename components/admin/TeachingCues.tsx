import DashboardEmptyChart from "@/components/admin/DashboardEmptyChart";
import { adminPanelClass } from "@/components/admin/admin-dashboard-styles";
import type { AdminDashboardViewProps } from "@/components/admin/admin-dashboard-types";

export default function TeachingCues({
  topics,
  totalStudents,
}: {
  topics: AdminDashboardViewProps["topicStats"];
  totalStudents: number;
}) {
  const lowestReach = [...topics].sort((a, b) => a.learners - b.learners)[0];
  const accuracyTopics = topics.filter((topic) => topic.attempts > 0);
  const lowestAccuracy = accuracyTopics.sort((a, b) => a.correct / a.attempts - b.correct / b.attempts)[0];
  return (
    <section aria-labelledby="teaching-cues-heading" className={`${adminPanelClass} app-panel-padding`}>
      <div className="mb-5">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">Based on season data</p>
        <h2 id="teaching-cues-heading" className="mt-1 text-lg font-semibold text-foreground">Worth a look</h2>
      </div>
      {topics.length ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-border/70 bg-background/45 p-4">
            <p className="text-xs font-medium text-slate-500">Lowest module reach</p>
            <div className="mt-1 flex items-baseline justify-between gap-3">
              <p className="truncate font-semibold text-foreground">{lowestReach.name}</p>
              <p className="shrink-0 text-sm tabular-nums text-cyan-300">{lowestReach.learners} / {totalStudents}</p>
            </div>
          </div>
          {lowestAccuracy ? (
            <div className="rounded-xl border border-border/70 bg-background/45 p-4">
              <p className="text-xs font-medium text-slate-500">Lowest answer accuracy</p>
              <div className="mt-1 flex items-baseline justify-between gap-3">
                <p className="truncate font-semibold text-foreground">{lowestAccuracy.name}</p>
                <p className="shrink-0 text-sm tabular-nums text-amber-300">{Math.round((lowestAccuracy.correct / lowestAccuracy.attempts) * 100)}%</p>
              </div>
              <p className="mt-1 text-xs text-slate-500">Across {lowestAccuracy.attempts.toLocaleString()} attempts</p>
            </div>
          ) : <DashboardEmptyChart message="No attempts yet to identify a topic for review." />}
        </div>
      ) : <DashboardEmptyChart message="Module insights will appear once the course is set up." />}
    </section>
  );
}
