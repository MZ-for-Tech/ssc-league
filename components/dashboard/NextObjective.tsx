import Link from "next/link";
import { ArrowUpRight, Calendar, CheckCircle2 } from "lucide-react";
import type { DashboardTopic } from "./types";

interface NextObjectiveProps {
  topic: DashboardTopic | null;
}

export default function NextObjective({ topic }: NextObjectiveProps) {
  return (
    <section className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 h-fit sticky top-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full group-hover:bg-cyan-500/20 transition-colors" />

      <div className="relative z-10 flex flex-col h-full">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
          <Calendar size={14} /> Next Objective
        </h3>

        {topic ? (
          <>
            <div className="flex-1 mb-8">
              <div className="text-5xl font-black text-white mb-2 tracking-tighter opacity-90">M{topic.week_number.toString().padStart(2, "0")}</div>
              <div className="text-lg text-cyan-400 font-medium mb-4 leading-snug font-mono border-l-2 border-cyan-500 pl-3">{topic.name}</div>
              <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-xl mb-6 backdrop-blur-sm">
                <p className="text-xs text-cyan-200/70 leading-relaxed font-mono">&gt; {topic.description || "Priority execution required."}</p>
              </div>
            </div>
            <Link
              href={`/modules/${topic.id}`}
              className="mt-auto w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgb(var(--primary)/0.3)] hover:shadow-[0_0_30px_rgb(var(--primary)/0.5)] active:scale-[0.98]"
            >
              ENGAGE MISSION <ArrowUpRight size={18} />
            </Link>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <CheckCircle2 size={48} className="text-emerald-500 mb-4 animate-bounce" />
            <h3 className="text-white font-bold">All Missions Complete</h3>
            <p className="text-slate-400 text-sm mt-2">Outstanding work, Agent.</p>
          </div>
        )}
      </div>
    </section>
  );
}
