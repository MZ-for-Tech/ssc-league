import { Activity, CalendarDays, Crosshair, Medal, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ProfileBadges } from "@/components/profile/profile-types";

export default function ProfileSeasonRecord({
  seasonId,
  activeSeasonId,
  bestRank,
  quizAccuracy,
  attendanceRate,
  badges,
  currentStreak,
}: {
  seasonId: string;
  activeSeasonId: string;
  bestRank: number;
  quizAccuracy: number;
  attendanceRate: number;
  badges: ProfileBadges;
  currentStreak: number;
}) {
  return (
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
  );
}

function ProfileStat({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: string }) {
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
