import React from "react";
import { Mail, Award, Zap, Target, Activity, IdCard, BadgeCheck, Terminal, Crown, Star, Crosshair, Cpu, ShieldCheck, CalendarDays, Medal, Trophy } from "lucide-react";
import ActivityHeatmap from "@/components/profile/ActivityHeatmap";
import Badge from "@/components/profile/Badge"; 
import ActivityFeed from "@/components/profile/ActivityFeed";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getImpersonatedStudentId } from "@/lib/auth/impersonation";
import { redirect } from "next/navigation";
import { getActiveSeasonId, getSelectedSeasonId } from "@/lib/seasons";
import Image from "next/image";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type AttendanceRecord = { date: string; status: string };
type QuizAnswer = {
  id: string; attempted_at: string; is_correct: boolean;
  Question: Array<{ text: string; points: number | null; Topic: Array<{ name: string }> }>;
};
type XPTransaction = { id: string; action_type: string; description: string | null; amount: number; created_at: string };
type RankRecord = { rank: number };

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
  const supabase = await createSupabaseServerClient();
  const activeSeasonId = await getActiveSeasonId(supabase);
  const impersonateId = await getImpersonatedStudentId();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="text-red-500 p-10">Access Denied.</div>;

  const { data: adminProfile } = await supabase.from("Admin").select("id").eq("auth_id", user.id).maybeSingle();
  if (adminProfile && !impersonateId) redirect("/admin");
  const seasonId = await getSelectedSeasonId(supabase, activeSeasonId, Boolean(adminProfile));

  let targetId = user.id; 
  let lookupByAuthId = true; 

  if (impersonateId) {
      const { data: adminCheck } = await supabase.from("Admin").select("id").eq("auth_id", user.id).single();
      if (adminCheck) {
          targetId = impersonateId; 
          lookupByAuthId = false; 
      }
  }

  let studentQuery = supabase.from("Student").select("*, WeeklyRankHistory!WeeklyRankHistory_season_student_fkey(rank)");
  if (lookupByAuthId) studentQuery = studentQuery.eq("auth_id", targetId).eq("season_id", seasonId);
  else studentQuery = studentQuery.eq("id", targetId).eq("season_id", seasonId);

  const { data: student, error } = await studentQuery.single();
  if (error || !student) return <div className="p-10 text-center text-yellow-500">Dossier Not Found</div>;

  const [
    { data: season },
    { data: transactions },
    { data: quizAnswers },
    { data: rankHistory },
    { data: attendanceRecords }
  ] = await Promise.all([
    supabase.from("Season").select("name, starts_on").eq("id", seasonId).maybeSingle(),
    supabase.from("XPTransaction").select("*").eq("student_id", student.id).eq("season_id", seasonId),
    supabase.from("StudentAnswer").select("id, attempted_at, is_correct, Question(text, points, Topic(name))").eq("student_id", student.id).eq("season_id", seasonId),
    supabase.from("WeeklyRankHistory").select("rank").eq("student_id", student.id).eq("season_id", seasonId),
    supabase.from("AttendanceRecord").select("date, status").eq("student_id", student.id).eq("season_id", seasonId)
  ]);

  // --- DATA PROCESSING ---
  const heatmapData: { [key: string]: number } = {};
  const addActivity = (dateStr: string | Date, weight: number = 1) => {
    if (!dateStr) return;
    const d = new Date(dateStr);
    const key = d.toISOString().split("T")[0];
    heatmapData[key] = (heatmapData[key] || 0) + weight;
  };

  (attendanceRecords as AttendanceRecord[] | null)?.forEach((rec) => {
      if (rec.status === 'PRESENT' || rec.status === 'TARDY') addActivity(rec.date, 3);
  });
  (quizAnswers as QuizAnswer[] | null)?.forEach((q) => addActivity(q.attempted_at, 1));
  (transactions as XPTransaction[] | null)?.forEach((t) => addActivity(t.created_at, 1));

  const earliestRecordedActivity = Object.keys(heatmapData).sort()[0];
  // Season start dates are optional in the database; use the first real season event as a fallback.
  const heatmapStartDate = season?.starts_on || earliestRecordedActivity || new Date().toISOString().slice(0, 10);

  const unifiedLog = [
    ...((transactions || []) as XPTransaction[]).map((t) => ({
      id: t.id,
      type: 'reward' as const,
      title: t.action_type === 'MANUAL_ENTRY' ? 'Manual adjustment' : t.action_type.replaceAll('_', ' ').toLowerCase(),
      desc: t.description || "",
      xp: t.amount,
      date: new Date(t.created_at),
    })),
    ...((quizAnswers || []) as QuizAnswer[]).map((q) => ({
      id: q.id,
      type: 'practice' as const,
      title: q.is_correct ? "Question solved" : "Question attempted",
      desc: q.Question[0]?.Topic[0]?.name || "General Module",
      xp: q.is_correct ? 2 : 1,
      date: new Date(q.attempted_at),
      isCorrect: q.is_correct,
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

  const countedAttendanceRecords = ((attendanceRecords as AttendanceRecord[] | null) || []).filter((record) => record.status !== "VACATION");
  const totalSessions = countedAttendanceRecords.length;
  const attendanceRate = totalSessions > 0 
    ? Math.round((countedAttendanceRecords.filter((a) => ['PRESENT', 'TARDY'].includes(a.status)).length || 0) / totalSessions * 100)
    : 0;
  
  const bestRank = rankHistory && rankHistory.length > 0 ? Math.min(...(rankHistory as RankRecord[]).map((h) => h.rank)) : 0;
  const currentStreak = student.current_streak || 0;

  // Quiz Stats
  const totalQuizzes = quizAnswers?.length || 0;
  const correctQuizzes = (quizAnswers as QuizAnswer[] | null)?.filter((a) => a.is_correct).length || 0;
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
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <section className="instrument-panel relative isolate overflow-hidden rounded-[1.75rem] border border-cyan-200/15 bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] p-4 shadow-2xl shadow-black/15 sm:p-5">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-[0.08] [mask-image:linear-gradient(90deg,black,transparent)]" />
        <svg aria-hidden="true" viewBox="0 0 480 360" className="pointer-events-none absolute -right-20 -top-28 -z-10 h-[420px] w-[560px] opacity-20">
          <path d="M240 12 468 348H12L240 12Z" fill="none" stroke="rgb(var(--primary))" strokeWidth="1.5" />
          <path d="m240 86 177 262H63L240 86Z" fill="none" stroke="rgb(var(--cyan-200))" strokeOpacity=".55" />
          <path d="M240 12v336M12 348h456M126 180h228" stroke="rgb(var(--primary))" strokeOpacity=".42" strokeDasharray="4 9" />
        </svg>
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
            <div className="relative shrink-0">
              <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-cyan-300 via-primary to-indigo-500 p-[3px] shadow-[0_0_30px_rgb(var(--primary)/0.18)] sm:h-28 sm:w-28">
                <div aria-hidden="true" className="absolute -inset-2 rounded-full border border-dashed border-cyan-200/20" />
                <Image unoptimized width={112} height={112} src={student.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${displayName}`} alt={`${displayName}'s avatar`} className="h-full w-full rounded-full border-[3px] border-[rgb(var(--surface-deep))] bg-[rgb(var(--surface-deep))] object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 flex items-center gap-1.5 rounded-full border border-cyan-200/20 bg-[rgb(var(--surface-deep))] px-2.5 py-1 shadow-lg">
                <BadgeCheck size={14} className="text-emerald-300" />
                <span className="font-mono text-xs font-bold text-foreground">LV {levelDef.level}</span>
              </div>
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2 font-mono">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Student dossier</span>
                <span className="text-xs text-muted/50">/</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted"><CalendarDays size={11} /> {season?.name || "League season"}</span>
                {impersonateId && <span className="rounded-full border border-warning/20 bg-warning/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-warning">Admin preview</span>}
              </div>
              <h1 className="truncate text-3xl font-black tracking-tight text-foreground sm:text-4xl">{displayName}</h1>
              <p className="mt-0.5 text-sm text-muted">{student.full_name}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-slate-300/80">
                <span className="inline-flex items-center gap-1.5"><IdCard size={13} className="text-primary" /> {student.student_id}</span>
                <span className="inline-flex items-center gap-1.5"><Target size={13} className="text-primary" /> Group {student.group_id || "G1"}</span>
                {student.email && <span className="inline-flex items-center gap-1.5"><Mail size={13} className="text-primary" /> {student.email}</span>}
              </div>
            </div>
          </div>

          <div className="instrument-panel w-full max-w-sm rounded-2xl border border-cyan-100/10 bg-[rgb(var(--surface-deep))]/65 p-3 backdrop-blur-sm sm:p-4 xl:w-[300px] xl:shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Level {levelDef.level}</p>
                <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-foreground"><span className="text-primary">{currentXP.toLocaleString()}</span><span className="ml-2 text-sm font-semibold text-muted">XP</span></p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary"><Zap size={20} /></div>
            </div>
            <div className="mt-3 flex items-center justify-between font-mono text-xs font-bold text-muted">
              <span>LV {levelDef.level}</span><span className="text-cyan-200">LV {Math.min(levelDef.level + 1, 6)}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full border border-cyan-100/10 bg-slate-950/70">
              <div style={{ width: `${progressPercent}%` }} className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-primary to-indigo-400 shadow-[0_0_14px_rgb(var(--primary)/0.4)] transition-[width] duration-700" />
            </div>
            <p className="mt-1.5 text-right font-mono text-xs tabular-nums text-muted">{xpInLevel.toLocaleString()} / {xpNeededForLevel.toLocaleString()} XP</p>
            <div className="mt-3 flex justify-end border-t border-border/70 pt-2">
              {seasonId === activeSeasonId && !impersonateId
                ? <EditProfileModal student={studentForEdit} />
                : <p className="text-xs font-semibold text-amber-300">{seasonId !== activeSeasonId ? "Archived record · read only" : "Admin preview · read only"}</p>}
            </div>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.8fr)]">
        <section className="instrument-panel rounded-2xl border border-border bg-surface/45 p-4 sm:p-5">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <h2 className="console-section-heading"><Activity size={15} className="text-primary" /> Season activity</h2>
          </div>
          <ActivityHeatmap activityData={heatmapData} startDate={heatmapStartDate} />
        </section>

        <aside className="instrument-panel rounded-2xl border border-border bg-surface/45 p-4 sm:p-5" aria-label="Season record">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="console-section-heading"><Activity size={15} className="text-primary" /> Season record</h2>
            <span className="font-mono text-xs uppercase tracking-wider text-muted">{seasonId === activeSeasonId ? "Current" : "Archived"}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <ProfileStat icon={Trophy} label="Best standing" value={bestRank > 0 ? `#${bestRank}` : "—"} tone="text-amber-300" />
            <ProfileStat icon={Crosshair} label="Quiz accuracy" value={`${quizAccuracy}%`} tone="text-rose-300" />
            <ProfileStat icon={CalendarDays} label="Attendance" value={`${attendanceRate}%`} tone="text-emerald-300" />
            <ProfileStat icon={Medal} label="Medals earned" value={`${Object.values(badges).filter(Boolean).length}/8`} tone="text-violet-300" />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3 font-mono text-xs uppercase tracking-wider text-muted">
            <span>Attendance streak</span>
            <span className="font-bold text-primary">{currentStreak} sections</span>
          </div>
        </aside>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(17rem,0.75fr)_minmax(0,1.35fr)]">
        <ActivityFeed activities={unifiedLog} />

        <section className="instrument-panel rounded-2xl border border-border bg-surface/45 p-4 sm:p-5">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="console-section-heading"><Award size={15} className="text-amber-300" /> Service medals</h2>
          </div>
          <div className="rounded-lg border border-border bg-background/40 px-3 py-2 font-mono text-xs font-bold tabular-nums text-foreground">{Object.values(badges).filter(Boolean).length}<span className="text-muted"> / 8</span></div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Badge icon={Terminal} name="Neuro-Link" description="System connection established" unlocked={badges.neuro_link} color="text-cyan-200" />
          <Badge icon={Zap} name="Signal Lock" description="3-session attendance streak" unlocked={badges.signal_lock} color="text-yellow-300" />
          <Badge icon={Crosshair} name="Sniper Grade" description=">80% quiz accuracy" unlocked={badges.sniper_grade} color="text-rose-300" />
          <Badge icon={ShieldCheck} name="Grid Reliability" description=">90% attendance rate" unlocked={badges.grid_reliability} color="text-emerald-300" />
          <Badge icon={Star} name="Senior Operative" description="Reach level 5" unlocked={badges.senior_operative} color="text-violet-300" />
          <Badge icon={Crown} name="High Command" description="Reach the global top 10" unlocked={badges.high_command} color="text-amber-300" />
          <Badge icon={Activity} name="Unbroken Stream" description="7-session attendance streak" unlocked={badges.unbroken_stream} color="text-cyan-300" />
          <Badge icon={Cpu} name="Data Warlord" description="Accumulate 500 XP" unlocked={badges.data_warlord} color="text-orange-300" />
        </div>
        </section>
      </div>
    </div>
  );
}

function ProfileStat({ icon: Icon, label, value, tone }: { icon: typeof Trophy; label: string; value: string; tone: string }) {
  return (
    <div className="instrument-panel flex items-center gap-3 rounded-2xl border border-border bg-surface/55 p-3 sm:gap-4 sm:p-3.5">
      <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-current/15 bg-background/35 ${tone}`}><Icon size={17} /></div>
      <div className="min-w-0">
        <p className="font-mono text-lg font-bold tabular-nums text-foreground sm:text-xl">{value}</p>
        <p className="mt-0.5 truncate text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      </div>
    </div>
  );
}
