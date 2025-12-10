import React from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Mail, Award, Zap, Shield, Target, Percent, Activity, IdCard, BadgeCheck, User, Terminal, Crown, Star, Crosshair, Cpu, ShieldCheck } from "lucide-react";
import ActivityHeatmap from "@/components/profile/ActivityHeatmap";
import Badge from "@/components/profile/Badge"; 
import ActivityFeed from "@/components/profile/ActivityFeed";
import RulesCard from "@/components/profile/RulesCard";
import EditProfileModal from "@/components/profile/EditProfileModal";

export const revalidate = 0;
export const dynamic = "force-dynamic";

// LEVEL DEFINITIONS
const LEVEL_RANGES = [
  { level: 1, min: 0, max: 50 },
  { level: 2, min: 50, max: 100 },
  { level: 3, min: 100, max: 150 },
  { level: 4, min: 150, max: 200 },
  { level: 5, min: 200, max: 500 }, 
  { level: 6, min: 500, max: 1000 },
];

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="text-red-500 p-10">Access Denied.</div>;

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

  let studentQuery = supabase.from("Student").select("*, WeeklyRankHistory(rank)");
  if (lookupByAuthId) studentQuery = studentQuery.eq("auth_id", targetId);
  else studentQuery = studentQuery.eq("id", targetId);

  const { data: student, error } = await studentQuery.single();
  if (error || !student) return <div className="p-10 text-center text-yellow-500">Dossier Not Found</div>;

  const [
    { data: transactions },
    { data: quizAnswers },
    { data: rankHistory },
    { data: attendanceRecords }
  ] = await Promise.all([
    supabase.from("XPTransaction").select("*").eq("student_id", student.id),
    supabase.from("StudentAnswer").select("id, attempted_at, is_correct, Question(text, points, Topic(name))").eq("student_id", student.id),
    supabase.from("WeeklyRankHistory").select("rank").eq("student_id", student.id),
    supabase.from("AttendanceRecord").select("date, status").eq("student_id", student.id)
  ]);

  // --- DATA PROCESSING ---
  const heatmapData: { [key: string]: number } = {};
  const addActivity = (dateStr: string | Date, weight: number = 1) => {
    if (!dateStr) return;
    const d = new Date(dateStr);
    const key = d.toISOString().split("T")[0];
    heatmapData[key] = (heatmapData[key] || 0) + weight;
  };

  attendanceRecords?.forEach((rec: any) => {
      if (rec.status === 'PRESENT' || rec.status === 'TARDY') addActivity(rec.date, 3);
  });
  quizAnswers?.forEach((q: any) => addActivity(q.attempted_at, 1));
  transactions?.forEach((t: any) => addActivity(t.created_at, 1));

  const unifiedLog = [
    ...(transactions || []).map((t: any) => ({
      id: t.id,
      type: 'XP Award', 
      title: t.action_type === 'MANUAL_ENTRY' ? 'Manual Adjustment' : t.action_type,
      desc: t.description,
      xp: t.amount,
      date: new Date(t.created_at),
      status: 'success'
    })),
    ...(quizAnswers || []).map((q: any) => ({
      id: q.id,
      type: 'quiz',
      title: q.Question?.text || "Unknown Challenge",
      desc: q.Question?.Topic?.name || "General Module",
      xp: q.is_correct ? 2 : 1,
      date: new Date(q.attempted_at),
      status: q.is_correct ? 'success' : 'failure'
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  // --- CALCULATE METRICS ---
  const currentXP = student.current_xp || 0;
  const currentLevel = student.current_level || 1;
  const levelDef = LEVEL_RANGES.find(l => l.level === currentLevel) || LEVEL_RANGES[0];
  const nextLevelDef = LEVEL_RANGES.find(l => l.level === (levelDef.level + 1)) || { min: 1000 };
  const xpInLevel = currentXP - levelDef.min;
  const xpNeededForLevel = nextLevelDef.min - levelDef.min;
  const progressPercent = Math.min(100, Math.max(0, (xpInLevel / xpNeededForLevel) * 100));

  const totalSessions = attendanceRecords?.length || 0;
  // const presentCount = attendanceRecords?.filter((a: any) => ['PRESENT', 'TARDY'].includes(a.status)).length || 0;
  const attendanceRate = totalSessions > 0 
    ? Math.round((attendanceRecords?.filter((a: any) => ['PRESENT', 'TARDY'].includes(a.status)).length || 0) / totalSessions * 100) 
    : 0;
  
  const bestRank = rankHistory && rankHistory.length > 0 ? Math.min(...rankHistory.map((h: any) => h.rank)) : 0;
  const currentStreak = student.current_streak || 0;

  // Quiz Stats
  const totalQuizzes = quizAnswers?.length || 0;
  const correctQuizzes = quizAnswers?.filter((a: any) => a.is_correct).length || 0;
  const quizAccuracy = totalQuizzes > 0 ? Math.round((correctQuizzes / totalQuizzes) * 100) : 0;

  // --- ACHIEVEMENT LOGIC (TACTICAL THEME) ---
  const badges = {
      neuro_link: true, // Always unlocked (Joined)
      signal_lock: currentStreak >= 3,
      sniper_grade: totalQuizzes >= 5 && quizAccuracy >= 80,
      grid_reliability: totalSessions >= 3 && attendanceRate >= 90,
      senior_operative: currentLevel >= 5,
      high_command: bestRank > 0 && bestRank <= 10,
      unbroken_stream: currentStreak >= 7,
      data_warlord: currentXP >= 500
  };

  const displayName = student.preferred_name || student.full_name.split(' ')[0];
  const studentForEdit = {
    id: student.id,
    full_name: student.full_name,
    preferred_name: student.preferred_name || "",
    student_id: student.student_id,
    email: student.email || "",
    group_id: student.group_id || "G1",
    avatar_url: student.avatar_url
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-800 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <User className="text-cyan-400" size={32} />
                Agent Dossier
            </h1>
            <p className="text-slate-400 text-sm mt-1">Identity, stats, and performance metrics.</p>
        </div>
        <div className="flex items-center gap-4">
             {impersonateId ? (
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold uppercase tracking-wider animate-pulse">
                    <Shield size={14} /> Impersonating
                 </div>
             ) : (
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <Activity size={14} /> Active Status
                 </div>
             )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COL: Identity Card */}
        <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-50" />
                
                <div className="relative flex flex-col items-center text-center z-10">
                    <div className="relative mb-4">
                        <div className="w-32 h-32 rounded-full p-1 border-2 border-slate-800 bg-slate-950 shadow-xl">
                            <img src={student.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${displayName}`} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-slate-950 rounded-full p-1 border border-slate-800 shadow-sm">
                            <BadgeCheck className="w-6 h-6 text-emerald-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{displayName}</h2>
                    <p className="text-slate-500 text-xs uppercase tracking-widest mt-1 mb-6 border-b border-slate-800 pb-4 w-full text-center">{student.full_name}</p>
                    
                    {/* XP Progress Bar */}
                    <div className="w-full mb-6">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mb-1">
                            <span>Lvl {levelDef.level}</span>
                            <span className="text-cyan-400">{Math.round(progressPercent)}%</span>
                            <span>Lvl {levelDef.level + 1}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-800 relative">
                            <div style={{ width: `${progressPercent}%` }} className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-1000" />
                        </div>
                        <div className="text-center text-[10px] text-slate-500 mt-1 font-mono">{xpInLevel} / {xpNeededForLevel} XP to rank up</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full">
                        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                            <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Level</div>
                            <div className="text-xl font-bold text-cyan-400">{levelDef.level}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                            <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Streak</div>
                            <div className="text-xl font-bold text-yellow-500 flex items-center justify-center gap-1"><Zap size={14} fill="currentColor" /> {currentStreak}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                            <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Attendance</div>
                            <div className={`text-xl font-bold flex items-center justify-center gap-1 ${attendanceRate >= 80 ? "text-emerald-500" : "text-rose-500"}`}><Percent size={14} /> {attendanceRate}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                            <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Best Rank</div>
                            <div className="text-xl font-bold text-purple-400 flex items-center justify-center gap-1"><Target size={14} /> {bestRank > 0 ? `#${bestRank}` : "-"}</div>
                        </div>
                    </div>
                    <EditProfileModal student={studentForEdit} />
                </div>

                <div className="mt-8 space-y-3 relative z-10">
                    <div className="flex items-center text-xs text-slate-500 py-2 border-t border-slate-800"><Mail size={14} className="mr-3 text-slate-600" /><span className="opacity-80">E-Mail: <span className="text-white font-bold">{student.email || "No email linked"}</span></span></div>
                    <div className="flex items-center text-xs text-slate-500 py-2 border-t border-slate-800"><IdCard size={14} className="mr-3 text-slate-600" /><span className="opacity-80">ID: <span className="text-white font-bold">{student.student_id}</span></span></div>
                    <div className="flex items-center text-xs text-slate-500 py-2 border-t border-slate-800"><Shield size={14} className="mr-3 text-slate-600" /><span className="opacity-80">Group: <span className="text-white font-bold">{student.group_id || "G1"}</span></span></div>
                </div>
            </div>
        </div>

        {/* RIGHT COL: Main Content - RESTRUCTURED */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* 1. ACTIVITY FEED (Full Width Top) */}
            <div className="h-[400px]">
                <ActivityFeed activities={unifiedLog} />
            </div>
            
            {/* 2. BOTTOM SPLIT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* ACHIEVEMENTS (Wide) */}
                <div className="md:col-span-2 p-6 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold uppercase text-slate-400 flex items-center gap-2">
                            <Award size={16} /> Service Medals
                        </h3>
                        <div className="text-[10px] bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-500 font-mono">
                            {Object.values(badges).filter(Boolean).length}/8
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* New Tactical Achievements */}
                        <Badge icon={Terminal} name="Neuro-Link" description="System connection established" unlocked={badges.neuro_link} color="text-slate-200" />
                        <Badge icon={Zap} name="Signal Lock" description="3-session attendance streak" unlocked={badges.signal_lock} color="text-yellow-500" />
                        <Badge icon={Crosshair} name="Sniper Grade" description=">80% Mission Accuracy" unlocked={badges.sniper_grade} color="text-rose-500" />
                        <Badge icon={ShieldCheck} name="Grid Reliability" description=">90% Attendance Rate" unlocked={badges.grid_reliability} color="text-emerald-500" />
                        <Badge icon={Star} name="Senior Operative" description="Promoted to Level 5" unlocked={badges.senior_operative} color="text-purple-400" />
                        <Badge icon={Crown} name="High Command" description="Reached Global Top 10" unlocked={badges.high_command} color="text-yellow-400" />
                        <Badge icon={Activity} name="Unbroken Stream" description="7-session mega streak" unlocked={badges.unbroken_stream} color="text-cyan-400" />
                        <Badge icon={Cpu} name="Data Warlord" description="Accumulated 500+ XP" unlocked={badges.data_warlord} color="text-orange-500" />
                    </div>
                </div>

                {/* HEATMAP & RULES (Narrow Stack) */}
                <div className="flex flex-col gap-6">
                    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold uppercase text-slate-400 flex items-center gap-2">
                                <Activity size={16} /> Frequency
                            </h3>
                        </div>
                        <div className="flex justify-center">
                            <ActivityHeatmap activityData={heatmapData} startDate="2025-09-27" />
                        </div>
                    </div>
                    <RulesCard />
                </div>

            </div>
        </div>

      </div>
    </div>
  );
}