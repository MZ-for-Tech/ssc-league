import { createSupabaseServerClient } from "@/lib/supabase/server";
import GroupOperationsClient from "@/components/admin/GroupOperationsClient";
import { getAttendanceDate } from "@/lib/attendance-date";

interface GroupOperationsProps {
  seasonId: string;
  readOnly: boolean;
}

export default async function GroupOperations({ seasonId, readOnly }: GroupOperationsProps) {
  const supabase = await createSupabaseServerClient();
  const date = getAttendanceDate();
  const [{ data: students, error: studentsError }, { data: sessions, error: sessionsError }, { count: attendanceCount, error: attendanceCountError }] = await Promise.all([
    supabase
      .from("Student")
      .select("id, full_name, student_id, group_id, current_xp")
      .eq("season_id", seasonId)
      .order("full_name", { ascending: true }),
    supabase
      .from("SeasonSession")
      .select("session_date, session_number, topic_title, module_title")
      .eq("season_id", seasonId)
      .order("session_date", { ascending: false })
      .order("session_number", { ascending: false }),
    supabase
      .from("AttendanceRecord")
      .select("id", { count: "exact", head: true })
      .eq("season_id", seasonId),
  ]);

  const attendancePageSize = 1000;
  const attendancePages = await Promise.all(Array.from({ length: Math.ceil((attendanceCount ?? 0) / attendancePageSize) }, (_, page) =>
    supabase
      .from("AttendanceRecord")
      .select("student_id, date, status")
      .eq("season_id", seasonId)
      .order("date", { ascending: false })
      .range(page * attendancePageSize, (page + 1) * attendancePageSize - 1),
  ));
  const attendance = attendancePages.flatMap((page) => page.data ?? []);
  const dateLabels = new Map<string, string>();
  for (const session of sessions ?? []) {
    const current = dateLabels.get(session.session_date);
    const label = [session.session_number ? `Session ${session.session_number}` : null, session.topic_title].filter(Boolean).join(" · ");
    dateLabels.set(session.session_date, current ? `${current} / ${label}` : label);
  }
  const dates = [...new Set([date, ...(sessions ?? []).map((session) => session.session_date), ...attendance.map((record) => record.date)])]
    .sort((a, b) => b.localeCompare(a))
    .map((sessionDate) => ({ date: sessionDate, label: dateLabels.get(sessionDate) || "Attendance session" }));
  const loadError = Boolean(studentsError || sessionsError || attendanceCountError || attendancePages.some((page) => page.error));
  const missingScheduleMigration = sessionsError?.code === "PGRST205" || sessionsError?.message?.includes('SeasonSession');

  return (
    <GroupOperationsClient
      date={date}
      dates={dates}
      students={students ?? []}
      attendance={attendance}
      readOnly={readOnly}
      loadError={loadError ? missingScheduleMigration ? "Apply migration 20261006130000_reward_protocol_operations.sql to create the season schedule tables, then refresh." : "Group roster data could not be read. Check database access and refresh." : null}
    />
  );
}
