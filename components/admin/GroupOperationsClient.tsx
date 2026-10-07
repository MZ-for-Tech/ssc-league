"use client";

import { CalendarDays, Search, Users } from "lucide-react";
import DropdownSelect from "@/components/ui/DropdownSelect";
import OperationsCardHeader from "@/components/admin/OperationsCardHeader";
import { AttendanceRosterTable, DesktopAttendanceRosterTable } from "@/components/admin/AttendanceRosterTable";
import { AttendanceSummaryTable } from "@/components/admin/AttendanceSummaryTable";
import { type AttendanceRecord, type StudentRow } from "@/components/admin/attendance-types";
import { useGroupAttendance } from "@/components/admin/useGroupAttendance";

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
  const {
    selectedGroup, setSelectedGroup,
    selectedDate, setSelectedDate,
    query, setQuery,
    statuses, savingId, errorMessage,
    groups, filteredStudents, counts, sessionSummaries,
    exportAttendanceSummary, statsForStudent, updateAttendance,
  } = useGroupAttendance({ date, dates, students, attendance });

  return (
    <section className={`${panelClass} app-panel-padding`} aria-labelledby="group-operations-title">
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

          <AttendanceRosterTable
            students={students}
            filteredStudents={filteredStudents}
            statuses={statuses}
            selectedDate={selectedDate}
            date={date}
            readOnly={readOnly}
            savingId={savingId}
            statsForStudent={statsForStudent}
            updateAttendance={updateAttendance}
          />
          <DesktopAttendanceRosterTable
            students={students}
            filteredStudents={filteredStudents}
            statuses={statuses}
            selectedDate={selectedDate}
            date={date}
            readOnly={readOnly}
            savingId={savingId}
            statsForStudent={statsForStudent}
            updateAttendance={updateAttendance}
          />
          <AttendanceSummaryTable summaries={sessionSummaries} onExport={exportAttendanceSummary} />
        </>
      )}
    </section>
  );
}

function Summary({ label, value, tone = "text-foreground" }: { label: string; value: number; tone?: string }) {
  return <div className="border border-border/70 bg-background/30 px-3 py-2.5"><div className={`font-mono text-base font-bold ${tone}`}>{value}</div><div className="font-mono text-xs uppercase tracking-wider text-muted">{label}</div></div>;
}
