import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  ChartNoAxesCombined,
  Code2,
  ExternalLink,
  MessageSquare,
  Trophy,
  Users,
} from "lucide-react";
import CombatManual from "@/components/about/CombatManual";

const leagueTools = [
  {
    icon: BookOpen,
    title: "Course modules",
    description: "Follow the SSC2 curriculum by topic, with lesson material and practice questions together.",
  },
  {
    icon: Code2,
    title: "Python playground",
    description: "Try ideas in code, experiment with data, and learn by making things work.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Progress tracking",
    description: "See your XP, attendance, streaks, activity, and league standing over the season.",
  },
  {
    icon: MessageSquare,
    title: "Cohort comms",
    description: "Keep up with announcements and stay connected with the rest of the league.",
  },
];

const learningLoop = [
  { number: "01", title: "Explore", text: "Choose a module and get the core idea." },
  { number: "02", title: "Experiment", text: "Practise with questions and code." },
  { number: "03", title: "Improve", text: "Return, build consistency, and watch your progress grow." },
];

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-20 pb-20 lg:space-y-28">
      <section className="relative isolate grid min-h-[560px] overflow-hidden rounded-[2rem] border border-cyan-300/10 bg-[rgb(var(--surface-hero))] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_45%,rgb(var(--primary)/0.16),transparent_43%),linear-gradient(120deg,rgb(var(--surface-shade)/0.2),rgb(var(--primary-dim)/0.05))]" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12] [background-image:linear-gradient(rgb(var(--muted)/.2)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--muted)/.2)_1px,transparent_1px)] [background-size:36px_36px] [mask-image:linear-gradient(90deg,black,transparent)]" />

        <div className="relative z-10 flex flex-col justify-center px-7 py-14 sm:px-12 lg:px-16 lg:py-20">
          <h1 className="max-w-2xl text-5xl font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-6xl xl:text-7xl">
            Learn the material.
            <span className="mt-2 block text-cyan-300">Make your mark.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            SSC2 League turns an introductory data science course into a place to learn, experiment, and grow together. Follow the curriculum, put ideas into practice, and see your progress take shape across the season.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link href="/modules" className="group inline-flex items-center gap-3 border-b border-cyan-300 pb-2 text-sm font-bold text-cyan-200 transition hover:text-white">
              Start with a module <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/leaderboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white">
              See the standings <Trophy size={15} className="text-cyan-300" />
            </Link>
          </div>
        </div>

        <LeagueSignal />
        <div className="pointer-events-none absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent lg:hidden" />
      </section>

      <section className="relative overflow-hidden border-y border-cyan-200/15 bg-surface/50 px-6 py-7 sm:px-9 sm:py-8">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-[linear-gradient(110deg,transparent,rgb(var(--primary)/0.05))]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-5">
            <div className="grid h-12 w-12 shrink-0 place-items-center border border-cyan-300/30 bg-cyan-300/[0.08] text-cyan-300">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Programming Fundamentals</h2>
              <p className="mt-1 text-xs font-mono uppercase tracking-[0.12em] text-cyan-200/70">Intro to Programming with Python</p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">A course guide covering programming foundations, Python fundamentals, and data science.</p>
            </div>
          </div>
          <a
            href="https://tn-data.github.io/PFwithPython/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex shrink-0 items-center gap-3 border border-cyan-300/30 px-4 py-3 text-sm font-bold text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-300/10 hover:text-white"
          >
            Open learning source <ExternalLink size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </section>

      <section>
        <div className="mb-10">
          <div>
            <SectionLabel>How learning moves</SectionLabel>
            <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">A loop that takes you from idea to insight.</h2>
          </div>
        </div>

        <div className="relative grid gap-7 md:grid-cols-3 md:gap-0">
          <div className="absolute left-[16%] right-[16%] top-5 hidden h-px bg-gradient-to-r from-cyan-400/20 via-cyan-300/70 to-cyan-400/20 md:block" />
          {learningLoop.map((step, index) => (
            <article key={step.number} className="relative flex gap-5 px-0 md:px-8 first:md:pl-0 last:md:pr-0">
              <div className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-cyan-300/50 bg-background font-mono text-xs font-bold text-cyan-300 shadow-[0_0_24px_rgb(var(--primary)/0.12)]">
                {step.number}
              </div>
              <div className="pt-1">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Stage {index + 1}</div>
                <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-muted">{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-8">
          <SectionLabel>Built for the course</SectionLabel>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Everything you need to keep moving.</h2>
        </div>

        <div className="grid border-y border-border sm:grid-cols-2 xl:grid-cols-4">
          {leagueTools.map(({ icon: Icon, title, description }, index) => (
            <article key={title} className={`group relative py-6 sm:px-6 sm:py-8 xl:px-7 ${index % 2 === 0 ? "sm:border-r" : ""} ${index < 2 ? "sm:border-b xl:border-b-0" : ""} ${index > 0 ? "xl:border-l" : ""} border-border`}>
              <div className="mb-8 flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center border border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-300 transition group-hover:border-cyan-300/50 group-hover:bg-cyan-300/10">
                  <Icon size={18} />
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </article>
          ))}
        </div>
        <Link href="/comms" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-white">
          Open cohort comms <ArrowRight size={15} />
        </Link>
      </section>

      <CombatManual />

      <footer className="flex flex-col gap-3 border-t border-border pt-6 text-xs font-mono uppercase tracking-wider text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Made by MZ for Tech</span>
        <a href="https://mzfortech.com" target="_blank" rel="noopener noreferrer" className="text-cyan-300 transition hover:text-white">mzfortech.com</a>
      </footer>
    </main>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">
      <span className="h-1.5 w-1.5 bg-cyan-300 shadow-[0_0_10px_rgb(var(--primary)/.8)]" />
      {children}
    </div>
  );
}

function LeagueSignal() {
  return (
    <div className="relative flex min-h-[390px] items-center justify-center overflow-hidden px-6 pb-10 pt-4 lg:min-h-0 lg:px-0 lg:py-12" aria-label="Illustration of the league learning path">
      <div className="absolute left-1/2 top-1/2 aspect-square w-[min(88vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/[0.08]" />
      <div className="absolute left-1/2 top-1/2 aspect-square w-[min(68vw,370px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan-200/[0.13]" />
      <div className="absolute left-1/2 top-1/2 aspect-square w-[min(47vw,250px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/[0.08]" />
      <div className="absolute left-1/2 top-1/2 h-[min(88vw,480px)] w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-cyan-200/10 to-transparent" />
      <div className="absolute left-1/2 top-1/2 h-px w-[min(88vw,480px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-200/10 to-transparent" />

      <div className="relative h-[370px] w-full max-w-[500px] sm:h-[430px]">
        <svg viewBox="0 0 500 430" className="absolute inset-0 h-full w-full overflow-visible" fill="none" aria-hidden="true">
          <path d="M95 104 C142 125 165 173 213 202" stroke="url(#pathA)" strokeWidth="1.5" strokeDasharray="5 7" />
          <path d="M408 92 C354 118 334 169 287 200" stroke="url(#pathB)" strokeWidth="1.5" strokeDasharray="5 7" />
          <path d="M250 350 C248 305 250 271 250 238" stroke="url(#pathC)" strokeWidth="1.5" strokeDasharray="5 7" />
          <circle cx="155" cy="151" r="3" fill="rgb(var(--cyan-300))"><animate attributeName="opacity" values=".2;1;.2" dur="2.8s" repeatCount="indefinite" /></circle>
          <circle cx="344" cy="146" r="3" fill="rgb(var(--cyan-300))"><animate attributeName="opacity" values="1;.2;1" dur="3.2s" repeatCount="indefinite" /></circle>
          <defs>
            <linearGradient id="pathA" x1="95" y1="104" x2="213" y2="202" gradientUnits="userSpaceOnUse"><stop stopColor="rgb(var(--primary))" stopOpacity=".08" /><stop offset="1" stopColor="rgb(var(--cyan-300))" stopOpacity=".8" /></linearGradient>
            <linearGradient id="pathB" x1="408" y1="92" x2="287" y2="200" gradientUnits="userSpaceOnUse"><stop stopColor="rgb(var(--primary))" stopOpacity=".08" /><stop offset="1" stopColor="rgb(var(--cyan-300))" stopOpacity=".8" /></linearGradient>
            <linearGradient id="pathC" x1="250" y1="350" x2="250" y2="238" gradientUnits="userSpaceOnUse"><stop stopColor="rgb(var(--primary))" stopOpacity=".08" /><stop offset="1" stopColor="rgb(var(--cyan-300))" stopOpacity=".8" /></linearGradient>
          </defs>
        </svg>

        <div className="absolute left-1/2 top-1/2 z-10 grid h-36 w-36 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-200/30 bg-[rgb(var(--surface-hero))]/85 shadow-[0_0_70px_rgb(var(--primary)/0.15)] sm:h-40 sm:w-40">
          <div className="absolute inset-2 rounded-full border border-dashed border-cyan-200/15" />
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">The league</div>
            <div className="mt-1 text-3xl font-black tracking-[-0.08em] text-white">SSC<span className="text-cyan-300">2</span></div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.24em] text-cyan-200/70">Learn together</div>
          </div>
        </div>

        <SignalNode className="left-0 top-8 sm:left-4 sm:top-10" icon={<BookOpen size={15} />} label="Curriculum" />
        <SignalNode className="right-0 top-6 sm:right-2 sm:top-8" icon={<Code2 size={15} />} label="Practice" />
        <SignalNode className="bottom-0 left-1/2 -translate-x-1/2" icon={<Users size={15} />} label="Cohort" />

        <div className="absolute bottom-16 right-0 hidden border-l border-cyan-300/40 pl-3 font-mono text-[9px] uppercase leading-5 tracking-widest text-slate-500 sm:block">
          <div>Course signal</div>
          <div className="text-cyan-200/80">Connected</div>
        </div>
        <div className="absolute left-0 top-1/2 hidden -translate-y-1/2 font-mono text-[9px] uppercase leading-5 tracking-[0.18em] text-slate-600 sm:block">
          <div>Explore</div><div className="ml-3">Build</div><div className="ml-6">Advance</div>
        </div>
      </div>
    </div>
  );
}

function SignalNode({ className, icon, label }: { className: string; icon: ReactNode; label: string }) {
  return (
    <div className={`absolute z-20 min-w-[132px] border border-cyan-200/15 bg-[rgb(var(--surface-node))]/95 p-3 shadow-xl backdrop-blur-sm ${className}`}>
      <div className="flex items-center">
        <span className="text-cyan-300">{icon}</span>
      </div>
      <div className="mt-2 text-xs font-semibold text-slate-200">{label}</div>
      <div className="mt-2 h-px w-full bg-gradient-to-r from-cyan-300/50 to-transparent" />
    </div>
  );
}
