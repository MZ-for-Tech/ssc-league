import type { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: string;
  icon: ReactNode;
}

export function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 hover:bg-slate-800/50 transition-all group h-24 relative overflow-hidden">
      <div className="mb-2 transition-transform group-hover:scale-110 origin-left relative z-10">{icon}</div>
      <div className="relative z-10">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">{label}</div>
        <div className="text-lg font-bold text-white truncate font-mono">{value}</div>
      </div>
      <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors" />
    </div>
  );
}
