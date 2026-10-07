"use client";

import { Download } from "lucide-react";
import type { SessionAttendanceSummary } from "@/components/admin/attendance-types";

type AttendanceSummaryTableProps = {
  summaries: SessionAttendanceSummary[];
  onExport: () => void;
};

export function AttendanceSummaryTable({ summaries, onExport }: AttendanceSummaryTableProps) {
  return (
<div className="mt-6">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground">Attendance summary</h3>
              <button type="button" onClick={onExport} disabled={!summaries.length} className="console-control inline-flex min-h-9 items-center gap-2 border border-primary/20 bg-background/55 px-3 py-2 font-bold uppercase tracking-wider text-foreground transition hover:border-primary/50 hover:bg-primary/5 disabled:opacity-40 text-sm"><Download size={14} /> Export summary</button>
            </div>
            <div className="space-y-2 md:hidden">
              {summaries.map((item) => (
                <article key={`mobile-${item.date}`} className="border border-border/70 bg-background/30 p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-border/60 pb-2">
                    <span className="font-mono font-semibold text-foreground">{item.date}</span>
                    <span className="text-xs text-muted">{item.label}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <SummaryCount label="Present" value={item.present} tone="text-emerald-300" />
                    <SummaryCount label="Tardy" value={item.tardy} tone="text-amber-300" />
                    <SummaryCount label="Excused" value={item.excused} tone="text-sky-300" />
                    <SummaryCount label="Absent" value={item.absent} tone="text-rose-300" />
                    <SummaryCount label="Vacation" value={item.vacation} tone="text-violet-300" />
                    <SummaryCount label="Blank" value={item.unmarked} tone="text-muted" />
                  </div>
                  <div className="mt-2 flex justify-between gap-3 border-t border-border/60 pt-2 text-xs">
                    <span className="text-muted">Attendance <strong className="font-mono text-foreground">{item.attendanceRate === null ? "—" : `${item.attendanceRate}%`}</strong></span>
                    <span className="text-muted">Tardy / present <strong className="font-mono text-foreground">{item.tardyPresentRatio === null ? "—" : item.tardyPresentRatio}</strong></span>
                  </div>
                </article>
              ))}
              {!summaries.length && <p className="border border-border/70 px-3 py-6 text-center text-sm text-muted">No attendance summaries yet.</p>}
            </div>
            <div className="hidden max-h-72 overflow-auto border border-border/70 md:block">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="sticky top-0 bg-background/90 font-mono uppercase tracking-wider text-muted"><tr><th className="px-3 py-2">Date / session</th><th className="px-2 py-2 text-right">P</th><th className="px-2 py-2 text-right">T</th><th className="px-2 py-2 text-right">E</th><th className="px-2 py-2 text-right">A</th><th className="px-2 py-2 text-right">V</th><th className="px-2 py-2 text-right">Blank</th><th className="px-3 py-2 text-right">Attendance</th><th className="px-3 py-2 text-right">T / P</th></tr></thead>
                <tbody className="divide-y divide-border/60">{summaries.map((item) => <tr key={item.date}><td className="px-3 py-2 text-foreground"><span className="font-mono">{item.date}</span><span className="ml-2 text-muted">{item.label}</span></td><td className="px-2 py-2 text-right text-emerald-300">{item.present}</td><td className="px-2 py-2 text-right text-amber-300">{item.tardy}</td><td className="px-2 py-2 text-right text-sky-300">{item.excused}</td><td className="px-2 py-2 text-right text-rose-300">{item.absent}</td><td className="px-2 py-2 text-right text-violet-300">{item.vacation}</td><td className="px-2 py-2 text-right text-muted">{item.unmarked}</td><td className="px-3 py-2 text-right font-mono text-foreground">{item.attendanceRate === null ? "—" : `${item.attendanceRate}%`}</td><td className="px-3 py-2 text-right font-mono text-muted">{item.tardyPresentRatio === null ? "—" : item.tardyPresentRatio}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
  );
}

function SummaryCount({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <div className="flex justify-between gap-1 border border-border/50 bg-background/25 px-2 py-1.5"><span className="text-muted">{label}</span><span className={`font-mono font-semibold ${tone}`}>{value}</span></div>;
}
