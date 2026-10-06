"use client";

import { useMemo, useState } from "react";
import { setStudentAttendance } from "@/app/actions/admin-attendance";
import type { AttendanceRecord, AttendanceStatus, SessionAttendanceSummary, StudentRow } from "@/components/admin/attendance-types";

export function useGroupAttendance({
  date,
  dates,
  students,
  attendance,
}: {
  date: string;
  dates: { date: string; label: string }[];
  students: StudentRow[];
  attendance: AttendanceRecord[];
}) {
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

  const sessionSummaries = useMemo<SessionAttendanceSummary[]>(() => dates.map((item) => {
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

  return {
    selectedGroup, setSelectedGroup,
    selectedDate, setSelectedDate,
    query, setQuery,
    statuses, savingId, errorMessage,
    groups, filteredStudents, counts, sessionSummaries,
    exportAttendanceSummary, statsForStudent, updateAttendance,
  };
}
