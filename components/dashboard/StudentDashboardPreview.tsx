import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpen, CheckCircle2, Crosshair, Target, Trophy, Users } from "lucide-react";

const metrics = [
  { label: "Total XP", icon: Crosshair },
  { label: "Missions", icon: CheckCircle2 },
  { label: "Accuracy", icon: Target },
  { label: "Attendance streak", icon: Trophy },
];

export default function StudentDashboardPreview() {
  return (
    <div className="app-page-stack w-full pb-16">
      <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Student view · Preview mode</p>
          <p className="mt-1 text-sm text-muted">No student is selected, so personal progress and activity are hidden.</p>
        </div>
        <Link href="/admin" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/40">
          <ArrowLeft size={16} /> Admin dashboard
        </Link>
      </div>

      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface/60 app-panel-padding">
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div className="flex items-center gap-5">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-4 border-primary/30 bg-primary/10 text-primary sm:h-24 sm:w-24"><Users size={34} /></div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Field operative</p>
              <h1 className="app-page-title font-black tracking-tight text-foreground">Student dashboard</h1>
              <p className="mt-1 text-sm text-muted">Personal rank and stats appear here for enrolled students.</p>
            </div>
          </div>
          <div className="min-w-56 rounded-2xl border border-border bg-background/50 p-5 text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Global standing</p>
            <p className="mt-2 text-3xl font-black text-muted/70">— <span className="text-sm font-semibold">/ —</span></p>
            <p className="mt-1 text-xs text-muted">Available with a student account</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4" aria-label="Student stats preview">
        {metrics.map(({ label, icon: Icon }) => (
          <article key={label} className="flex min-h-28 items-start justify-between gap-3 rounded-2xl border border-border bg-surface/50 app-panel-padding">
            <div><p className="text-sm font-medium text-muted">{label}</p><p className="mt-2 text-2xl font-bold text-muted/70">—</p><p className="mt-1 text-xs text-muted">Student data hidden in preview</p></div>
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-2.5 text-primary"><Icon size={18} /></div>
          </article>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-border bg-surface/50 p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-widest text-muted">Competition</p><h2 className="mt-1 text-lg font-bold text-foreground">Direct rivals</h2></div>
              <Users size={18} className="text-primary" />
            </div>
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">Rival standings appear when a student profile is active.</p>
          </section>
          <section className="rounded-2xl border border-border bg-surface/50 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Recent intel</p>
            <h2 className="mt-1 text-lg font-bold text-foreground">Activity</h2>
            <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">Question attempts are private to each student.</p>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-surface/50 p-6">
          <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted"><BookOpen size={15} /> Next objective</div>
          <h2 className="text-xl font-bold text-foreground">Explore the curriculum</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Lessons and written practice are available to browse without choosing a student.</p>
          <Link href="/modules" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-background transition hover:bg-primary-dim">
            Open modules <ArrowUpRight size={17} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
