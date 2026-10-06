import { ArrowRight, BookOpen, Braces, Target, ExternalLink, ArrowUpRight } from "lucide-react";

const stages = [
  { id: "01", name: "Acquire", detail: "Take in the core idea.", icon: BookOpen },
  { id: "02", name: "Apply", detail: "Solve, code, experiment.", icon: Braces },
  { id: "03", name: "Advance", detail: "Build skill through practice.", icon: Target },
];

export default function AboutLearningMethod() {
  return (
      <section className="grid gap-6 lg:grid-cols-[1.45fr_.75fr]">
        <div className="instrument-panel relative overflow-hidden border border-border bg-surface/55 p-5 sm:p-7 lg:p-8">
          <h2 className="mt-4 max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Build knowledge by putting it to work.</h2>
          <div className="relative mt-8 grid gap-3 sm:grid-cols-3 sm:gap-0">
            <div className="absolute left-[13%] right-[13%] top-5 hidden h-px bg-gradient-to-r from-cyan-300/20 via-cyan-300/75 to-cyan-300/20 sm:block" />
            {stages.map(({ id, name, detail, icon: Icon }, index) => (
              <article key={id} className="relative flex items-start gap-3 border border-border/70 bg-background/35 p-4 sm:mx-2 sm:flex-col sm:border-0 sm:bg-transparent sm:px-3 sm:py-0 first:sm:ml-0 last:sm:mr-0">
                <div className="relative z-10 grid h-10 w-10 shrink-0 place-items-center border border-cyan-200/40 bg-[rgb(var(--surface-deep))] text-cyan-200 shadow-[0_0_18px_rgb(var(--primary)/.12)]">
                  <Icon size={17} />
                  <span className="absolute -right-1.5 -top-1.5 font-mono text-xs text-cyan-200">{id}</span>
                </div>
                <div className="sm:mt-4">
                  <h3 className="mt-1 text-sm font-bold text-foreground">{name}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted">{detail}</p>
                </div>
                {index < stages.length - 1 && <ArrowRight size={14} className="absolute right-3 top-1/2 hidden -translate-y-1/2 text-cyan-200/50 sm:block" />}
              </article>
            ))}
          </div>
        </div>

        <a href="https://tn-data.github.io/PFwithPython/" target="_blank" rel="noopener noreferrer" className="group relative flex min-h-[220px] flex-col justify-between overflow-hidden border border-amber-200/20 bg-[linear-gradient(130deg,rgba(37,37,25,.72),rgba(16,25,34,.92)_58%)] p-5 transition hover:border-amber-200/50 sm:p-7">
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rotate-45 border border-amber-100/[.08]" />
          <div className="relative flex justify-end">
            <ExternalLink size={16} className="text-amber-200/60 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-200" />
          </div>
          <div className="relative mt-8">
            <div className="font-mono text-xs uppercase tracking-[.18em] text-amber-100/55">COURSE SOURCE // PYTHON</div>
            <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Programming Fundamentals</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">Course guide for programming foundations, Python, and data science.</p>
          </div>
          <div className="relative mt-5 flex items-center justify-between border-t border-amber-100/15 pt-3 font-mono text-xs uppercase tracking-[.15em] text-amber-100/75">
            <span>Open external source</span><ArrowUpRight size={15} />
          </div>
        </a>
      </section>
  );
}
