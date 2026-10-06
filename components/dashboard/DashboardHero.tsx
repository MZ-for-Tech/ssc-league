import Image from "next/image";
import { Activity, ArrowUpRight, Trophy } from "lucide-react";
import type { DashboardStudent } from "./types";

interface DashboardHeroProps {
  student: DashboardStudent;
  currentRank: number;
  totalStudents: number;
  topPercent: number;
}

export default function DashboardHero({ student, currentRank, totalStudents, topPercent }: DashboardHeroProps) {
  const displayName = student.preferred_name || student.full_name;

  return (
    <section className="instrument-panel relative isolate overflow-hidden rounded-2xl border border-border bg-surface/70 shadow-xl shadow-black/30">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_82%_0%,rgb(var(--primary)/0.12),transparent_42%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-1/3 bg-dot-grid opacity-[0.08]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="flex flex-col gap-7 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
          <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 rounded-full bg-gradient-to-br from-primary via-blue-500 to-indigo-500 p-[3px] shadow-glow-primary-subtle sm:h-20 sm:w-20">
            <Image
              unoptimized
              width={80}
              height={80}
              src={student.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`}
              alt=""
              className="h-full w-full rounded-full border-[3px] border-background bg-background object-cover"
            />
            <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 shadow-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <span className="font-mono text-xs font-bold text-foreground">L{student.current_level || 1}</span>
            </div>
          </div>

          <div className="min-w-0">
            <p className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-glow-primary-pulse" />
              Student console <span className="text-muted/60">/</span> Season one
            </p>
            <h1 className="truncate text-2xl font-black tracking-tight text-foreground sm:text-3xl">{displayName}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted">
              <span className="rounded border border-primary/20 bg-primary/5 px-2 py-0.5 font-bold tracking-wider text-primary">LEARNER</span>
              <span> ID {student.student_id}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-5 rounded-xl border border-border/80 bg-background/55 px-4 py-3 sm:justify-start sm:px-5">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">League standing</p>
            <div className="mt-0.5 flex items-baseline gap-1.5 font-mono">
              <span className="text-3xl font-black leading-none text-foreground">#{currentRank}</span>
              <span className="text-sm font-semibold text-muted">/ {totalStudents}</span>
            </div>
            <p className="mt-1 flex items-center gap-1 font-mono text-xs text-success">Top {topPercent}% <Activity size={11} /></p>
          </div>
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-warning/25 bg-warning/10 text-warning">
            <Trophy size={21} />
          </div>
          <span className="hidden h-8 w-px bg-border sm:block" />
          <div className="hidden sm:block">
            <p className="font-mono text-xs uppercase tracking-wider text-muted">Current XP</p>
            <p className="mt-1 font-mono text-lg font-bold text-foreground">{student.current_xp.toLocaleString()}</p>
          </div>
          <ArrowUpRight size={15} className="hidden text-muted sm:block" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
