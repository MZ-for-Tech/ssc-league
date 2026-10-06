import { loadPaginatedRows } from "@/lib/admin-data-pagination";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export async function loadRewardOperationsReports(
  supabase: SupabaseServerClient,
  seasonId: string,
  counts: { attendanceAwards: number | null; attendance: number | null; xp: number | null; answers: number | null; recognitions: number | null },
) {
  const recipientPages = await loadPaginatedRows(counts.attendanceAwards, 1000, (start, end) =>
    supabase
      .from("RewardProtocolRecipient")
      .select("student_id, reward_key")
      .eq("season_id", seasonId)
      .eq("category", "attendance")
      .order("id", { ascending: true })
      .range(start, end),
  );
  const attendancePages = await loadPaginatedRows(counts.attendance, 1000, (start, end) =>
    supabase
      .from("AttendanceRecord")
      .select("student_id, date, status")
      .eq("season_id", seasonId)
      .order("id", { ascending: true })
      .range(start, end),
  );
  const xpPages = await loadPaginatedRows(counts.xp, 1000, (start, end) =>
    supabase
      .from("XPTransaction")
      .select("student_id")
      .eq("season_id", seasonId)
      .order("id", { ascending: true })
      .range(start, end),
  );
  const answerPages = await loadPaginatedRows(counts.answers, 1000, (start, end) =>
    supabase
      .from("StudentAnswer")
      .select("student_id, is_correct")
      .eq("season_id", seasonId)
      .order("id", { ascending: true })
      .range(start, end),
  );
  const recognitionPages = await loadPaginatedRows(counts.recognitions, 1000, (start, end) =>
    supabase
      .from("SeasonRecognition")
      .select("id, student_id, event_date, session_number, recognition_type, notes")
      .eq("season_id", seasonId)
      .order("event_date", { ascending: false })
      .order("id", { ascending: true })
      .range(start, end),
  );

  return {
    attendanceAwards: recipientPages.rows,
    attendanceAwardErrors: recipientPages.errors,
    attendanceRecords: attendancePages.rows,
    attendanceRecordsError: attendancePages.errors.some(Boolean),
    xpActivity: xpPages.rows,
    xpActivityError: xpPages.errors.some(Boolean),
    answers: answerPages.rows,
    answersError: answerPages.errors.some(Boolean),
    recognitions: recognitionPages.rows,
    recognitionPagesError: recognitionPages.errors.some(Boolean),
  };
}
