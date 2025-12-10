"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Calendar, Activity } from "lucide-react";
import clsx from "clsx";

interface WeekSelectorProps {
  maxWeek: number;
}

export default function WeekSelector({ maxWeek }: WeekSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentWeek = searchParams.get("week");
  const isLive = !currentWeek;

  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (week: number | null) => {
    if (week === null) {
      router.push("/leaderboard");
    } else {
      router.push(`/leaderboard?week=${week}`);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-bold text-white transition-all min-w-[140px] justify-between"
      >
        <span className="flex items-center gap-2">
            {isLive ? <Activity size={16} className="text-emerald-400" /> : <Calendar size={16} className="text-cyan-400" />}
            {isLive ? "Live Ranking" : `Week ${currentWeek}`}
        </span>
        <ChevronDown size={14} className={clsx("transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="max-h-[300px] overflow-y-auto p-1 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
                
                {/* Live Option */}
                <button
                    onClick={() => handleSelect(null)}
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
                        onClick={() => handleSelect(week)}
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
        </div>
      )}
    </div>
  );
}