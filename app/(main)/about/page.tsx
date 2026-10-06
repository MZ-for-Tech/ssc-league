import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import CombatManual from "@/components/about/CombatManual";
import AboutLearningMethod from "@/components/about/AboutLearningMethod";
import AboutSystemsSection from "@/components/about/AboutSystemsSection";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mergeRewardProtocol, type RewardProtocolValue } from "@/lib/reward-protocol";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "About",
  "Discover the SSC2 League learning arena: programming lessons, Python practice, data science, and student progress.",
);



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

      <AboutLearningMethod />

      <AboutSystemsSection />

      <CombatManual protocol={protocol} />

      <footer className="flex flex-col gap-3 border-t border-border pt-5 font-mono text-xs uppercase tracking-[.16em] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>SSC2 LEAGUE <span className="mx-2 text-slate-700">/</span> MADE BY MZ FOR TECH</span>
        <a href="https://mzfortech.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-cyan-200 transition hover:text-white">MZFORTECH.COM <ArrowUpRight size={13} /></a>
  </footer>
    </main>
  );
}
