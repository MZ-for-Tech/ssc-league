import { Check, X } from "lucide-react";
import DashboardEmptyChart from "@/components/admin/DashboardEmptyChart";
import { adminPanelClass } from "@/components/admin/admin-dashboard-styles";
import type { AdminDashboardViewProps } from "@/components/admin/admin-dashboard-types";

export default function RecentActivity({ items }: { items: AdminDashboardViewProps["recentActivity"] }) {
  return (
    <section aria-labelledby="recent-activity-heading" className={`${adminPanelClass} app-panel-padding`}>
      <div className="mb-5">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">One latest attempt per student</p>
        <h2 id="recent-activity-heading" className="mt-1 text-lg font-semibold text-foreground">Recent student activity</h2>
      </div>
      {items.length ? (
        <ul className="divide-y divide-slate-800">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${item.isCorrect ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>
                {item.isCorrect ? <Check size={15} /> : <X size={15} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{item.studentName}</p>
                <p className="truncate text-xs text-muted">{item.topicName} · {item.isCorrect ? "Correct" : "Incorrect"}</p>
              </div>
              <time className="shrink-0 text-xs text-slate-500" dateTime={item.attemptedAt}>
                {new Date(item.attemptedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </time>
            </li>
          ))}
        </ul>
      ) : <DashboardEmptyChart message="No student activity to show yet." />}
    </section>
  );
}
