import React from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { 
  Trophy, Target, Zap, Activity, 
  ArrowUpRight, Calendar, CheckCircle2, Terminal, LayoutDashboard, Radio 
} from "lucide-react";
import clsx from "clsx";
import RivalsWidget from "@/components/dashboard/RivalsWidget";
import WelcomeScreen from "@/components/WelcomeScreen";
import SkeletonCard from "@/components/SkeletonCard";

export const revalidate = 0;
export const dynamic = "force-dynamic";

interface Topic {
  id: string | number;
  name: string;
  week_number: number;
  description: string;
  Question: { id: string }[];
}

export default async function DashboardPage() {
  // 1. Setup Supabase
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) => {
              cookieStore.set(name, value, options);
            });
          } catch {}
        },
      },
    }
  );

  // --- AUTH LOGIC ---
  let user: any;
  try {
    const resp = await supabase.auth.getUser();
    user = resp?.data?.user;
  } catch (e) {
    return <div className="p-8 text-red-400">Access Denied.</div>;
  }
  if (!user) return <div className="p-8 text-red-400">Access Denied.</div>;

  // Check for Impersonation
  const impersonateId = cookieStore.get("impersonate_id")?.value;
  let targetId = user.id; 
  let lookupByAuthId = true; 

  if (impersonateId) {
      const { data: adminCheck } = await supabase.from("Admin").select("id").eq("auth_id", user.id).single();
      if (adminCheck) {
          targetId = impersonateId; 
          lookupByAuthId = false; 
      }
  }

  // 3. Fetch Student Profile
  let studentQuery = supabase.from("Student").select("*, WeeklyRankHistory(week_number, rank)");
  if (lookupByAuthId) {
      studentQuery = studentQuery.eq("auth_id", targetId);
  } else {
      studentQuery = studentQuery.eq("id", targetId);
  }
  const { data: student } = await studentQuery.single();

  if (!student) return <div className="p-8 text-yellow-400">Profile initializing...</div>;

  // --- 4. CALCULATE RANKS & RIVALS ---
  const getRankForXp = async (xp: number) => {
    const { count } = await supabase.from("Student").select("id", { count: "exact", head: true }).gt("current_xp", xp);
    return (count || 0) + 1;
  };

  const currentRank = await getRankForXp(student.current_xp);
  
  const { data: rivalsAbove } = await supabase.from("Student")
    .select("id, full_name, preferred_name, current_xp, avatar_url, WeeklyRankHistory(week_number, rank)")
    .gt("current_xp", student.current_xp).order("current_xp", { ascending: true }).limit(1);

  const { data: rivalsBelow } = await supabase.from("Student")
    .select("id, full_name, preferred_name, current_xp, avatar_url, WeeklyRankHistory(week_number, rank)")
    .lt("current_xp", student.current_xp).order("current_xp", { ascending: false }).limit(1);

  const allHistory = [
      ...(student.WeeklyRankHistory || []),
      ...(rivalsAbove?.[0]?.WeeklyRankHistory || []),
      ...(rivalsBelow?.[0]?.WeeklyRankHistory || [])
  ];
  
  let globalMaxWeek = 0;
  allHistory.forEach((h: any) => { if (h.week_number > globalMaxWeek) globalMaxWeek = h.week_number; });
  const comparisonWeek = globalMaxWeek > 1 ? globalMaxWeek - 1 : 1;

  const formattedRivals = [];
  const formatRival = async (p: any, isMe: boolean, liveRank: number) => {
      const histEntry = p.WeeklyRankHistory?.find((h: any) => h.week_number === comparisonWeek);
      const prevRank = histEntry ? histEntry.rank : liveRank;
      return {
          id: p.id, rank: liveRank, name: p.preferred_name || p.full_name, xp: p.current_xp,
          avatar_url: p.avatar_url, trend: prevRank - liveRank, isMe: isMe
      };
  };

  if (rivalsAbove && rivalsAbove.length > 0) formattedRivals.push(await formatRival(rivalsAbove[0], false, await getRankForXp(rivalsAbove[0].current_xp)));
  formattedRivals.push(await formatRival(student, true, currentRank));
  if (rivalsBelow && rivalsBelow.length > 0) formattedRivals.push(await formatRival(rivalsBelow[0], false, await getRankForXp(rivalsBelow[0].current_xp)));

  // --- 5. CALCULATE STATS & NEXT MISSION ---
  const { data: allAnswers } = await supabase.from("StudentAnswer").select("is_correct, question_id").eq("student_id", student.id);
  const totalAnswers = allAnswers?.length || 0;
  const correctAnswers = allAnswers?.filter((a: any) => a.is_correct).length || 0;
  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  const { data: rawTopics } = await supabase.from("Topic").select("id, name, week_number, description, Question(id)").order("week_number", { ascending: true });
  const topics = rawTopics as unknown as Topic[];
  const attemptedQuestionIds = new Set(allAnswers?.map((a: any) => a.question_id));

  let nextMission: Topic | null = null;
  let completedModulesCount = 0;

  topics?.forEach((topic) => {
     const questions = topic.Question || [];
     const totalQs = questions.length;
     const attemptedCount = questions.filter((q) => attemptedQuestionIds.has(q.id)).length;
     const isComplete = totalQs > 0 && attemptedCount === totalQs;
     if (isComplete) completedModulesCount++;
     if (!isComplete && !nextMission) nextMission = topic;
  });

  // 6. Fetch Recent Activity
  const { data: recentActivity } = await supabase
    .from("StudentAnswer").select(`is_correct, attempted_at, Question ( text, points, Topic (name) )`)
    .eq("student_id", student.id).order("attempted_at", { ascending: false }).limit(3);
  
  const { count: totalStudents } = await supabase.from("Student").select("id", { count: "exact", head: true });
  const topPercent = totalStudents ? Math.round((currentRank / totalStudents) * 100) : 100;
  const firstName = student.preferred_name?.split(" ")[0] || student.full_name.split(" ")[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4">
      
      <WelcomeScreen name={firstName.toUpperCase()} />

      {/* --- 1. HERO HUD: THE COMMAND DECK --- */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 shadow-2xl">
         {/* Background FX */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />

         {/* Label Bar */}
         <div className="flex justify-between items-start mb-6">
             <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-cyan-500 uppercase tracking-widest bg-cyan-950/30 px-2 py-1 rounded border border-cyan-900/50">
                <LayoutDashboard size={10} /> Command Center
             </div>
             <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/50 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> System Online
             </div>
         </div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Identity */}
            <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="relative shrink-0 group">
                    <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 shadow-[0_0_30px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] transition-all duration-500">
                        <img 
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
                        <p className="text-slate-500 text-xs font-mono">
                            ID: {student.student_id}
                        </p>
                    </div>
                </div>
            </div>

            {/* Rank Card */}
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
                 <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                     <Trophy size={24} />
                 </div>
            </div>
         </div>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
             {student ? (
               <>
                 <StatsCard 
                    label="Total XP" 
                    value={student.current_xp?.toLocaleString() || "0"} 
                    icon={<Zap size={18} className="text-yellow-400" />} 
                 />
                 <StatsCard 
                    label="Missions" 
                    value={`${completedModulesCount}/${topics?.length || 12}`} 
                    icon={<CheckCircle2 size={18} className="text-cyan-400" />} 
                 />
                 <StatsCard 
                    label="Accuracy" 
                    value={`${accuracy}%`} 
                    icon={<Target size={18} className="text-red-400" />} 
                 />
                 <StatsCard 
                    label="Attendance Streak" 
                    value={`${student.current_streak || 0} Sections`} 
                    icon={<Activity size={18} className="text-emerald-400" />} 
                 />
               </>
             ) : (
               <>
                 <SkeletonCard />
                 <SkeletonCard />
                 <SkeletonCard />
                 <SkeletonCard />
               </>
             )}
          </div>

          {/* Rivalry Watch */}
          <RivalsWidget 
              rivals={formattedRivals} 
              myId={student.id}
          />

          {/* Activity Feed */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Radio size={100} />
             </div>
             <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                <Terminal size={14} /> Recent Intel
             </h3>
             <div className="space-y-4 relative z-10">
                {recentActivity ? (
                  recentActivity && recentActivity.length > 0 ? (
                      recentActivity.map((act: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-4 p-3 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-slate-700 hover:bg-slate-800/60 transition-all group">
                              <div className={clsx(
                                  "mt-1.5 h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] transition-transform group-hover:scale-125",
                                  act.is_correct ? "bg-emerald-500 text-emerald-500" : "bg-red-500 text-red-500"
                              )} />
                              <div className="flex-1">
                                  <div className="text-sm text-slate-200 font-medium">
                                      {act.is_correct ? "Mission Success" : "Mission Failed"} <span className="text-slate-500 mx-1">•</span> <span className="text-cyan-400 font-bold">{act.Question?.Topic?.name}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2 font-mono">
                                      <span>{new Date(act.attempted_at).toLocaleDateString()}</span>
                                      {act.is_correct && <span className="bg-emerald-500/10 border border-emerald-500/20 px-1.5 rounded text-emerald-400">+{act.Question?.points} XP</span>}
                                  </div>
                              </div>
                          </div>
                      ))
                  ) : (
                      <div className="text-sm text-slate-500 italic text-center py-4">No recent activity logs found.</div>
                  )
                ) : (
                  <SkeletonCard />
                )}
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1/3) */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 h-fit sticky top-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full group-hover:bg-cyan-500/20 transition-colors" />
                
                <div className="relative z-10 flex flex-col h-full">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Calendar size={14} /> Next Objective
                    </h3>

                    {nextMission ? (
                        <>
                            <div className="flex-1 mb-8">
                                <div className="text-5xl font-black text-white mb-2 tracking-tighter opacity-90">M{(nextMission as Topic).week_number.toString().padStart(2, '0')}</div>
                                <div className="text-lg text-cyan-400 font-medium mb-4 leading-snug font-mono border-l-2 border-cyan-500 pl-3">
                                    {(nextMission as Topic).name}
                                </div>
                                <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-xl mb-6 backdrop-blur-sm">
                                    <p className="text-xs text-cyan-200/70 leading-relaxed font-mono">
                                        &gt; {(nextMission as Topic).description || "Priority execution required."}
                                    </p>
                                </div>
                            </div>

                            <Link href={`/modules/${(nextMission as Topic).id}`} className="mt-auto">
                                <button className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] active:scale-[0.98]">
                                    ENGAGE MISSION <ArrowUpRight size={18} />
                                </button>
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
            </div>
        </div>

      </div>
    </div>
  );
}

function StatsCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 hover:bg-slate-800/50 transition-all group h-24 relative overflow-hidden">
            <div className="mb-2 transition-transform group-hover:scale-110 origin-left relative z-10">{icon}</div>
            <div className="relative z-10">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">{label}</div>
                <div className="text-lg font-bold text-white truncate font-mono">{value}</div>
            </div>
            <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors" />
        </div>
    )
}