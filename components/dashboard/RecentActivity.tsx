import clsx from "clsx";
import { Radio, Terminal } from "lucide-react";
import type { DashboardActivity } from "./types";

interface RecentActivityProps {
  activity: DashboardActivity[];
}

export default function RecentActivity({ activity }: RecentActivityProps) {
  return (
    <section className="instrument-panel bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute right-5 top-5 opacity-[0.06]"><Radio size={64} /></div>
      <h3 className="relative z-10 text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
        <Terminal size={14} /> Recent Intel
      </h3>
      <div className="space-y-4 relative z-10">
        {activity.length > 0 ? activity.map((item, index) => (
          <div key={`${item.attempted_at}-${index}`} className="flex items-start gap-4 p-3 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-slate-700 hover:bg-slate-800/60 transition-all group">
            <div className={clsx(
              "mt-1.5 h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] transition-transform group-hover:scale-125",
              item.is_correct ? "bg-emerald-500 text-emerald-500" : "bg-red-500 text-red-500",
            )} />
            <div className="flex-1">
              <div className="text-sm text-slate-200 font-medium">
                {item.is_correct ? "Mission Success" : "Mission Failed"} <span className="text-slate-500 mx-1">•</span>{" "}
                <span className="text-cyan-400 font-bold">{item.Question?.Topic?.name}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 font-mono">
                <span>{new Date(item.attempted_at).toLocaleDateString()}</span>
                {item.is_correct && <span className="bg-emerald-500/10 border border-emerald-500/20 px-1.5 rounded text-emerald-400">+{item.Question?.points} XP</span>}
              </div>
            </div>
          </div>
        )) : (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-800/80 bg-slate-900/20 px-4 py-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-700/70 bg-slate-800/50 text-slate-500">
              <Radio size={17} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">No recent activity yet</p>
              <p className="mt-1 text-xs text-slate-500">Your question attempts will show up here.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
