export type AttendanceCode = "PRESENT" | "TARDY" | "EXCUSED" | "ABSENT" | "VACATION";
export type AttendanceStatus = AttendanceCode | null;

export const ATTENDANCE_STATUSES: { value: AttendanceCode; code: string; label: string; className: string }[] = [
  { value: "PRESENT", code: "P", label: "Present", className: "border-emerald-400/25 bg-emerald-400/[.07] text-emerald-300 hover:border-emerald-300/50" },
  { value: "TARDY", code: "T", label: "Tardy", className: "border-amber-400/25 bg-amber-400/[.07] text-amber-300 hover:border-amber-300/50" },
  { value: "EXCUSED", code: "E", label: "Excused", className: "border-sky-400/25 bg-sky-400/[.07] text-sky-300 hover:border-sky-300/50" },
  { value: "ABSENT", code: "A", label: "Absent", className: "border-rose-400/25 bg-rose-400/[.07] text-rose-300 hover:border-rose-300/50" },
  { value: "VACATION", code: "V", label: "Vacation", className: "border-violet-400/25 bg-violet-400/[.07] text-violet-300 hover:border-violet-300/50" },
];

export type StudentRow = {
  id: string;
  full_name: string;
  student_id: string;
  group_id: string | null;
  current_xp: number | null;
};
export type AttendanceRecord = { student_id: string; date: string; status: string };
export type StudentAttendanceStats = {
  present: number;
  tardy: number;
  excused: number;
  absent: number;
  streak: number;
  attendanceRate: number | null;
};
export type SessionAttendanceSummary = {
  date: string;
  label: string;
  present: number;
  tardy: number;
  excused: number;
  absent: number;
  vacation: number;
  unmarked: number;
  attendanceRate: number | null;
  tardyPresentRatio: number;
};
