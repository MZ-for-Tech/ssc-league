import { CalendarDays, Crosshair, FileCode2, Users } from "lucide-react";
import type { ReactNode } from "react";
import type { RewardProtocolData } from "@/lib/reward-protocol";

export default function CombatManual({ protocol }: { protocol: RewardProtocolData }) {
  return (
    <section className="instrument-panel relative isolate overflow-hidden border border-cyan-200/20 bg-[#09151e] text-white" aria-labelledby="reward-protocol-title">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_6%_0%,rgb(var(--primary)/.13),transparent_36%),linear-gradient(115deg,transparent_55%,rgba(28,111,126,.08))]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[.11] [background-image:linear-gradient(rgba(156,211,218,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(156,211,218,.2)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="flex flex-col gap-5 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-6">
        <div>
          <h2 id="reward-protocol-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">Reward protocol</h2>
        </div>
        <div className="flex items-center gap-3 border border-amber-200/20 bg-amber-100/[.04] px-3 py-2 font-mono text-xs uppercase tracking-[.13em] text-amber-100/75">
          <span className="h-1.5 w-1.5 bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,.7)]" />
          Earn XP across the season
        </div>
      </div>

      <div className="grid lg:grid-cols-12">
        <section className="border-b border-white/10 px-5 py-5 sm:px-8 sm:py-7 lg:col-span-4 lg:border-b-0 lg:border-r lg:border-white/10 lg:px-6" aria-labelledby="quiz-rewards-title">
          <PanelHeading icon={<Crosshair size={15} />} title="In-app quizzes" id="quiz-rewards-title" />
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="relative overflow-hidden border border-cyan-200/20 bg-cyan-300/[.07] p-4 sm:p-5">
              <div className="absolute -right-6 -top-7 h-20 w-20 border border-cyan-100/10" />
              <div className="relative font-mono text-5xl font-semibold tracking-[-.08em] text-cyan-200 sm:text-6xl">+2</div>
              <div className="relative mt-2 text-xs text-slate-300">Correct answer</div>
              <div className="relative mt-5 h-0.5 w-2/3 bg-cyan-300 shadow-[0_0_12px_rgb(var(--primary)/.55)]" />
            </div>
            <div className="border border-white/10 bg-black/20 p-4 sm:p-5">
              <div className="font-mono text-5xl font-semibold tracking-[-.08em] text-slate-100 sm:text-6xl">+1</div>
              <div className="mt-2 text-xs text-slate-400">Quiz attempt</div>
              <div className="mt-5 h-0.5 w-1/3 bg-slate-500" />
            </div>
          </div>
          <p className="mt-4 font-mono text-xs uppercase tracking-[.12em] text-slate-500">Points are awarded automatically in the app</p>
        </section>

        <section className="border-b border-white/10 px-5 py-5 sm:px-8 sm:py-7 lg:col-span-4 lg:border-b-0 lg:border-r lg:border-white/10 lg:px-6" aria-labelledby="attendance-rewards-title">
          <PanelHeading icon={<CalendarDays size={15} />} title="Attendance track" id="attendance-rewards-title" />
          <ol className="relative mt-5 space-y-0 before:absolute before:bottom-3 before:left-[5px] before:top-3 before:w-px before:bg-gradient-to-b before:from-cyan-300/70 before:to-cyan-300/10">
            {protocol.attendance.rewards.map((reward, index) => (
              <li key={reward.item} className="relative flex min-h-9 items-center justify-between gap-4 pl-6">
                <span className="absolute left-0 top-1/2 h-[11px] w-[11px] -translate-y-1/2 border border-cyan-300/70 bg-[#09151e] shadow-[0_0_10px_rgb(var(--primary)/.2)]" />
                <span className="text-xs text-slate-300">{reward.item}</span>
                <div className="flex min-w-[70px] items-center justify-end gap-2">
                  <span className="h-1 bg-cyan-300/60" style={{ width: `${20 + index * 9}px` }} />
                  <span className="w-7 text-right font-mono text-xs font-bold text-cyan-200">+{reward.xp}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="px-5 py-5 sm:px-8 sm:py-7 lg:col-span-4 lg:px-6" aria-labelledby="contribution-rewards-title">
          <PanelHeading icon={<Users size={15} />} title="Cohort contribution" id="contribution-rewards-title" />
          <div className="mt-5">
            <RewardList icon={<FileCode2 size={13} />} title="Coursework" rewards={protocol.coursework.rewards} />
            <div className="my-4 border-t border-dashed border-white/10" />
            <RewardList icon={<Users size={13} />} title="Participation" rewards={protocol.participation.rewards} />
          </div>
        </section>
      </div>

    </section>
  );
}

function PanelHeading({ icon, title, id }: { icon: ReactNode; title: string; id: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h3 id={id} className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-slate-200"><span className="text-cyan-200">{icon}</span>{title}</h3>
    </div>
  );
}

function RewardList({ icon, title, rewards }: {
  icon: ReactNode;
  title: string;
  rewards: readonly { item: string; xp: number }[];
}) {
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[.15em] text-cyan-100/75">{icon}{title}</h4>
      <ul className="space-y-1.5">
        {rewards.map((reward) => (
          <li key={reward.item} className="flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">{reward.item}</span>
            <span className="shrink-0 font-mono text-xs font-bold text-amber-200">+{reward.xp} XP</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
