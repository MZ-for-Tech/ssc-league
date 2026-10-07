import type { AdminDashboardViewProps } from "@/components/admin/admin-dashboard-types";
import { adminPanelClass } from "@/components/admin/admin-dashboard-styles";
import DashboardEmptyChart from "@/components/admin/DashboardEmptyChart";

export function TopicAccuracyChart({ topics }: { topics: AdminDashboardViewProps["topicStats"] }) {
  const topicsWithAttempts = topics.filter((topic) => topic.attempts > 0);
  const plotLeft = 54;
  const plotRight = 620;
  const plotTop = 22;
  const plotBottom = 176;
  const points = topicsWithAttempts.map((topic, index) => {
    const accuracy = Math.round((topic.correct / topic.attempts) * 100);
    const x = topicsWithAttempts.length === 1
      ? (plotLeft + plotRight) / 2
      : plotLeft + (index / (topicsWithAttempts.length - 1)) * (plotRight - plotLeft);
    const y = plotBottom - (accuracy / 100) * (plotBottom - plotTop);
    return { ...topic, accuracy, x, y };
  });
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const targetY = plotBottom - (70 / 100) * (plotBottom - plotTop);

  return (
    <section aria-labelledby="topic-accuracy-heading" className={`${adminPanelClass} app-panel-padding`}>
      <div className="mb-5">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">All season</p>
        <h2 id="topic-accuracy-heading" className="mt-1 text-lg font-semibold text-foreground">Answer accuracy</h2>
        <p className="mt-1 text-sm text-muted">Correct answers by module, in course order.</p>
      </div>
      {points.length ? (
        <div className="overflow-x-auto">
          <div className="min-w-[440px] sm:min-w-0">
          <p className="mb-2 text-xs text-muted sm:hidden">Swipe to inspect the chart.</p>
          <svg
            viewBox="0 0 640 226"
            className="h-auto w-full"
            role="img"
            aria-label={`Answer accuracy by module: ${points.map((point) => `${point.name} ${point.accuracy}%`).join(", ")}. Dashed line marks 70%.`}
          >
            {[100, 50, 0].map((value) => {
              const y = plotBottom - (value / 100) * (plotBottom - plotTop);
              return (
                <g key={value}>
                  <line x1={plotLeft} x2={plotRight} y1={y} y2={y} stroke="rgb(var(--surface-light))" strokeWidth="1" />
                  <text x="42" y={y + 4} textAnchor="end" fill="rgb(var(--slate-500))" fontSize="12">{value}%</text>
                </g>
              );
            })}
            <line x1={plotLeft} x2={plotRight} y1={targetY} y2={targetY} stroke="rgb(var(--amber-400))" strokeWidth="1.5" strokeDasharray="5 5" />
            {points.length > 1 && <polyline points={linePoints} fill="none" stroke="rgb(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
            {points.map((point) => (
              <g key={point.topicId}>
                <circle cx={point.x} cy={point.y} r="5" fill="rgb(var(--background))" stroke="rgb(var(--cyan-200))" strokeWidth="3">
                  <title>{point.name}: {point.accuracy}% correct across {point.attempts} attempts</title>
                </circle>
                <text x={point.x} y="205" textAnchor="middle" fill="rgb(var(--muted))" fontSize="12">W{point.weekNumber}</text>
              </g>
            ))}
          </svg>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span className="h-px w-5 border-t border-dashed border-amber-400" />
            <span>70% reference</span>
          </div>
          </div>
        </div>
      ) : <DashboardEmptyChart message="No question attempts to compare yet." />}
    </section>
  );
}
