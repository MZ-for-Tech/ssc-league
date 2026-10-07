import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Code2, Layers3 } from "lucide-react";
import type { DashboardTopic } from "./types";

interface NextObjectiveProps {
  topic: DashboardTopic | null;
  completedModulesCount: number;
  totalModules: number;
}

export default function NextObjective({ topic, completedModulesCount, totalModules }: NextObjectiveProps) {
  const progress = totalModules > 0 ? Math.min(100, Math.round((completedModulesCount / totalModules) * 100)) : 0;

  return (
    <section className="instrument-panel relative isolate overflow-hidden rounded-2xl border border-primary/20 bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] shadow-lg shadow-black/30">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-[0.1]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="grid gap-6 app-panel-padding md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
        <div className="min-w-0">
          <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            <BookOpen size={14} /> Your next step
          </p>

          {topic ? (
            <>
              <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-muted">
                <span className="rounded border border-primary/20 bg-primary/10 px-2 py-1 text-primary">Lesson {String(topic.week_number).padStart(2, "0")}</span>
                <span>Course sequence</span>
              </div>
              <h2 className="app-section-title max-w-2xl font-black tracking-tight text-foreground">{topic.name}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{topic.description || "Pick up where your course begins and build your skills one lesson at a time."}</p>
              <Link
                href={`/modules/${topic.id}`}
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-extrabold text-background shadow-glow-primary-subtle transition hover:-translate-y-0.5 hover:bg-primary-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Open lesson <ArrowRight size={16} />
              </Link>
            </>
          ) : totalModules === 0 ? (
            <>
              <h2 className="app-section-title font-black tracking-tight text-foreground">Your course map is being prepared</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">Course lessons will appear here as soon as they are available.</p>
              <Link href="/modules" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary">
                Browse modules <ArrowRight size={15} />
              </Link>
            </>
          ) : completedModulesCount >= totalModules ? (
            <>
              <h2 className="app-section-title font-black tracking-tight text-foreground">Course map complete</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">You have completed every available lesson. Revisit a module to keep practising.</p>
              <Link href="/modules" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary">
                Review modules <ArrowRight size={15} />
              </Link>
            </>
          ) : (
            <>
              <h2 className="app-section-title font-black tracking-tight text-foreground">Choose what to practise next</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">Your course map is ready. Open the modules page to pick a lesson.</p>
              <Link href="/modules" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-background transition hover:bg-primary-dim">
                Browse lessons <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>

        <div className="rounded-xl border border-border/80 bg-background/45 app-panel-padding">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground"><Layers3 size={15} className="text-primary" /> Course progress</div>
            <Code2 size={16} className="text-muted" />
          </div>
          <div className="flex items-end justify-between gap-3">
            <p className="font-mono text-3xl font-black leading-none text-foreground">{completedModulesCount}<span className="text-lg text-muted">/{totalModules || "—"}</span></p>
            <p className="font-mono text-xs text-primary">{totalModules ? `${progress}%` : "READY"}</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-light/40">
            <div className="h-full rounded-full bg-primary shadow-glow-primary-subtle transition-[width]" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 font-mono text-xs uppercase tracking-wider text-muted">
            <span>{topic ? "Next lesson" : totalModules ? "All lessons reviewed" : "Course status"}</span>
            <span>{topic ? "Ready" : totalModules ? <CheckCircle2 size={13} className="text-success" /> : "Pending"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
