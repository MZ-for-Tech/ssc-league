"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Circle, Download, Search, Users } from "lucide-react";
import { setStudentAttendance } from "@/app/actions/admin-actions";
import DropdownSelect from "@/components/ui/DropdownSelect";
import OperationsCardHeader from "@/components/admin/OperationsCardHeader";

type AttendanceCode = "PRESENT" | "TARDY" | "EXCUSED" | "ABSENT" | "VACATION";
type AttendanceStatus = AttendanceCode | null;
const ATTENDANCE_STATUSES: { value: AttendanceCode; code: string; label: string; className: string }[] = [
  { value: "PRESENT", code: "P", label: "Present", className: "border-emerald-400/25 bg-emerald-400/[.07] text-emerald-300 hover:border-emerald-300/50" },
  { value: "TARDY", code: "T", label: "Tardy", className: "border-amber-400/25 bg-amber-400/[.07] text-amber-300 hover:border-amber-300/50" },
  { value: "EXCUSED", code: "E", label: "Excused", className: "border-sky-400/25 bg-sky-400/[.07] text-sky-300 hover:border-sky-300/50" },
  { value: "ABSENT", code: "A", label: "Absent", className: "border-rose-400/25 bg-rose-400/[.07] text-rose-300 hover:border-rose-300/50" },
  { value: "VACATION", code: "V", label: "Vacation", className: "border-violet-400/25 bg-violet-400/[.07] text-violet-300 hover:border-violet-300/50" },
];
type StudentRow = {
  id: string;
  full_name: string;
  student_id: string;
  group_id: string | null;
  current_xp: number | null;
};
type AttendanceRecord = { student_id: string; date: string; status: string };

interface GroupOperationsClientProps {
  date: string;
  dates: { date: string; label: string }[];
  students: StudentRow[];
  attendance: AttendanceRecord[];
  readOnly: boolean;
  loadError: string | null;
}

const panelClass = "instrument-panel relative isolate overflow-hidden rounded-2xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] shadow-lg shadow-black/20";

export default function GroupOperationsClient({ date, dates, students, attendance, readOnly, loadError }: GroupOperationsClientProps) {
  const [selectedGroup, setSelectedGroup] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState(date);
  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState<Record<string, string>>(() =>
    Object.fromEntries(attendance.map((record) => [`${record.student_id}|${record.date}`, record.status])),
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const groups = useMemo(() => [...new Set(students.map((student) => student.group_id).filter((group): group is string => Boolean(group)))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })), [students]);
  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return students.filter((student) => {
      const matchesGroup = selectedGroup === "ALL" || student.group_id === selectedGroup;
      const matchesQuery = !normalizedQuery || `${student.full_name} ${student.student_id} ${student.group_id || ""}`.toLocaleLowerCase().includes(normalizedQuery);
      return matchesGroup && matchesQuery;
    });
  }, [query, selectedGroup, students]);
  const counts = useMemo(() => {
    const result = { present: 0, tardy: 0, excused: 0, absent: 0, vacation: 0, unmarked: 0 };
    for (const student of filteredStudents) {
      const status = statuses[`${student.id}|${selectedDate}`];
      if (status === "PRESENT") result.present++;
      else if (status === "TARDY") result.tardy++;
      else if (status === "EXCUSED") result.excused++;
      else if (status === "ABSENT") result.absent++;
      else if (status === "VACATION") result.vacation++;
      else result.unmarked++;
    }
    return result;
  }, [filteredStudents, selectedDate, statuses]);

  const sessionSummaries = useMemo(() => dates.map((item) => {
    const summary = { date: item.date, label: item.label, present: 0, tardy: 0, excused: 0, absent: 0, vacation: 0 };
    for (const student of students) {
      const status = statuses[`${student.id}|${item.date}`];
      if (status === "PRESENT") summary.present++;
      else if (status === "TARDY") summary.tardy++;
      else if (status === "EXCUSED") summary.excused++;
      else if (status === "ABSENT") summary.absent++;
      else if (status === "VACATION") summary.vacation++;
    }
    const marked = summary.present + summary.tardy + summary.excused + summary.absent + summary.vacation;
    const denominator = summary.present + summary.tardy + summary.excused + summary.absent;
    return { ...summary, unmarked: Math.max(0, students.length - marked), attendanceRate: denominator ? Math.round((summary.present + summary.tardy) / denominator * 100) : null, tardyPresentRatio: summary.present ? Number((summary.tardy / summary.present).toFixed(2)) : summary.tardy };
  }), [dates, students, statuses]);

  const exportAttendanceSummary = () => {
    const header = ["Date", "Session", "Present", "Tardy", "Excused", "Absent", "Vacation", "Unmarked", "Attendance %", "Tardy / present ratio"];
    const lines = sessionSummaries.map((item) => [item.date, item.label, item.present, item.tardy, item.excused, item.absent, item.vacation, item.unmarked, item.attendanceRate === null ? "" : `${item.attendanceRate}%`, item.tardyPresentRatio === null ? "" : item.tardyPresentRatio]);
    const csv = [header, ...lines].map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `ssc-attendance-summary-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const statsForStudent = (studentId: string) => {
    const throughSelectedDate = dates.map((item) => item.date).filter((item) => item <= selectedDate).sort();
    let present = 0;
    let tardy = 0;
    let excused = 0;
    let absent = 0;
    let streak = 0;
    for (const sessionDate of throughSelectedDate) {
      const status = statuses[`${studentId}|${sessionDate}`];
      if (status === "PRESENT") { present++; streak++; }
      else if (status === "TARDY") { tardy++; streak++; }
      else if (status === "EXCUSED") { excused++; streak = 0; }
      else if (status === "ABSENT") { absent++; streak = 0; }
      else streak = 0;
    }
    const denominator = present + tardy + excused + absent;
    return { present, tardy, excused, absent, streak, attendanceRate: denominator ? Math.round((present + tardy) / denominator * 100) : null };
  };

  const updateAttendance = async (studentId: string, status: AttendanceStatus) => {
    setSavingId(studentId);
    setErrorMessage(null);
    const result = await setStudentAttendance(studentId, status, selectedDate);
    setSavingId(null);
    if (!result.success) {
      setErrorMessage(result.message || "Attendance could not be updated.");
      return;
    }
    setStatuses((current) => {
      const updated = { ...current };
      const key = `${studentId}|${selectedDate}`;
      if (status === null) delete updated[key];
      else updated[key] = status;
      return updated;
    });
  };

  return (
    <section className={`${panelClass} p-5 sm:p-6`} aria-labelledby="group-operations-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_0%,rgb(var(--primary)/0.1),transparent_48%)]" />
      <OperationsCardHeader
        id="group-operations-title"
        title="Attendance & cohort"
        icon={<Users className="text-primary" size={18} />}
        actions={<div className="w-full sm:w-80"><DropdownSelect value={selectedDate} options={dates.map((item) => ({ value: item.date, label: `${item.date} · ${item.label}` }))} onChange={setSelectedDate} ariaLabel="Attendance date" leadingIcon={<CalendarDays size={16} />} /></div>}
      />

      {loadError ? (
        <div role="alert" className="border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-rose-200">{loadError}</div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
            <Summary label="Students" value={filteredStudents.length} />
            <Summary label="Present" value={counts.present} tone="text-emerald-300" />
            <Summary label="Tardy" value={counts.tardy} tone="text-amber-300" />
            <Summary label="Excused" value={counts.excused} tone="text-sky-300" />
            <Summary label="Absent" value={counts.absent} tone="text-rose-300" />
            <Summary label="Vacation" value={counts.vacation} tone="text-violet-300" />
            <Summary label="Unmarked" value={counts.unmarked} />
          </div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <span>Attendance rate</span>
            <span className="font-mono font-semibold">{counts.present + counts.tardy + counts.excused + counts.absent ? `${Math.round((counts.present + counts.tardy) / (counts.present + counts.tardy + counts.excused + counts.absent) * 100)}%` : "—"}</span>
          </div>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <label className="relative min-w-0 flex-1 text-xs">
              <span className="sr-only">Search roster</span>
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name or student ID"
                className="console-control min-h-10 w-full border border-border bg-background/65 py-2 pl-9 pr-3 text-foreground outline-none placeholder:text-muted/70 focus:border-primary/70 text-sm"
              />
            </label>
            <div className="sm:w-56">
              <DropdownSelect value={selectedGroup} options={[{ value: "ALL", label: "All groups" }, ...groups.map((group) => ({ value: group, label: group }))]} onChange={setSelectedGroup} ariaLabel="Filter by group" />
            </div>
          </div>

          {errorMessage && <div role="alert" className="mb-3 border border-rose-400/20 bg-rose-400/5 px-3 py-2 text-rose-200">{errorMessage}</div>}

          <div className="overflow-x-auto border border-border/70">
            <table className="w-full min-w-[940px] text-left text-xs">
              <thead className="bg-background/55 font-mono uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Group</th>
                  <th className="px-4 py-3 text-right font-semibold">XP</th>
                  <th className="px-4 py-3 font-semibold">Selected session</th>
                  <th className="px-4 py-3 text-right font-semibold">P / T / E / A / V</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredStudents.map((student) => {
                  const rawStatus = statuses[`${student.id}|${selectedDate}`];
                  const status: AttendanceStatus = ATTENDANCE_STATUSES.some((item) => item.value === rawStatus) ? rawStatus as AttendanceCode : null;
                  const stats = statsForStudent(student.id);
                  return (
                    <tr key={student.id} className="transition-colors hover:bg-primary/[.025]">
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-foreground">{student.full_name}</div>
                        <div className="font-mono text-xs text-muted">{student.student_id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs text-muted">{student.group_id || "—"}</div>
                        <div className="mt-1 font-mono text-xs text-muted">{stats.attendanceRate === null ? "—" : `${stats.attendanceRate}%`} attendance · {stats.streak} streak · T/P {stats.tardy}/{stats.present}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-muted">{student.current_xp ?? 0}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          {ATTENDANCE_STATUSES.map((item) => (
                            <button
                              key={item.value}
                              type="button"
                              title={item.label}
                              aria-label={`Mark ${student.full_name} ${item.label.toLowerCase()}`}
                              aria-pressed={status === item.value}
                              disabled={readOnly || savingId !== null || selectedDate > date}
                              onClick={() => updateAttendance(student.id, item.value)}
                              className={`console-control inline-flex h-9 min-w-9 items-center justify-center border px-2 font-mono  font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${status === item.value ? item.className : "border-border bg-background/45 text-muted hover:border-primary/30 hover:text-foreground"}`}
                            >
                              {item.code}
                            </button>
                          ))}
                          {status && (
                            <button
                              type="button"
                              aria-label={`Clear attendance for ${student.full_name}`}
                              disabled={readOnly || savingId !== null || selectedDate > date}
                              onClick={() => updateAttendance(student.id, null)}
                              className="console-control inline-flex min-h-9 items-center justify-center border border-border bg-background/45 px-2 text-muted transition hover:border-primary/40 hover:text-foreground disabled:cursor-wait disabled:opacity-50 text-sm"
                            >
                              <Circle size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!filteredStudents.length && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">{students.length ? "No students match this search." : "No students in this season yet."}</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground">Attendance summary</h3>
              <button type="button" onClick={exportAttendanceSummary} disabled={!sessionSummaries.length} className="console-control inline-flex min-h-9 items-center gap-2 border border-primary/20 bg-background/55 px-3 py-2 font-bold uppercase tracking-wider text-foreground transition hover:border-primary/50 hover:bg-primary/5 disabled:opacity-40 text-sm"><Download size={14} /> Export summary</button>
            </div>
            <div className="max-h-72 overflow-auto border border-border/70">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="sticky top-0 bg-background/90 font-mono uppercase tracking-wider text-muted"><tr><th className="px-3 py-2">Date / session</th><th className="px-2 py-2 text-right">P</th><th className="px-2 py-2 text-right">T</th><th className="px-2 py-2 text-right">E</th><th className="px-2 py-2 text-right">A</th><th className="px-2 py-2 text-right">V</th><th className="px-2 py-2 text-right">Blank</th><th className="px-3 py-2 text-right">Attendance</th><th className="px-3 py-2 text-right">T / P</th></tr></thead>
                <tbody className="divide-y divide-border/60">{sessionSummaries.map((item) => <tr key={item.date}><td className="px-3 py-2 text-foreground"><span className="font-mono">{item.date}</span><span className="ml-2 text-muted">{item.label}</span></td><td className="px-2 py-2 text-right text-emerald-300">{item.present}</td><td className="px-2 py-2 text-right text-amber-300">{item.tardy}</td><td className="px-2 py-2 text-right text-sky-300">{item.excused}</td><td className="px-2 py-2 text-right text-rose-300">{item.absent}</td><td className="px-2 py-2 text-right text-violet-300">{item.vacation}</td><td className="px-2 py-2 text-right text-muted">{item.unmarked}</td><td className="px-3 py-2 text-right font-mono text-foreground">{item.attendanceRate === null ? "—" : `${item.attendanceRate}%`}</td><td className="px-3 py-2 text-right font-mono text-muted">{item.tardyPresentRatio === null ? "—" : item.tardyPresentRatio}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Summary({ label, value, tone = "text-foreground" }: { label: string; value: number; tone?: string }) {
  return <div className="border border-border/70 bg-background/30 px-3 py-2.5"><div className={`font-mono text-base font-bold ${tone}`}>{value}</div><div className="font-mono text-xs uppercase tracking-wider text-muted">{label}</div></div>;
}

function StatusPill({ status }: { status: AttendanceStatus }) {
  if (!status) return <span className="border border-border/70 bg-background/25 px-2 py-1 font-mono text-xs uppercase tracking-wider text-muted">Unmarked</span>;
  const item = ATTENDANCE_STATUSES.find((candidate) => candidate.value === status);
  return item
    ? <span className={`border px-2 py-1 font-mono text-xs uppercase tracking-wider ${item.className}`}>{item.code} · {item.label}</span>
    : <span className="border border-border/70 bg-background/25 px-2 py-1 font-mono text-xs uppercase tracking-wider text-muted">Unmarked</span>;
}
