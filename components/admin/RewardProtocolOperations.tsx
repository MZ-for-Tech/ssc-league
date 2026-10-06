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
import { loadRewardProtocolOperationsData } from "@/lib/admin-reward-operations-data";

interface RewardProtocolOperationsProps {
  seasonId: string;
  readOnly: boolean;
}

export default async function RewardProtocolOperations({ seasonId, readOnly }: RewardProtocolOperationsProps) {
  const {
    protocol,
    students,
    attendanceAwards,
    weeks,
    sessions,
    history,
    attendedSessionCounts,
    recognitions,
    attendanceRecords,
    xpActivity,
    answers,
    historicalSeasons,
    rewardLoadError,
    settingsLoadError,
    reportLoadError,
    recognitionLoadError,
    sessionsLoadError,
  } = await loadRewardProtocolOperationsData(seasonId);

  const toolsTab = {
    id: "tools" as const,
    content: <div className="space-y-5"><div className="grid gap-4 xl:grid-cols-3"><AttendanceWidget /><BroadcastWidget /><BulkXPWidget /></div><section className="instrument-panel relative isolate overflow-hidden rounded-2xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] p-5 shadow-lg shadow-black/20 sm:p-6"><AuditLog /></section></div>,
  };

  return (
    <LeagueOperationsWorkspace content={[
      { id: "rewards", content: <RewardProtocolClient
        protocol={protocol}
        students={students ?? []}
        attendedSessionCounts={attendedSessionCounts}
        attendanceAwards={attendanceAwards ?? []}
        weeks={(weeks ?? []) as SeasonWeekRecord[]}
        today={getAttendanceDate()}
        history={history}
        readOnly={readOnly}
        loadError={rewardLoadError}
      /> },
      { id: "settings", content: <RewardProtocolSettings protocol={protocol} readOnly={readOnly} loadError={settingsLoadError} /> },
      { id: "attendance", content: <GroupOperations seasonId={seasonId} readOnly={readOnly} /> },
      { id: "schedule", content: <div className="grid gap-5 2xl:grid-cols-2"><SeasonWeeksOperations weeks={(weeks ?? []) as SeasonWeekRecord[]} readOnly={readOnly} /><SeasonSessionsOperations sessions={(sessions ?? []) as SeasonSessionRecord[]} readOnly={readOnly} loadError={sessionsLoadError} /></div> },
      { id: "recognition", content: <SeasonRecognitionOperations students={students ?? []} records={recognitions as SeasonRecognitionRecord[]} today={getAttendanceDate()} readOnly={readOnly} loadError={recognitionLoadError} /> },
      { id: "reports", content: <ProtocolStandings
        students={students ?? []}
        attendance={attendanceRecords}
        activity={xpActivity}
        answers={answers}
        loadError={reportLoadError}
        historicalSeasons={historicalSeasons}
      /> },
      ...(!readOnly ? [toolsTab] : []),
    ]} />
  );
}
