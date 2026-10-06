import { createSupabaseServerClient } from "@/lib/supabase/server";
import RewardProtocolClient from "@/components/admin/RewardProtocolClient";
import RewardProtocolSettings from "@/components/admin/RewardProtocolSettings";
import SeasonWeeksOperations, { type SeasonWeekRecord } from "@/components/admin/SeasonWeeksOperations";
import SeasonSessionsOperations, { type SeasonSessionRecord } from "@/components/admin/SeasonSessionsOperations";
import ProtocolStandings from "@/components/admin/ProtocolStandings";
import SeasonRecognitionOperations, { type SeasonRecognitionRecord } from "@/components/admin/SeasonRecognitionOperations";
import GroupOperations from "@/components/admin/GroupOperations";
import AttendanceWidget from "@/components/admin/AttendanceWidget";
import BroadcastWidget from "@/components/admin/BroadcastWidget";
import BulkXPWidget from "@/components/admin/BulkXPWidget";
import AuditLog from "@/components/admin/AuditLog";
import LeagueOperationsWorkspace from "@/components/admin/LeagueOperationsWorkspace";
import { getAttendanceDate } from "@/lib/attendance-date";
import { mergeRewardProtocol, type RewardProtocolValue } from "@/lib/reward-protocol";

interface RewardProtocolOperationsProps {
  seasonId: string;
  readOnly: boolean;
}

function seasonSequence(seasonId: string) {
  const match = seasonId.match(/(\d+)$/);
  return match ? Number(match[1]) : null;
}

export default async function RewardProtocolOperations({ seasonId, readOnly }: RewardProtocolOperationsProps) {
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

  const recipientPageSize = 1000;
  const attendanceAwardPages = await Promise.all(Array.from({ length: Math.ceil((attendanceAwardCount ?? 0) / recipientPageSize) }, (_, page) =>
    supabase
      .from("RewardProtocolRecipient")
      .select("student_id, reward_key")
      .eq("season_id", seasonId)
      .eq("category", "attendance")
      .order("id", { ascending: true })
      .range(page * recipientPageSize, (page + 1) * recipientPageSize - 1),
  ));
  const attendanceAwards = attendanceAwardPages.flatMap((page) => page.data ?? []);

  const attendancePageSize = 1000;
  const attendancePages = await Promise.all(Array.from({ length: Math.ceil((attendanceCount ?? 0) / attendancePageSize) }, (_, page) =>
    supabase
      .from("AttendanceRecord")
      .select("student_id, date, status")
      .eq("season_id", seasonId)
      .order("id", { ascending: true })
      .range(page * attendancePageSize, (page + 1) * attendancePageSize - 1),
  ));
  const attendanceRecords = attendancePages.flatMap((page) => page.data ?? []);
  const attendanceRecordsError = attendancePages.some((page) => page.error);

  const xpPageSize = 1000;
  const xpPages = await Promise.all(Array.from({ length: Math.ceil((xpCount ?? 0) / xpPageSize) }, (_, page) =>
    supabase
      .from("XPTransaction")
      .select("student_id")
      .eq("season_id", seasonId)
      .order("id", { ascending: true })
      .range(page * xpPageSize, (page + 1) * xpPageSize - 1),
  ));
  const xpActivity = xpPages.flatMap((page) => page.data ?? []);
  const xpActivityError = xpPages.some((page) => page.error);

  const answerPageSize = 1000;
  const answerPages = await Promise.all(Array.from({ length: Math.ceil((answerCount ?? 0) / answerPageSize) }, (_, page) =>
    supabase
      .from("StudentAnswer")
      .select("student_id, is_correct")
      .eq("season_id", seasonId)
      .order("id", { ascending: true })
      .range(page * answerPageSize, (page + 1) * answerPageSize - 1),
  ));
  const answers = answerPages.flatMap((page) => page.data ?? []);
  const answersError = answerPages.some((page) => page.error);

  const recognitionPageSize = 1000;
  const recognitionPages = await Promise.all(Array.from({ length: Math.ceil((recognitionCount ?? 0) / recognitionPageSize) }, (_, page) =>
    supabase
      .from("SeasonRecognition")
      .select("id, student_id, event_date, session_number, recognition_type, notes")
      .eq("season_id", seasonId)
      .order("event_date", { ascending: false })
      .order("id", { ascending: true })
      .range(page * recognitionPageSize, (page + 1) * recognitionPageSize - 1),
  ));
  const recognitions = recognitionPages.flatMap((page) => page.data ?? []);
  const recognitionPagesError = recognitionPages.some((page) => page.error);

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
  const rewardLoadErrors = [studentsError, attendanceError, attendanceCountError, ...attendanceAwardPages.map((page) => page.error), ...attendancePages.map((page) => page.error), batchesError, weeksError, ...recipientCountResults.map((result) => result.error)];
  const rewardLoadFailed = rewardLoadErrors.some(Boolean);
  const rewardTablesMissing = rewardLoadErrors.some((error) => error?.code === "PGRST205" || error?.code === "42P01" || error?.message?.includes("Could not find the table"));
  const toolsTab = {
    id: "tools" as const,
    content: <div className="space-y-5"><div className="grid gap-4 xl:grid-cols-3"><AttendanceWidget /><BroadcastWidget /><BulkXPWidget /></div><section className="instrument-panel relative isolate overflow-hidden rounded-2xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] p-5 shadow-lg shadow-black/20 sm:p-6"><AuditLog /></section></div>,
  };

  return (
    <LeagueOperationsWorkspace content={[
      { id: "rewards", content: <RewardProtocolClient
        protocol={protocol}
        students={students ?? []}
        attendedSessionCounts={Object.fromEntries(attendedSessionCounts)}
        attendanceAwards={attendanceAwards ?? []}
        weeks={(weeks ?? []) as SeasonWeekRecord[]}
        today={getAttendanceDate()}
        history={(batches ?? []).map((batch) => ({ ...batch, recipient_count: recipientCounts.get(batch.id) ?? 0 }))}
        readOnly={readOnly}
        loadError={rewardLoadFailed ? rewardTablesMissing ? "Database setup is incomplete. Apply migration 20261006130000_reward_protocol_operations.sql, then refresh." : "Reward data could not be read. Check database access and refresh." : protocolValuesError ? "Reward values could not be loaded. Apply migration 20261006150000_configurable_reward_protocol.sql, then refresh." : null}
      /> },
      { id: "settings", content: <RewardProtocolSettings protocol={protocol} readOnly={readOnly} loadError={Boolean(protocolValuesError)} /> },
      { id: "attendance", content: <GroupOperations seasonId={seasonId} readOnly={readOnly} /> },
      { id: "schedule", content: <div className="grid gap-5 2xl:grid-cols-2"><SeasonWeeksOperations weeks={(weeks ?? []) as SeasonWeekRecord[]} readOnly={readOnly} /><SeasonSessionsOperations sessions={(sessions ?? []) as SeasonSessionRecord[]} readOnly={readOnly} loadError={Boolean(sessionsError)} /></div> },
      { id: "recognition", content: <SeasonRecognitionOperations students={students ?? []} records={recognitions as SeasonRecognitionRecord[]} today={getAttendanceDate()} readOnly={readOnly} loadError={Boolean(recognitionsError || recognitionPagesError)} /> },
      { id: "reports", content: <ProtocolStandings
        students={students ?? []}
        attendance={attendanceRecords}
        activity={xpActivity}
        answers={answers}
        loadError={Boolean(studentsError || attendanceCountError || attendanceRecordsError || xpCountError || xpActivityError || answerCountError || answersError || archivedSeasonsError || archivedStudentsError)}
        historicalSeasons={historicalSeasons}
      /> },
      ...(!readOnly ? [toolsTab] : []),
    ]} />
  );
}
