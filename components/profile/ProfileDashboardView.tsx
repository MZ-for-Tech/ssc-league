import { Activity, BadgeCheck, CalendarDays, IdCard, Mail, Target, Zap } from "lucide-react";
import Image from "next/image";
import ActivityHeatmap from "@/components/profile/ActivityHeatmap";
import ActivityFeed, { type ProfileActivityItem } from "@/components/profile/ActivityFeed";
import EditProfileModal from "@/components/profile/EditProfileModal";
import ProfileSeasonRecord from "@/components/profile/ProfileSeasonRecord";
import ProfileServiceMedals from "@/components/profile/ProfileServiceMedals";
import type { ProfileBadges } from "@/components/profile/profile-types";

type StudentProfile = {
  id: string;
  full_name: string;
  preferred_name: string;
  student_id: string;
  email: string;
  group_id: string;
  avatar_url: string | null;
};

type ProfileDashboardViewProps = {
  student: Pick<StudentProfile, "avatar_url" | "student_id" | "group_id" | "email" | "full_name">;
  studentForEdit: StudentProfile;
  season: { name: string | null } | null;
  impersonateId: string | null;
  seasonId: string;
  activeSeasonId: string;
  displayName: string;
  levelDef: { level: number };
  currentXP: number;
  progressPercent: number;
  xpInLevel: number;
  xpNeededForLevel: number;
  heatmapData: Record<string, number>;
  heatmapStartDate: string;
  bestRank: number;
  quizAccuracy: number;
  attendanceRate: number;
  badges: ProfileBadges;
  currentStreak: number;
  unifiedLog: ProfileActivityItem[];
};

export default function ProfileDashboardView({
  student,
  studentForEdit,
  season,
  impersonateId,
  seasonId,
  activeSeasonId,
  displayName,
  levelDef,
  currentXP,
  progressPercent,
  xpInLevel,
  xpNeededForLevel,
  heatmapData,
  heatmapStartDate,
  bestRank,
  quizAccuracy,
  attendanceRate,
  badges,
  currentStreak,
  unifiedLog,
}: ProfileDashboardViewProps) {
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

        <ProfileSeasonRecord
          seasonId={seasonId}
          activeSeasonId={activeSeasonId}
          bestRank={bestRank}
          quizAccuracy={quizAccuracy}
          attendanceRate={attendanceRate}
          badges={badges}
          currentStreak={currentStreak}
        />
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(17rem,0.75fr)_minmax(0,1.35fr)]">
        <ActivityFeed activities={unifiedLog} />

        <ProfileServiceMedals badges={badges} />
      </div>
    </div>
  );
}
