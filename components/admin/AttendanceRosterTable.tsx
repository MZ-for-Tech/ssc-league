"use client";

import { Circle } from "lucide-react";
import { ATTENDANCE_STATUSES, type AttendanceCode, type AttendanceStatus, type StudentAttendanceStats, type StudentRow } from "@/components/admin/attendance-types";

type AttendanceRosterTableProps = {
  students: StudentRow[];
  filteredStudents: StudentRow[];
  statuses: Record<string, string>;
  selectedDate: string;
  date: string;
  readOnly: boolean;
  savingId: string | null;
  statsForStudent: (studentId: string) => StudentAttendanceStats;
  updateAttendance: (studentId: string, status: AttendanceStatus) => void;
};

export function AttendanceRosterTable({
  students, filteredStudents, statuses, selectedDate, date, readOnly, savingId, statsForStudent, updateAttendance,
}: AttendanceRosterTableProps) {
  return (
    <div className="space-y-2 md:hidden">
      {filteredStudents.map((student) => {
        const rawStatus = statuses[`${student.id}|${selectedDate}`];
        const status: AttendanceStatus = ATTENDANCE_STATUSES.some((item) => item.value === rawStatus) ? rawStatus as AttendanceCode : null;
        const stats = statsForStudent(student.id);
        return (
          <article key={`mobile-${student.id}`} className="border border-border/70 bg-background/30 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="break-words font-semibold text-foreground">{student.full_name}</div>
                <div className="break-all font-mono text-xs text-muted">{student.student_id} · {student.group_id || "—"}</div>
              </div>
              <div className="shrink-0 text-right font-mono text-xs text-muted">{student.current_xp ?? 0} XP</div>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
              <span>{stats.attendanceRate === null ? "—" : `${stats.attendanceRate}%`} attendance · {stats.streak} streak</span>
              <StatusPill status={status} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/60 pt-3" aria-label={`Mark attendance for ${student.full_name}`}>
              {ATTENDANCE_STATUSES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-label={`Mark ${student.full_name} ${item.label.toLowerCase()}`}
                  aria-pressed={status === item.value}
                  disabled={readOnly || savingId !== null || selectedDate > date}
                  onClick={() => updateAttendance(student.id, item.value)}
                  className={`console-control inline-flex min-h-11 items-center justify-center border px-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${status === item.value ? item.className : "border-border bg-background/45 text-muted hover:border-primary/30 hover:text-foreground"}`}
                >{item.label}</button>
              ))}
              {status && <button
                type="button"
                aria-label={`Clear attendance for ${student.full_name}`}
                disabled={readOnly || savingId !== null || selectedDate > date}
                onClick={() => updateAttendance(student.id, null)}
                className="app-touch-target console-control col-span-3 inline-flex items-center justify-center border border-border bg-background/45 px-2 text-xs text-muted transition hover:border-primary/40 hover:text-foreground disabled:cursor-wait disabled:opacity-50"
              >Clear attendance</button>}
            </div>
          </article>
        );
      })}
      {!filteredStudents.length && <p className="border border-border/70 px-4 py-8 text-center text-sm text-muted">{students.length ? "No students match this search." : "No students in this season yet."}</p>}
    </div>
  );
}

export function DesktopAttendanceRosterTable({
  students, filteredStudents, statuses, selectedDate, date, readOnly, savingId, statsForStudent, updateAttendance,
}: AttendanceRosterTableProps) {
  return (
    <div className="hidden overflow-x-auto border border-border/70 md:block">
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
  );
}

function StatusPill({ status }: { status: AttendanceStatus }) {
  if (!status) return <span className="border border-border/70 bg-background/25 px-2 py-1 font-mono text-xs uppercase tracking-wider text-muted">Unmarked</span>;
  const item = ATTENDANCE_STATUSES.find((candidate) => candidate.value === status);
  return item
    ? <span className={`border px-2 py-1 font-mono text-xs uppercase tracking-wider ${item.className}`}>{item.code} · {item.label}</span>
    : <span className="border border-border/70 bg-background/25 px-2 py-1 font-mono text-xs uppercase tracking-wider text-muted">Unmarked</span>;
}
