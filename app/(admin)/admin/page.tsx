import React from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Users, Target, Zap, Activity, Database, Server, AlertTriangle } from "lucide-react";
import Link from "next/link";
import BulkXPWidget from "@/components/admin/BulkXPWidget";
import BroadcastWidget from "@/components/admin/BroadcastWidget";
import AttendanceWidget from "@/components/admin/AttendanceWidget";
import AuditLog from "@/components/admin/AuditLog";

export const revalidate = 0; 

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { count: totalStudents } = await supabase.from("Student").select("*", { count: "exact", head: true });
  const { count: totalQuestions } = await supabase.from("Question").select("*", { count: "exact", head: true });
  const { count: totalAnswers } = await supabase.from("StudentAnswer").select("*", { count: "exact", head: true });
  const { data: xpData } = await supabase.from("Student").select("current_xp");
  const totalXP = xpData?.reduce((acc, curr) => acc + curr.current_xp, 0) || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
        <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3"><Activity className="text-rose-500" /> System Telemetry</h2>
            <p className="text-slate-400 text-sm mt-1">Real-time platform metrics and status report.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold font-mono"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> OPERATIONAL</div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Operatives" value={totalStudents?.toString() || "0"} icon={Users} color="text-cyan-400" borderColor="border-cyan-500/20" subVal="Registered" />
        <StatCard label="Total XP" value={totalXP.toLocaleString()} icon={Zap} color="text-yellow-400" borderColor="border-yellow-500/20" subVal="Engagement" />
        <StatCard label="Missions" value={totalQuestions?.toString() || "0"} icon={Database} color="text-purple-400" borderColor="border-purple-500/20" subVal="Active" />
        <StatCard label="Attempts" value={totalAnswers?.toLocaleString() || "0"} icon={Target} color="text-rose-400" borderColor="border-rose-500/20" subVal="Simulations" />
      </div>

      {/* OPERATIONAL TOOLS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BulkXPWidget />
          <BroadcastWidget />
          <AttendanceWidget />
      </div>

      {/* LOWER DECK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><Server size={16} className="text-slate-500" /> Deployment Controls</h3>
              <div className="grid grid-cols-2 gap-3">
                  <Link href="/admin/questions" className="p-4 rounded-xl bg-slate-800/50 hover:bg-cyan-500/10 border border-slate-700 hover:border-cyan-500/50 transition-all group text-center flex flex-col items-center justify-center gap-2">
                      <div className="text-slate-400 group-hover:text-cyan-400"><Target size={24} /></div><div className="text-xs font-bold text-white">Create Mission</div>
                  </Link>
                  <Link href="/admin/users" className="p-4 rounded-xl bg-slate-800/50 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/50 transition-all group text-center flex flex-col items-center justify-center gap-2">
                      <div className="text-slate-400 group-hover:text-rose-400"><Users size={24} /></div><div className="text-xs font-bold text-white">Manage Roster</div>
                  </Link>
              </div>
          </div>
          <div className="lg:col-span-1"><AuditLog /></div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, borderColor, subVal }: any) {
  return (
    <div className={`p-5 rounded-2xl border ${borderColor} bg-slate-900/40 backdrop-blur-sm hover:bg-slate-900/60 transition-colors`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg bg-slate-950 border border-slate-800 ${color}`}><Icon size={20} /></div>
        <div className="flex gap-0.5 items-end h-6 opacity-30">{[40,60,30,80,50].map((h, i) => (<div key={i} className={`w-1 bg-current ${color}`} style={{ height: `${h}%` }} />))}</div>
      </div>
      <div><div className="text-2xl font-black text-white font-mono tracking-tight">{value}</div><div className="text-[10px] uppercase font-bold text-slate-500 mt-1 flex justify-between"><span>{label}</span><span className="opacity-50">{subVal}</span></div></div>
    </div>
  );
}