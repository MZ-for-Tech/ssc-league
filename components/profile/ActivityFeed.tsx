"use client";

import { useMemo, useState } from "react";
import { Award, Check, Clock3, Radio, Terminal } from "lucide-react";
import clsx from "clsx";

export interface ProfileActivityItem {
  id: string;
  type: "practice" | "reward";
  title: string;
  desc: string;
  xp: number;
  date: Date;
  isCorrect?: boolean;
}

type FeedFilter = "all" | "practice" | "reward";

const filters: { id: FeedFilter; label: string }[] = [
  { id: "all", label: "All records" },
  { id: "practice", label: "Practice" },
  { id: "reward", label: "Awards" },
];

export default function ActivityFeed({ activities }: { activities: ProfileActivityItem[] }) {
  const [filter, setFilter] = useState<FeedFilter>("all");
  const visibleActivities = useMemo(
    () => activities.filter((activity) => filter === "all" || activity.type === filter),
    [activities, filter],
  );

  return (
    <section className="instrument-panel overflow-hidden rounded-2xl border border-border bg-surface/50">
      <header className="flex flex-col gap-3 border-b border-border/80 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="console-section-heading"><Clock3 size={15} className="text-primary" /> Mission log</h2>
          <p className="mt-1 pl-3 font-mono text-xs uppercase tracking-wider text-muted">Season record <span className="text-border">/</span> {activities.length} {activities.length === 1 ? "entry" : "entries"}</p>
        </div>
        <div className="flex flex-wrap gap-1.5" aria-label="Filter mission log">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className={clsx(
                "console-control rounded-md border px-2.5 py-1.5 text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                filter === item.id
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-background/35 text-muted hover:border-border/80 hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {visibleActivities.length ? (
        <ol className="max-h-[430px] divide-y divide-border/60 overflow-y-auto px-4 sm:px-5">
          {visibleActivities.map((activity) => {
            const isReward = activity.type === "reward";
            const Icon = isReward ? Award : activity.isCorrect ? Check : Terminal;
            return (
              <li key={`${activity.type}-${activity.id}`} className="group relative flex items-center gap-3 py-3 sm:gap-4">
                <div className={clsx(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-md border transition-colors",
                  isReward
                    ? "border-amber-300/20 bg-amber-300/5 text-amber-300"
                    : activity.isCorrect
                      ? "border-emerald-300/20 bg-emerald-300/5 text-emerald-300"
                      : "border-cyan-300/15 bg-cyan-300/5 text-cyan-200",
                )}>
                  <Icon size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <p className="text-sm font-semibold capitalize text-foreground">{activity.title}</p>
                    {activity.desc && <span className="truncate text-xs text-muted">· {activity.desc}</span>}
                  </div>
                  <p className="mt-1 font-mono text-xs font-medium uppercase tracking-wider text-muted/80">
                    {activity.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    <span className="mx-1.5 text-border">/</span>{isReward ? "Season award" : activity.isCorrect ? "Correct response" : "Practice attempt"}
                  </p>
                </div>
                <span className={clsx(
                  "console-control shrink-0 rounded-md border px-2 py-1 font-mono text-xs font-bold tabular-nums",
                  isReward ? "border-amber-300/15 bg-amber-300/5 text-amber-200" : "border-primary/15 bg-primary/5 text-primary",
                )}>{activity.xp >= 0 ? "+" : ""}{activity.xp} XP</span>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="flex min-h-28 items-center gap-3 px-5 py-5 sm:px-6">
          <div className="grid h-9 w-9 shrink-0 place-items-center border border-border bg-background/45 text-muted/70"><Radio size={17} /></div>
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">{activities.length ? "No records in this filter" : "No records logged"}</p>
            <p className="mt-1 text-xs text-muted">Practice sessions and awards will appear here.</p>
          </div>
          <div aria-hidden="true" className="ml-auto hidden h-8 items-end gap-1 opacity-35 sm:flex">
            {[3, 5, 2, 7, 4, 8, 3, 6, 2, 5].map((height, index) => <span key={index} className="w-1 bg-primary/70" style={{ height: `${height * 3}px` }} />)}
          </div>
        </div>
      )}
    </section>
  );
}
