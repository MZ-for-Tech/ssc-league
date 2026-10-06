"use client";

import { useMemo } from "react";
import { Download, Trophy } from "lucide-react";
import OperationsCardHeader from "@/components/admin/OperationsCardHeader";

type Student = { id: string; full_name: string; student_id: string; group_id: string | null; current_xp: number | null };
type Attendance = { student_id: string; date: string; status: string };
type Activity = { student_id: string };
type Answer = { student_id: string; is_correct: boolean };
type Standing = {
  id: string;
  name: string;
  studentId: string;
  group: string;
  xp: number;
  xpRank: number;
  activity: number;
  activityRank: number;
  attended: number;
  attendanceTotal: number;
  attendanceRate: number | null;
  attendanceRank: number;
  rankPoints: number;
  overallRank: number;
};

function competitionRanks(rows: Standing[], value: (row: Standing) => number) {
  const sorted = [...rows].sort((a, b) => value(b) - value(a));
  const ranks = new Map<string, number>();
  let previous: number | undefined;
  let rank = 0;
  sorted.forEach((row, index) => {
    const current = value(row);
    if (previous !== current) rank = index + 1;
    ranks.set(row.id, rank);
    previous = current;
  });
  return ranks;
}

function csvCell(value: string | number) {
  let safe = String(value);
  if (/^[=+@]/.test(safe) || /^-[^0-9]/.test(safe)) safe = `'${safe}`;
  return `"${safe.replaceAll('"', '""')}"`;
}

export default function ProtocolStandings({ students, attendance, activity, answers, loadError, historicalSeasons }: {
  students: Student[];
  attendance: Attendance[];
  activity: Activity[];
  answers: Answer[];
  loadError: boolean;
  historicalSeasons: { id: string; name: string; average: number; maximum: number; participants: number }[];
}) {
  const rows = useMemo(() => {
    const attendanceByStudent = new Map<string, { attended: number; total: number }>();
    for (const record of attendance) {
      const counts = attendanceByStudent.get(record.student_id) ?? { attended: 0, total: 0 };
      if (["PRESENT", "TARDY"].includes(record.status)) {
        counts.attended += 1;
        counts.total += 1;
      } else if (["ABSENT", "EXCUSED"].includes(record.status)) {
        counts.total += 1;
      }
      attendanceByStudent.set(record.student_id, counts);
    }
    const activityByStudent = new Map<string, number>();
    activity.forEach(({ student_id }) => activityByStudent.set(student_id, (activityByStudent.get(student_id) ?? 0) + 1));
    const base: Standing[] = students.map((student) => {
      const attendanceCounts = attendanceByStudent.get(student.id) ?? { attended: 0, total: 0 };
      return {
        id: student.id,
        name: student.full_name || "Unnamed student",
        studentId: student.student_id || "",
        group: student.group_id || "—",
        xp: Number(student.current_xp || 0),
        xpRank: 0,
        activity: activityByStudent.get(student.id) ?? 0,
        activityRank: 0,
        attended: attendanceCounts.attended,
        attendanceTotal: attendanceCounts.total,
        attendanceRate: attendanceCounts.total ? attendanceCounts.attended / attendanceCounts.total : null,
        attendanceRank: 0,
        rankPoints: 0,
        overallRank: 0,
      };
    });
    const xpRanks = competitionRanks(base, (row) => row.xp);
    const activityRanks = competitionRanks(base, (row) => row.activity);
    const attendanceRanks = competitionRanks(base, (row) => row.attendanceRate ?? -1);
    const ranked = base.map((row) => {
      const xpRank = xpRanks.get(row.id) ?? 0;
      const activityRank = activityRanks.get(row.id) ?? 0;
      const attendanceRank = attendanceRanks.get(row.id) ?? 0;
      return { ...row, xpRank, activityRank, attendanceRank, rankPoints: xpRank + activityRank + attendanceRank };
    }).sort((a, b) => a.rankPoints - b.rankPoints || b.xp - a.xp || a.name.localeCompare(b.name));
    const rankByPoints = new Map<number, number>();
    ranked.forEach((row, index) => {
      if (!rankByPoints.has(row.rankPoints)) rankByPoints.set(row.rankPoints, index + 1);
    });
    return ranked.map((row) => ({ ...row, overallRank: rankByPoints.get(row.rankPoints) ?? 0 }));
  }, [students, attendance, activity]);

  const recognitionLeaders = useMemo(() => {
    const answerCounts = new Map<string, { correct: number; total: number }>();
    answers.forEach((answer) => {
      const count = answerCounts.get(answer.student_id) ?? { correct: 0, total: 0 };
      count.total++;
      if (answer.is_correct) count.correct++;
      answerCounts.set(answer.student_id, count);
    });
    const streakByStudent = new Map<string, number>();
    const attendanceByStudent = new Map<string, Attendance[]>();
    attendance.forEach((record) => {
      const history = attendanceByStudent.get(record.student_id) ?? [];
      history.push(record);
      attendanceByStudent.set(record.student_id, history);
    });
    attendanceByStudent.forEach((history, studentId) => {
      let streak = 0;
      history.sort((a, b) => a.date.localeCompare(b.date)).forEach(({ status }) => {
        if (status === "PRESENT" || status === "TARDY") streak++;
        else streak = 0;
      });
      streakByStudent.set(studentId, streak);
    });
    const candidates = students.map((student) => {
      const answers = answerCounts.get(student.id) ?? { correct: 0, total: 0 };
      return { id: student.id, name: student.full_name || "Unnamed student", studentId: student.student_id || "", group: student.group_id || "—", xp: Number(student.current_xp || 0), streak: streakByStudent.get(student.id) ?? 0, ...answers, accuracy: answers.total ? answers.correct / answers.total : 0 };
    });
    return {
      all: candidates,
      accuracy: [...candidates].filter((item) => item.total >= 10).sort((a, b) => b.accuracy - a.accuracy || b.correct - a.correct).slice(0, 5),
      streak: [...candidates].filter((item) => item.streak > 0).sort((a, b) => b.streak - a.streak || b.xp - a.xp).slice(0, 5),
      answers: [...candidates].filter((item) => item.total > 0).sort((a, b) => b.total - a.total || b.correct - a.correct).slice(0, 5),
    };
  }, [students, answers, attendance]);

  const exportCsv = () => {
    const header = ["Final rank", "Name", "Student ID", "Group", "XP", "Workbook level", "XP rank", "Award activity count", "Activity rank", "Attended sessions", "Counted sessions", "Attendance %", "Attendance rank", "Attendance streak", "Correct answers", "Question answers", "Accuracy %", "Rank points"];
    const recognitionById = new Map(recognitionLeaders.all.map((item) => [item.id, item]));
    const body = rows.map((row) => {
      const recognition = recognitionById.get(row.id);
      const workbookLevel = row.xp > 200 ? 5 : row.xp > 150 ? 4 : row.xp > 100 ? 3 : row.xp > 50 ? 2 : 1;
      return [row.overallRank, row.name, row.studentId, row.group, row.xp, workbookLevel, row.xpRank, row.activity, row.activityRank, row.attended, row.attendanceTotal, row.attendanceRate === null ? "" : `${(row.attendanceRate * 100).toFixed(1)}%`, row.attendanceRank, recognition?.streak ?? 0, recognition?.correct ?? 0, recognition?.total ?? 0, recognition?.total ? `${(recognition.accuracy * 100).toFixed(1)}%` : "", row.rankPoints];
    });
    const csv = [header, ...body].map((line) => line.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `ssc-season-standings-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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

function RecognitionLeaders({ title, rows, metric }: {
  title: string;
  rows: { name: string; studentId: string; group: string; accuracy: number; correct: number; total: number; xp: number; streak: number }[];
  metric: (row: { name: string; studentId: string; group: string; accuracy: number; correct: number; total: number; xp: number; streak: number }) => string;
}) {
  return <div className="border border-border/70 bg-background/25 p-3"><div className="mb-2"><h3 className="text-sm font-semibold text-foreground">{title}</h3></div><ol className="space-y-2">{rows.map((row, index) => <li key={`${row.studentId}-${index}`} className="flex items-center justify-between gap-2"><span className="min-w-0 truncate text-foreground"><span className="mr-2 font-mono text-primary">{index + 1}</span>{row.name}<span className="ml-1 text-muted">· {row.group}</span></span><span className="shrink-0 font-mono text-muted">{metric(row)}</span></li>)}{!rows.length && <li className="py-2 text-muted">No qualifying activity yet.</li>}</ol></div>;
}
