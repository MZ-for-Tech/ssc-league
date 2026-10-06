import type { LucideIcon } from "lucide-react";
import { adminPanelClass } from "@/components/admin/admin-dashboard-styles";

export default function MetricCard({ label, value, detail, icon: Icon, accent }: {
  label: string;
  value: number | string;
  detail: string;
  icon: LucideIcon;
  accent: "cyan" | "violet" | "amber" | "rose";
}) {
  const accents = {
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    violet: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    rose: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  };
  return (
    <article className={`${adminPanelClass} flex min-w-0 items-start justify-between gap-2 p-3 transition-colors hover:border-primary/30 sm:gap-3 sm:p-5`}>
      <div className="min-w-0">
        <p className="break-words text-xs font-medium text-muted sm:text-sm">{label}</p>
        <p className="mt-2 font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">{typeof value === "number" ? value.toLocaleString() : value}</p>
        <p className="mt-1 line-clamp-2 break-words text-[11px] text-muted/75 sm:text-xs">{detail}</p>
      </div>
      <div className={`shrink-0 rounded-lg border p-2 shadow-[0_0_24px_rgb(var(--primary)/0.06)] sm:rounded-xl sm:p-2.5 ${accents[accent]}`}><Icon size={16} className="sm:h-[18px] sm:w-[18px]" /></div>
    </article>
  );
}
