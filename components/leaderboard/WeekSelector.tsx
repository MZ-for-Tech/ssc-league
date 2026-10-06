"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Calendar, Activity } from "lucide-react";
import clsx from "clsx";
import Dropdown from "@/components/ui/Dropdown";

interface WeekSelectorProps {
  maxWeek: number;
}

export default function WeekSelector({ maxWeek }: WeekSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentWeek = searchParams.get("week");
  const isLive = !currentWeek;

  const handleSelect = (week: number | null, close: () => void) => {
    if (week === null) {
      router.push("/leaderboard");
    } else {
      router.push(`/leaderboard?week=${week}`);
    }
    close();
  };

  return (
    <Dropdown
      panelRole="menu"
      panelClassName="w-48"
      trigger={({ open, toggle, panelId }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-w-[140px] items-center justify-between gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-slate-700"
        >
          <span className="flex items-center gap-2">
            {isLive ? <Activity size={16} className="text-emerald-400" /> : <Calendar size={16} className="text-cyan-400" />}
            {isLive ? "Live Ranking" : `Week ${currentWeek}`}
          </span>
          <ChevronDown size={14} className={clsx("transition-transform", open && "rotate-180")} />
        </button>
      )}
    >
      {({ close }) => (
            <div className="max-h-[300px] overflow-y-auto p-1 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
                
                {/* Live Option */}
                <button
                    role="menuitem"
                    onClick={() => handleSelect(null, close)}
                    className={clsx(
                        "w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2",
                        isLive ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                >
                    <Activity size={14} /> Live Ranking
                </button>

                <div className="h-px bg-slate-800 my-1" />

                {/* History Options */}
                {Array.from({ length: maxWeek }, (_, i) => maxWeek - i).map((week) => (
                    <button
                        key={week}
                        role="menuitem"
                        onClick={() => handleSelect(week, close)}
                        className={clsx(
                            "w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2",
                            currentWeek === String(week) ? "bg-cyan-500/10 text-cyan-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <span className="w-4 text-center text-slate-600 font-mono">{week}</span>
                        Week {week}
                    </button>
                ))}
            </div>
      )}
    </Dropdown>
  );
}
