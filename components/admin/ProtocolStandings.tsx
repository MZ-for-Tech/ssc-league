"use client";

import { Download, Trophy } from "lucide-react";
import OperationsCardHeader from "@/components/admin/OperationsCardHeader";
import RecognitionLeaders from "@/components/admin/RecognitionLeaders";
import { useProtocolStandings } from "@/components/admin/useProtocolStandings";
import type {
  HistoricalSeasonStanding,
  ProtocolActivity,
  ProtocolAnswer,
  ProtocolAttendance,
  ProtocolStudent,
} from "@/components/admin/protocol-standings-types";

export default function ProtocolStandings({ students, attendance, activity, answers, loadError, historicalSeasons }: {
  students: ProtocolStudent[];
  attendance: ProtocolAttendance[];
  activity: ProtocolActivity[];
  answers: ProtocolAnswer[];
  loadError: boolean;
  historicalSeasons: HistoricalSeasonStanding[];
}) {
  const { rows, recognitionLeaders, exportCsv } = useProtocolStandings({ students, attendance, activity, answers });

  return (
    <section className="instrument-panel relative isolate overflow-hidden rounded-2xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] p-5 shadow-lg shadow-black/20 sm:p-6" aria-labelledby="protocol-standings-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_0%,rgb(var(--primary)/0.08),transparent_48%)]" />
      <OperationsCardHeader
        id="protocol-standings-title"
        title="Season standings"
        icon={<Trophy className="text-primary" size={17} />}
        actions={<button type="button" onClick={exportCsv} disabled={loadError || !rows.length} className="console-control inline-flex min-h-9 items-center gap-2 border border-primary/20 bg-background/55 px-3 py-2 font-bold uppercase tracking-wider text-foreground transition hover:border-primary/50 hover:bg-primary/5 disabled:opacity-40 text-sm"><Download size={14} /> Export standings</button>}
      />
      {loadError ? <div role="alert" className="border border-rose-400/20 bg-rose-400/5 px-3 py-2 text-rose-200">Standings could not be loaded. Refresh the page to try again.</div> : (
        <>
        <div className="overflow-x-auto border border-border/70">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="bg-background/55 font-mono uppercase tracking-wider text-muted"><tr><th className="px-3 py-2.5">#</th><th className="px-3 py-2.5">Student</th><th className="px-3 py-2.5 text-right">XP / rank</th><th className="px-3 py-2.5 text-right">Activity / rank</th><th className="px-3 py-2.5 text-right">Attendance / rank</th><th className="px-3 py-2.5 text-right">Rank points</th></tr></thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((row) => <tr key={row.id} className="hover:bg-primary/[.025]"><td className="px-3 py-2.5 font-mono font-bold text-primary">{row.overallRank}</td><td className="px-3 py-2.5"><div className="text-sm font-medium text-foreground">{row.name}</div><div className="font-mono text-xs text-muted">{row.studentId} · {row.group}</div></td><td className="px-3 py-2.5 text-right font-mono text-foreground">{row.xp.toLocaleString()} <span className="text-muted">/ {row.xpRank}</span></td><td className="px-3 py-2.5 text-right font-mono text-foreground">{row.activity.toLocaleString()} <span className="text-muted">/ {row.activityRank}</span></td><td className="px-3 py-2.5 text-right font-mono text-foreground">{row.attendanceRate === null ? "—" : `${(row.attendanceRate * 100).toFixed(1)}%`} <span className="text-muted">/ {row.attendanceRank}</span></td><td className="px-3 py-2.5 text-right font-mono font-bold text-foreground">{row.rankPoints}</td></tr>)}
              {!rows.length && <tr><td colSpan={6} className="px-3 py-8 text-center text-muted">No students are enrolled in this season.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <RecognitionLeaders title="Accuracy leaders" rows={recognitionLeaders.accuracy} metric={(row) => `${(row.accuracy * 100).toFixed(1)}% · ${row.correct}/${row.total}`} />
          <RecognitionLeaders title="Current streak" rows={recognitionLeaders.streak} metric={(row) => `${row.streak} sessions`} />
          <RecognitionLeaders title="Most answers" rows={recognitionLeaders.answers} metric={(row) => `${row.total} answers · ${row.xp.toLocaleString()} XP`} />
        </div>
        {historicalSeasons.length > 0 && <div className="mt-5 border border-border/70 bg-background/25 p-4">
          <div className="mb-3"><h3 className="text-sm font-semibold text-foreground">Previous leagues</h3></div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{historicalSeasons.map((season) => <div key={season.id} className="border border-border/60 bg-background/30 px-3 py-2"><div className="font-mono uppercase tracking-wider text-muted">{season.name}</div><div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-foreground"><span>Avg {season.average.toFixed(1)} XP</span><span>Max {season.maximum.toLocaleString()}</span><span>{season.participants} students</span></div></div>)}</div>
        </div>}
        </>
      )}
    </section>
  );
}
