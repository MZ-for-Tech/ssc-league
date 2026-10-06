import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Braces,
  ChartNoAxesCombined,
  Code2,
  ExternalLink,
  Target,
  Users,
} from "lucide-react";
import CombatManual from "@/components/about/CombatManual";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mergeRewardProtocol, type RewardProtocolValue } from "@/lib/reward-protocol";

const systems = [
  {
    icon: BookOpen,
    title: "Course modules",
    description: "Move through the course one concept at a time, with lessons and practice in the same place.",
    href: "/modules",
    action: "Browse modules",
    tone: "text-cyan-300",
  },
  {
    icon: Code2,
    title: "Python playground",
    description: "Write and run code in your browser. Test an idea, inspect the output, and iterate.",
    href: "/playground",
    action: "Enter playground",
    tone: "text-emerald-300",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Progress record",
    description: "Track XP, attendance, streaks, medals, and your standing across the season.",
    href: "/profile",
    action: "View profile",
    tone: "text-amber-300",
  },
  {
    icon: Users,
    title: "Cohort channel",
    description: "Follow announcements, ask questions, and stay connected with your cohort.",
    href: "/comms",
    action: "Open comms",
    tone: "text-violet-300",
  },
];

const stages = [
  { id: "01", name: "Acquire", detail: "Take in the core idea.", icon: BookOpen },
  { id: "02", name: "Apply", detail: "Solve, code, experiment.", icon: Braces },
  { id: "03", name: "Advance", detail: "Build skill through practice.", icon: Target },
];

export default async function AboutPage() {
  const supabase = await createSupabaseServerClient();
  const { data: protocolValues } = await supabase
    .from("RewardProtocolTask")
    .select("category, reward_key, xp");
  const protocol = mergeRewardProtocol((protocolValues ?? []) as RewardProtocolValue[]);

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-8 pb-12 sm:space-y-12 sm:pb-16">
      <section className="group relative isolate min-h-[520px] overflow-hidden border border-cyan-200/20 bg-[#07121a] text-white shadow-[0_24px_80px_rgba(0,0,0,.3)] sm:min-h-[590px] lg:min-h-[660px]">
        <Image src="/images/about/python-learning-hero.png" alt="A Python coding workspace with a code editor, notebook, and data visualizations" fill priority sizes="(max-width: 1500px) 100vw, 1500px" className="-z-20 object-cover object-[58%_center] transition-transform duration-[1200ms] group-hover:scale-[1.015]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,9,14,.93)_0%,rgba(4,12,18,.79)_29%,rgba(4,12,18,.23)_62%,rgba(4,12,18,.08)_100%),linear-gradient(0deg,rgba(3,8,13,.86)_0%,transparent_34%,rgba(3,8,13,.32)_100%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[.1] [background-image:linear-gradient(rgba(130,214,220,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(130,214,220,.35)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:linear-gradient(90deg,black,transparent_72%)]" />
        <div className="absolute inset-4 border border-white/[.12] sm:inset-6" />
        <div className="absolute left-4 top-4 h-8 w-8 border-l border-t border-cyan-200/75 sm:left-6 sm:top-6" />
        <div className="absolute bottom-4 right-4 h-8 w-8 border-b border-r border-cyan-200/75 sm:bottom-6 sm:right-6" />

        <div className="relative flex min-h-[520px] flex-col justify-between px-8 pb-8 pt-7 sm:min-h-[590px] sm:px-12 sm:pb-10 sm:pt-9 lg:min-h-[660px] lg:px-16 lg:pb-12">
          <div className="relative z-10 max-w-[530px] py-14 sm:py-16 lg:py-20">
            <h1 className="max-w-[560px] text-[clamp(3.1rem,7vw,6.4rem)] font-medium leading-[.9] tracking-[-.065em] text-white [text-shadow:0_3px_30px_rgba(0,0,0,.5)]">Code. Compete.<br /><span className="text-cyan-300">Climb.</span></h1>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link href="/modules" className="group/button inline-flex min-h-11 items-center gap-3 bg-cyan-300 px-4 text-xs font-extrabold tracking-wide text-slate-950 transition hover:bg-white">ENTER THE LEAGUE <ArrowUpRight size={16} className="transition-transform group-hover/button:-translate-y-0.5 group-hover/button:translate-x-0.5" /></Link>
              <Link href="/leaderboard" className="inline-flex min-h-11 items-center gap-3 border border-white/40 bg-black/30 px-4 text-xs font-bold tracking-wide text-white backdrop-blur-sm transition hover:border-white hover:bg-black/55">VIEW STANDINGS <ArrowRight size={15} className="text-cyan-200" /></Link>
            </div>
          </div>

          <div className="flex items-end justify-between border-t border-white/25 pt-3 font-mono text-xs uppercase tracking-[.16em] text-slate-300">
            <div><span className="text-slate-500">LIVE FEED</span><span className="mx-2 text-cyan-200">●</span>Learning network established</div>
            <div className="text-right"><span className="text-slate-500">ACCESS</span><span className="ml-2 text-cyan-100">STUDENT</span></div>
          </div>
        </div>
      </section>

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

      <section className="relative">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Tools for the season ahead.</h2>
          </div>
          <span className="font-mono text-xs uppercase tracking-[.16em] text-slate-500">Select a system to access</span>
        </div>

        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
          {systems.map(({ icon: Icon, title, description, href, action, tone }) => (
            <Link key={href} href={href} className="group relative flex min-h-[245px] flex-col bg-[rgb(var(--surface-deep))] p-5 transition hover:bg-[rgb(var(--surface-node))] sm:p-6">
              <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 border-l border-b border-white/[.035]" />
              <div className="flex items-start justify-between">
                <div className={`grid h-11 w-11 place-items-center border border-current/25 bg-white/[.025] ${tone}`}><Icon size={19} /></div>
              </div>
              <h3 className="mt-7 text-lg font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
              <div className={`mt-auto flex items-center justify-between border-t border-white/[.07] pt-4 font-mono text-xs uppercase tracking-[.12em] ${tone}`}>
                <span>{action}</span><ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <CombatManual protocol={protocol} />

      <footer className="flex flex-col gap-3 border-t border-border pt-5 font-mono text-xs uppercase tracking-[.16em] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>SSC2 LEAGUE <span className="mx-2 text-slate-700">/</span> MADE BY MZ FOR TECH</span>
        <a href="https://mzfortech.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-cyan-200 transition hover:text-white">MZFORTECH.COM <ArrowUpRight size={13} /></a>
  </footer>
    </main>
  );
}
