import { Activity, Award, Cpu, Crown, Crosshair, ShieldCheck, Star, Terminal, Zap } from "lucide-react";
import Badge from "@/components/profile/Badge";
import type { ProfileBadges } from "@/components/profile/profile-types";

export default function ProfileServiceMedals({ badges }: { badges: ProfileBadges }) {
  return (
    <section className="instrument-panel rounded-2xl border border-border bg-surface/45 app-panel-padding">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <h2 className="console-section-heading"><Award size={15} className="text-amber-300" /> Service medals</h2>
        <div className="rounded-lg border border-border bg-background/40 px-3 py-2 font-mono text-xs font-bold tabular-nums text-foreground">
          {Object.values(badges).filter(Boolean).length}<span className="text-muted"> / 8</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Badge icon={Terminal} name="Neuro-Link" description="System connection established" unlocked={badges.neuro_link} color="text-cyan-200" />
        <Badge icon={Zap} name="Signal Lock" description="3-session attendance streak" unlocked={badges.signal_lock} color="text-yellow-300" />
        <Badge icon={Crosshair} name="Sniper Grade" description=">80% quiz accuracy" unlocked={badges.sniper_grade} color="text-rose-300" />
        <Badge icon={ShieldCheck} name="Grid Reliability" description=">90% attendance rate" unlocked={badges.grid_reliability} color="text-emerald-300" />
        <Badge icon={Star} name="Senior Operative" description="Reach level 5" unlocked={badges.senior_operative} color="text-violet-300" />
        <Badge icon={Crown} name="High Command" description="Reach the global top 10" unlocked={badges.high_command} color="text-amber-300" />
        <Badge icon={Activity} name="Unbroken Stream" description="7-session attendance streak" unlocked={badges.unbroken_stream} color="text-cyan-300" />
        <Badge icon={Cpu} name="Data Warlord" description="Accumulate 500 XP" unlocked={badges.data_warlord} color="text-orange-300" />
      </div>
    </section>
  );
}
