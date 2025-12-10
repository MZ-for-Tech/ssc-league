import React from "react";
import clsx from "clsx";

interface ActivityHeatmapProps {
  activityData: { [date: string]: number }; 
  startDate?: string;
}

export default function ActivityHeatmap({ 
  activityData, 
  startDate = "2025-09-27" 
}: ActivityHeatmapProps) {
  
  const start = new Date(startDate);
  const today = new Date();
  start.setHours(0,0,0,0);
  today.setHours(23,59,59,999);

  const days: Date[] = [];
  let current = new Date(start);
  while (current <= today) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const getColor = (count: number) => {
    if (count === 0) return "bg-slate-800/50 border-slate-800";
    if (count <= 1) return "bg-cyan-950 border-cyan-900"; 
    if (count <= 3) return "bg-cyan-700 border-cyan-600";
    return "bg-cyan-400 border-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.5)]";
  };

  return (
    <div className="w-full">
      {/* Centered Grid */}
      <div className="flex justify-center overflow-hidden">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5">
           {days.map((date) => {
             const dateKey = date.toISOString().split("T")[0];
             const count = activityData[dateKey] || 0;
             const readableDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

             return (
               <div 
                 key={dateKey}
                 className={clsx(
                   "w-3 h-3 rounded-[2px] border transition-all hover:scale-125 hover:z-10 relative group",
                   getColor(count)
                 )}
                 title={`${count} events on ${readableDate}`}
               />
             );
           })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-4 text-[9px] text-slate-500 uppercase tracking-wider font-bold">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-[1px] bg-slate-800/50 border border-slate-800" />
            <div className="w-2 h-2 rounded-[1px] bg-cyan-950 border border-cyan-900" />
            <div className="w-2 h-2 rounded-[1px] bg-cyan-700 border border-cyan-600" />
            <div className="w-2 h-2 rounded-[1px] bg-cyan-400 border border-cyan-300" />
          </div>
          <span>More</span>
      </div>
    </div>
  );
}