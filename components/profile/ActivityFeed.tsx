"use client";

import React from "react";
import { CheckCircle2, Calendar, Zap, Trophy, Terminal } from "lucide-react";
import clsx from "clsx";

// Simplified Interface
interface ActivityItem {
  id: string;
  type: string;
  desc: string;
  xp: number;
  date: Date;
}

export default function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  
  const getIcon = (type: string) => {
    switch (type) {
      case "ATTENDANCE": return <Calendar size={14} className="text-success" />;
      case "QUIZ_WIN": return <Terminal size={14} className="text-primary" />;
      case "STREAK_BONUS": return <Zap size={14} className="text-warning" />;
      default: return <CheckCircle2 size={14} className="text-muted" />;
    }
  };

  return (
    <div className="bg-surface/50 border border-border rounded-2xl p-6 backdrop-blur-sm h-full flex flex-col">
      <h3 className="text-foreground font-bold mb-4 flex items-center justify-between">
        <span>Recent Intel</span>
        <span className="text-xs font-mono text-muted uppercase">Live Feed</span>
      </h3>

      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto pr-2 max-h-[300px] space-y-0 relative scrollbar-thin scrollbar-thumb-surface-light scrollbar-track-transparent">
        
        {/* Vertical Line */}
        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-surface-light" />

        {activities.map((act) => (
          <div key={act.id} className="relative pl-8 py-3 group">
            
            {/* Icon Bubble */}
            <div className={clsx(
              "absolute left-0 top-3.5 w-6 h-6 rounded-full border flex items-center justify-center z-10 transition-colors",
              "bg-surface border-surface-light group-hover:border-surface-light"
            )}>
                {getIcon(act.type)}
            </div>

            {/* Content */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="text-sm text-muted font-medium group-hover:text-foreground transition-colors line-clamp-1">
                        {act.desc}
                    </div>
                    <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5">
                        {act.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {act.type.replace('_', ' ')}
                    </div>
                </div>
                  <div className="text-xs font-bold font-mono text-primary bg-cyan-950/30 px-2 py-1 rounded border border-cyan-900/50 whitespace-nowrap ml-2">
                    +{act.xp} XP
                </div>
            </div>
          </div>
        ))}
        
        {activities.length === 0 && (
            <div className="text-muted text-sm text-center py-10 italic">
                No activity logs found. Engage in missions to generate data.
            </div>
        )}
      </div>
    </div>
  );
}