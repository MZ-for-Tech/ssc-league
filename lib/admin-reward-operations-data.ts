import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mergeRewardProtocol, type RewardProtocolValue } from "@/lib/reward-protocol";
import { loadRewardOperationsReports } from "@/lib/admin-reward-operations-reports-data";

function seasonSequence(seasonId: string) {
  const match = seasonId.match(/(\d+)$/);
  return match ? Number(match[1]) : null;
}

export async function loadRewardProtocolOperationsData(seasonId: string) {
  const supabase = await createSupabaseServerClient();
  const [{ data: students, error: studentsError }, { count: attendanceAwardCount, error: attendanceError }, { count: attendanceCount, error: attendanceCountError }, { data: batches, error: batchesError }, { data: weeks, error: weeksError }, { data: sessions, error: sessionsError }, { count: xpCount, error: xpCountError }, { count: recognitionCount, error: recognitionsError }, { count: answerCount, error: answerCountError }, { data: archivedSeasons, error: archivedSeasonsError }, { data: protocolValues, error: protocolValuesError }] = await Promise.all([
    supabase
      .from("Student")
      .select("id, full_name, student_id, group_id, current_xp, current_streak")
      .eq("season_id", seasonId)
      .order("group_id", { ascending: true })
      .order("full_name", { ascending: true }),
    supabase
      .from("RewardProtocolRecipient")
      .select("id", { count: "exact", head: true })
      .eq("season_id", seasonId)
      .eq("category", "attendance"),
    supabase
      .from("AttendanceRecord")
      .select("id", { count: "exact", head: true })
      .eq("season_id", seasonId),
    supabase
      .from("RewardProtocolBatch")
      .select("id, category, reward_key, reward_label, event_label, award_date, week_number, base_amount, boost_multiplier, amount, created_at")
      .eq("season_id", seasonId)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("SeasonWeek")
      .select("week_number, starts_on, ends_on, boost_multiplier")
      .eq("season_id", seasonId)
      .order("week_number", { ascending: true }),
    supabase
      .from("SeasonSession")
      .select("id, session_number, session_date, module_title, topic_title, coverage_status, notes")
      .eq("season_id", seasonId)
      .order("session_date", { ascending: true })
      .order("session_number", { ascending: true }),
    supabase
      .from("XPTransaction")
      .select("id", { count: "exact", head: true })
      .eq("season_id", seasonId),
    supabase
      .from("SeasonRecognition")
      .select("id", { count: "exact", head: true })
      .eq("season_id", seasonId),
    supabase
      .from("StudentAnswer")
      .select("id", { count: "exact", head: true })
      .eq("season_id", seasonId),
    supabase
      .from("Season")
      .select("id, name")
      .eq("status", "archived")
      .order("created_at", { ascending: true }),
    supabase
      .from("RewardProtocolTask")
      .select("category, reward_key, xp")
      .order("sort_order", { ascending: true }),
  ]);
  const protocol = mergeRewardProtocol((protocolValues ?? []) as RewardProtocolValue[]);

  const reports = await loadRewardOperationsReports(supabase, seasonId, {
    attendanceAwards: attendanceAwardCount,
    attendance: attendanceCount,
    xp: xpCount,
    answers: answerCount,
    recognitions: recognitionCount,
  });
  const { attendanceAwards, attendanceRecords, xpActivity, answers, recognitions } = reports;

  const archivedSeasonIds = (archivedSeasons ?? []).map((season) => season.id);
  const { data: archivedStudents, error: archivedStudentsError } = archivedSeasonIds.length
    ? await supabase.from("Student").select("season_id, current_xp").in("season_id", archivedSeasonIds)
    : { data: [], error: null };
  const selectedSeasonSequence = seasonSequence(seasonId);
  const historicalSeasons = (archivedSeasons ?? []).filter((season) => {
    const archivedSequence = seasonSequence(season.id);
    return selectedSeasonSequence !== null && archivedSequence !== null && archivedSequence < selectedSeasonSequence;
  }).map((season) => {
    const points = (archivedStudents ?? []).filter((student) => student.season_id === season.id).map((student) => Number(student.current_xp || 0));
    return { id: season.id, name: season.name, average: points.length ? points.reduce((sum, xp) => sum + xp, 0) / points.length : 0, maximum: Math.max(0, ...points), participants: points.length };
  });

  const batchIds = (batches ?? []).map((batch) => batch.id);
  const recipientCounts = new Map<string, number>();
  const recipientCountResults = await Promise.all((batches ?? []).map((batch) =>
    supabase
      .from("RewardProtocolRecipient")
      .select("id", { count: "exact", head: true })
      .eq("season_id", seasonId)
      .eq("batch_id", batch.id),
  ));
  recipientCountResults.forEach((result, index) => {
    recipientCounts.set(batchIds[index], result.count ?? 0);
  });
  const attendedSessionCounts = new Map<string, number>();
  for (const record of attendanceRecords ?? []) {
    if (record.status === "PRESENT" || record.status === "TARDY") {
      attendedSessionCounts.set(record.student_id, (attendedSessionCounts.get(record.student_id) ?? 0) + 1);
    }
  }
  const rewardLoadErrors = [studentsError, attendanceError, attendanceCountError, ...reports.attendanceAwardErrors, batchesError, weeksError, ...recipientCountResults.map((result) => result.error)];
  const rewardLoadFailed = rewardLoadErrors.some(Boolean);
  const rewardTablesMissing = rewardLoadErrors.some((error) => error?.code === "PGRST205" || error?.code === "42P01" || error?.message?.includes("Could not find the table"));
  const history = (batches ?? []).map((batch) => ({ ...batch, recipient_count: recipientCounts.get(batch.id) ?? 0 }));
  const reportLoadError = Boolean(studentsError || attendanceCountError || reports.attendanceRecordsError || xpCountError || reports.xpActivityError || answerCountError || reports.answersError || archivedSeasonsError || archivedStudentsError);
  const recognitionLoadError = Boolean(recognitionsError || reports.recognitionPagesError);
  const rewardLoadError = rewardLoadFailed
    ? rewardTablesMissing
      ? "Database setup is incomplete. Apply migration 20261006130000_reward_protocol_operations.sql, then refresh."
      : "Reward data could not be read. Check database access and refresh."
    : protocolValuesError
      ? "Reward values could not be loaded. Apply migration 20261006150000_configurable_reward_protocol.sql, then refresh."
      : null;

  return {
    protocol,
    students,
    attendanceAwards,
    weeks,
    sessions,
    history,
    attendedSessionCounts: Object.fromEntries(attendedSessionCounts),
    recognitions,
    attendanceRecords,
    xpActivity,
    answers,
    historicalSeasons,
    rewardLoadError,
    settingsLoadError: Boolean(protocolValuesError),
    reportLoadError,
    recognitionLoadError,
    sessionsLoadError: Boolean(sessionsError),
  };
}
