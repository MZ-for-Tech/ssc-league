import { Download, ExternalLink, FileText, Zap } from "lucide-react";
import { COURSE_MATERIALS } from "@/lib/course-materials";

type CourseInformationSidebarProps = {
  completedMissions: number;
  totalMissions: number;
  totalXP: number;
};

export default function CourseInformationSidebar({ completedMissions, totalMissions, totalXP }: CourseInformationSidebarProps) {
  return (
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-6" aria-label="Course information">
          <section className="instrument-panel border border-border bg-surface/50 p-4 sm:p-5" aria-label="Campaign progress">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-muted">Campaign status</h2>
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            </div>
            <div className="flex items-end justify-between gap-3">
              <p className="font-mono text-3xl font-bold leading-none tabular-nums text-foreground">{completedMissions}<span className="ml-1 text-base text-muted">/ {totalMissions}</span></p>
              <p className="pb-0.5 text-xs uppercase tracking-wider text-muted">Lessons complete</p>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden bg-surface-light/45">
              <div className="h-full bg-primary transition-[width] duration-700" style={{ width: `${totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0}%` }} />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">Quiz XP</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-sm font-bold tabular-nums text-warning"><Zap size={14} /> {totalXP}</span>
            </div>
          </section>

          <a
            href="https://tn-data.github.io/PFwithPython/"
            target="_blank"
            rel="noopener noreferrer"
            className="instrument-panel group relative block overflow-hidden border border-amber-200/20 bg-[linear-gradient(130deg,rgba(37,37,25,.72),rgba(16,25,34,.92)_58%)] p-4 transition hover:border-amber-200/50 sm:p-5"
          >
            <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rotate-45 border border-amber-100/[.08]" />
            <div className="relative">
              <ExternalLink size={14} className="absolute right-0 top-0 text-amber-200/60 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-200" />
              <p className="pr-7 font-mono text-xs uppercase tracking-[.18em] text-amber-100/55">COURSE SOURCE // PYTHON</p>
              <p className="mt-2 text-lg font-semibold text-white">Programming Fundamentals</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">Course guide for programming foundations, Python, and data science.</p>
              <div className="mt-3 flex items-center justify-between border-t border-amber-100/15 pt-3 font-mono text-xs uppercase tracking-[.15em] text-amber-100/75 transition group-hover:text-amber-50">Open external source <span aria-hidden="true">↗</span></div>
            </div>
          </a>

          <section className="instrument-panel border border-border bg-surface/50 p-4 sm:p-5" aria-label="Course reference files">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-muted">Reference files</h2>
              <span className="font-mono text-xs text-muted">{COURSE_MATERIALS.length} files</span>
            </div>
            <div className="max-h-[360px] space-y-1 overflow-y-auto pr-1">
              {COURSE_MATERIALS.length > 0 ? COURSE_MATERIALS.map((resource) => (
                <a
                  key={resource.url}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-w-0 items-center gap-2.5 border border-transparent px-2 py-2 transition hover:border-border/70 hover:bg-background/35"
                >
                  <FileText size={14} className="shrink-0 text-primary/70 group-hover:text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-foreground/85 group-hover:text-foreground">{resource.title}</span>
                    <span className="mt-0.5 block font-mono text-xs uppercase tracking-wider text-muted">Module {resource.moduleNumber} · {resource.type}</span>
                  </span>
                  <Download size={12} className="shrink-0 text-muted opacity-0 transition group-hover:opacity-100" />
                </a>
              )) : <p className="py-3 text-xs text-muted">No course files are available.</p>}
            </div>
          </section>
        </aside>
  );
}
