"use client";

import React, { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { markGroupAttendance } from "@/app/actions/admin-actions";
import { formatAttendanceDate } from "@/lib/attendance-date";
import clsx from "clsx";
import OperationsCardHeader from "@/components/admin/OperationsCardHeader";

const attendanceStatuses = [
  { value: "PRESENT", label: "Present", code: "P", color: "border-emerald-400/25 bg-emerald-400/[.07] text-emerald-300 hover:border-emerald-300/50" },
  { value: "TARDY", label: "Tardy", code: "T", color: "border-amber-400/25 bg-amber-400/[.07] text-amber-300 hover:border-amber-300/50" },
  { value: "EXCUSED", label: "Excused", code: "E", color: "border-sky-400/25 bg-sky-400/[.07] text-sky-300 hover:border-sky-300/50" },
  { value: "ABSENT", label: "Absent", code: "A", color: "border-rose-400/25 bg-rose-400/[.07] text-rose-300 hover:border-rose-300/50" },
  { value: "VACATION", label: "Vacation", code: "V", color: "border-violet-400/25 bg-violet-400/[.07] text-violet-300 hover:border-violet-300/50" },
] as const;

export default function AttendanceWidget() {
  const [group, setGroup] = useState("G1");
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleMark = async (status: typeof attendanceStatuses[number]["value"], label: string) => {
    if (!confirm(`Mark entire ${group} as ${label} for today?`)) return;

    setLoading(true);
    const res = await markGroupAttendance(group, status);
    setLoading(false);

    if (res.success) {
        setLastAction(`${label} logged for ${res.count} agents in ${group}.`);
        setTimeout(() => setLastAction(null), 4000);
    } else {
        alert(res.message);
    }
  };

  return (
    <section className="instrument-panel relative isolate h-full overflow-hidden border border-primary/20 bg-[linear-gradient(145deg,rgba(13,31,49,.94),rgba(12,22,40,.94))] p-5 sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_0%,rgb(var(--primary)/0.1),transparent_48%)]" />
        <OperationsCardHeader
            id="quick-muster-title"
            title="Quick muster"
            headingLevel="h3"
            icon={<ClipboardCheck className="text-primary" size={18} />}
            actions={<span className="border border-primary/15 bg-background/40 px-2 py-1 font-mono text-xs text-muted">
                {formatAttendanceDate()}
            </span>}
        />

        <div className="relative z-10 space-y-5">
            <div>
                <label className="mb-2 block font-mono font-bold uppercase tracking-wider text-muted text-xs">Select sector</label>
                <input
                    value={group}
                    onChange={(event) => setGroup(event.target.value.toUpperCase().trim())}
                    placeholder="e.g. G1"
                    maxLength={32}
                    aria-label="Group identifier"
                    className={clsx("console-control min-h-10 w-full border border-border bg-background/60 px-3 py-2 font-mono  font-bold text-foreground outline-none transition focus:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30")}
                />
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-border/70 pt-5">
                {attendanceStatuses.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleMark(status.value, status.label)}
                    disabled={loading || !group}
                    className={clsx("console-control flex min-h-14 flex-col items-center justify-center gap-1 border px-2 py-2 transition disabled:opacity-50", status.color)}
                  >
                    <span className="font-mono font-black">{status.code}</span>
                    <span className="font-bold uppercase">{status.label}</span>
                  </button>
                ))}
            </div>

            {lastAction && (
                <div role="status" className="border border-primary/20 bg-primary/[.06] p-2 text-center text-primary animate-in fade-in slide-in-from-bottom-2">
                    {lastAction}
                </div>
            )}
        </div>
    </section>
  );
}
