import { CalendarDays, Crosshair, FileCode2, Users } from "lucide-react";
import type { ReactNode } from "react";

const ATTENDANCE_REWARDS = [
  { item: "First 2 weeks", xp: 10 },
  { item: "Sessions 1–2", xp: 10 },
  { item: "Sessions 3–4", xp: 15 },
  { item: "Sessions 5–6", xp: 20 },
  { item: "7+ sessions", xp: 25 },
] as const;

const COURSEWORK_REWARDS = [
  { item: "Practice exam", xp: 10 },
  { item: "Assignment", xp: 20 },
  { item: "Project", xp: 40 },
  { item: "Pass midterm exam", xp: 40 },
] as const;

const PARTICIPATION_REWARDS = [
  { item: "Punctuality", xp: 10 },
  { item: "Office hours", xp: 10 },
  { item: "Group participation", xp: 15 },
  { item: "Extra effort", xp: 20 },
  { item: "Knowledge sharing", xp: 20 },
] as const;

export default function CombatManual() {
  return (
    <section className="relative isolate overflow-hidden border border-cyan-200/15 bg-[rgb(var(--surface-deep))] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_0%_0%,rgb(var(--primary)/0.12),transparent_38%),linear-gradient(110deg,transparent_55%,rgb(var(--primary)/0.035))]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgb(var(--muted)/.25)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--muted)/.25)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute left-0 top-0 h-1 w-32 bg-cyan-300 shadow-[0_0_22px_rgb(var(--primary)/.8)]" />

      <header className="border-b border-cyan-100/10 px-6 py-7 sm:px-9 sm:py-8">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Combat Manual</h2>
      </header>

      <div className="grid lg:grid-cols-12">
        <section className="relative border-b border-cyan-100/10 px-6 py-7 sm:px-9 lg:col-span-4 lg:border-b-0 lg:border-r lg:px-7">
          <div className="mb-6 flex items-center">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
              <Crosshair size={15} className="text-cyan-300" /> Quiz practice
            </div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-cyan-300">Automatic</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative overflow-hidden border border-cyan-200/15 bg-cyan-300/[0.07] p-4 sm:p-5">
              <div className="absolute -right-5 -top-7 h-20 w-20 rounded-full border border-cyan-200/10" />
              <div className="relative font-mono text-5xl font-black tracking-[-0.08em] text-cyan-200 sm:text-6xl">+2</div>
              <div className="relative mt-3 text-xs leading-5 text-slate-300">Correct answer</div>
              <div className="relative mt-5 h-1 w-2/3 bg-cyan-300 shadow-[0_0_12px_rgb(var(--primary)/.55)]" />
            </div>
            <div className="relative overflow-hidden border border-slate-700/80 bg-slate-900/70 p-4 sm:p-5">
              <div className="font-mono text-5xl font-black tracking-[-0.08em] text-white sm:text-6xl">+1</div>
              <div className="mt-3 text-xs leading-5 text-slate-400">Quiz attempt</div>
              <div className="mt-5 h-1 w-1/3 bg-slate-500" />
            </div>
          </div>
          <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">Every attempt moves your practice forward</p>
        </section>

        <section className="border-b border-cyan-100/10 px-6 py-7 sm:px-9 lg:col-span-4 lg:border-b-0 lg:border-r lg:px-7">
          <div className="mb-6 flex items-center">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
              <CalendarDays size={15} className="text-cyan-300" /> Attendance track
            </div>
          </div>
          <ol className="relative space-y-0 before:absolute before:bottom-4 before:left-[5px] before:top-4 before:w-px before:bg-gradient-to-b before:from-cyan-300/70 before:to-cyan-300/10">
            {ATTENDANCE_REWARDS.map((reward, index) => (
              <li key={reward.item} className="relative flex min-h-10 items-center justify-between gap-4 pl-6">
                <span className="absolute left-0 top-1/2 h-[11px] w-[11px] -translate-y-1/2 rounded-full border border-cyan-300/70 bg-[rgb(var(--surface-deep))] shadow-[0_0_10px_rgb(var(--primary)/.2)]" />
                <span className="text-xs text-slate-300">{reward.item}</span>
                <div className="flex min-w-[70px] items-center justify-end gap-2">
                  <span className="h-1 bg-cyan-300/60" style={{ width: `${20 + index * 9}px` }} />
                  <span className="w-7 text-right font-mono text-xs font-bold text-cyan-200">+{reward.xp}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="px-6 py-7 sm:px-9 lg:col-span-4 lg:px-7">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
              <Users size={15} className="text-cyan-300" /> Cohort contribution
            </div>
          </div>
          <RewardList icon={<FileCode2 size={13} />} title="Coursework" rewards={COURSEWORK_REWARDS} />
          <div className="my-5 border-t border-dashed border-slate-700" />
          <RewardList icon={<Users size={13} />} title="Participation" rewards={PARTICIPATION_REWARDS} />
        </section>
      </div>

    </section>
  );
}

function RewardList({ icon, title, rewards }: {
  icon: ReactNode;
  title: string;
  rewards: readonly { item: string; xp: number }[];
}) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200/80">
        {icon}{title}
      </h3>
      <ul className="space-y-1.5">
        {rewards.map((reward) => (
          <li key={reward.item} className="flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">{reward.item}</span>
            <span className="shrink-0 font-mono font-bold text-cyan-200">+{reward.xp} XP</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
