import { LockKeyhole, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BadgeProps {
  icon: LucideIcon;
  name: string;
  description: string;
  unlocked: boolean;
  color?: string;
}

export default function Badge({ icon: Icon, name, description, unlocked, color = "text-primary" }: BadgeProps) {
  return (
    <article className={`instrument-panel relative min-h-[112px] overflow-hidden rounded-xl border p-3.5 transition-colors ${
      unlocked
        ? "border-amber-200/15 bg-[linear-gradient(145deg,rgb(var(--surface-node)),rgb(var(--surface-deep)))] hover:border-amber-200/30"
        : "border-border/80 bg-background/25"
    }`}>
      {unlocked && <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-amber-300/5 blur-2xl" />}
      <div className="relative flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border ${unlocked ? `border-current/20 bg-background/50 ${color}` : "border-border bg-surface/50 text-muted/70"}`}>
            <Icon size={19} strokeWidth={1.8} />
          </div>
          <h3 className={`min-w-0 whitespace-normal break-words text-sm font-bold leading-tight ${unlocked ? "text-foreground" : "text-muted"}`}>{name}</h3>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-bold uppercase tracking-wider ${
          unlocked ? "border-amber-200/15 bg-amber-200/5 text-amber-200" : "border-border bg-background/35 text-muted"
        }`}>
          {unlocked ? <Sparkles size={11} /> : <LockKeyhole size={10} />}
          {unlocked ? "Earned" : "Locked"}
        </span>
      </div>
      <p className="relative mt-3 pl-[52px] text-xs leading-5 text-muted">{description}</p>
    </article>
  );
}
