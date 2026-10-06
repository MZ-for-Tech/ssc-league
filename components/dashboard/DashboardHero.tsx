import { Activity, Trophy } from "lucide-react";
import Image from "next/image";
import type { DashboardStudent } from "./types";

interface DashboardHeroProps {
  student: DashboardStudent;
  currentRank: number;
  totalStudents: number;
  topPercent: number;
}

export default function DashboardHero({ student, currentRank, totalStudents, topPercent }: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 shadow-2xl">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="relative shrink-0 group">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 shadow-[0_0_30px_rgb(var(--primary-dim)/0.3)] group-hover:shadow-[0_0_50px_rgb(var(--primary-dim)/0.5)] transition-all duration-500">
              <Image unoptimized width={96} height={96}
                src={student.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${student.full_name}`}
                alt="Profile"
                className="w-full h-full rounded-full bg-slate-950 object-cover border-4 border-slate-950"
              />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-950 rounded-md border border-slate-800 px-2 py-0.5 shadow-xl flex items-center gap-1.5 min-w-max">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-300 tracking-wider">L{student.current_level || 1}</span>
            </div>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {student.preferred_name || student.full_name}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                Field Operative
              </div>
              <p className="text-slate-500 text-xs font-mono">ID: {student.student_id}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-black/20 p-5 rounded-2xl border border-white/5 backdrop-blur-sm w-full md:w-auto min-w-[240px] hover:border-white/10 transition-colors">
          <div className="text-right flex-1">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Global Standing</div>
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-4xl font-black text-white leading-none">#{currentRank}</span>
              <span className="text-sm text-slate-500 font-bold">/ {totalStudents}</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-mono flex justify-end items-center gap-1">
              Top {topPercent}% <Activity size={10} />
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0 shadow-[0_0_20px_rgb(var(--warning)/0.1)]">
            <Trophy size={24} />
          </div>
        </div>
      </div>
    </section>
  );
}
