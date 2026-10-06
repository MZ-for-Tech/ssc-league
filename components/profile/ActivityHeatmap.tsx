import clsx from "clsx";
import { Activity } from "lucide-react";

interface ActivityHeatmapProps {
  activityData: Record<string, number>;
  startDate: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export default function ActivityHeatmap({ activityData, startDate }: ActivityHeatmapProps) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const today = new Date();
  const end = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const startTime = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const totalActivity = Object.values(activityData).reduce((total, count) => total + count, 0);

  if (totalActivity === 0) {
    return (
      <div role="status" className="flex min-h-24 items-center gap-3 border border-dashed border-border/80 bg-background/20 px-4 py-4 sm:px-5">
        <div className="grid h-9 w-9 shrink-0 place-items-center border border-primary/20 bg-primary/5 text-primary/70"><Activity size={17} /></div>
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">No activity recorded yet</p>
          <p className="mt-1 text-xs text-muted">Attendance and practice events will build this map.</p>
        </div>
      </div>
    );
  }

  const firstWeekday = new Date(startTime).getUTCDay();
  const cellCount = Math.max(1, Math.floor((end - startTime) / DAY_MS) + 1);
  const totalCells = Math.ceil((firstWeekday + cellCount) / 7) * 7;
  const dates = Array.from({ length: totalCells }, (_, index) => {
    const dateTime = startTime + (index - firstWeekday) * DAY_MS;
    const date = new Date(dateTime);
    const dateKey = date.toISOString().slice(0, 10);
    const inRange = index >= firstWeekday && index < firstWeekday + cellCount;
    return { date, dateKey, inRange, count: inRange ? activityData[dateKey] || 0 : 0 };
  });
  const weeks = Array.from({ length: totalCells / 7 }, (_, index) => dates.slice(index * 7, index * 7 + 7));

  const getColor = (count: number) => {
    if (count === 0) return "border-slate-700/70 bg-slate-800/65";
    if (count <= 1) return "border-cyan-900 bg-cyan-950/90";
    if (count <= 3) return "border-cyan-700 bg-cyan-700";
    return "border-cyan-300 bg-cyan-400 shadow-[0_0_10px_rgb(var(--primary)/0.25)]";
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex w-max items-start gap-3">
          <div className="grid grid-rows-7 gap-[3px] pt-0.5 font-mono text-xs leading-[11px] text-muted/70" aria-hidden="true">
            { ["Sun", "", "Tue", "", "Thu", "", "Sat"].map((day, index) => <span key={index} className="h-[11px]">{day}</span>) }
          </div>
          <div className="flex gap-[3px] pt-4" role="img" aria-label={`Season activity map with ${totalActivity} recorded events`}>
            {weeks.map((week, weekIndex) => {
              const firstOfMonth = week.find(({ date, inRange }) => inRange && date.getUTCDate() === 1);
              return (
                <div key={weekIndex} className="relative flex w-[11px] shrink-0 flex-col gap-[3px]">
                  {firstOfMonth && <span className="absolute -top-4 left-0 text-xs leading-3 text-muted">{firstOfMonth.date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })}</span>}
                  {week.map(({ date, dateKey, inRange, count }) => {
                    const readableDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
                    return (
                      <span
                        key={dateKey}
                        className={clsx(
                          "h-[11px] w-[11px] rounded-[3px] border transition-transform hover:z-10 hover:scale-125",
                          inRange ? getColor(count) : "border-transparent bg-transparent",
                        )}
                        title={inRange ? `${count} recorded events · ${readableDate}` : undefined}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
          <span>Less</span>
          {[0, 1, 2, 4].map((count) => <span key={count} className={`h-2.5 w-2.5 rounded-[2px] border ${getColor(count)}`} />)}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
