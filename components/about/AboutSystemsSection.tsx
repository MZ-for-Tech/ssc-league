import Link from "next/link";
import { ArrowUpRight, BookOpen, Code2, ChartNoAxesCombined, Users } from "lucide-react";

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

export default function AboutSystemsSection() {
  return (
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
  );
}
