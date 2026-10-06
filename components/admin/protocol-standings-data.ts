import type {
  ProtocolActivity,
  ProtocolAnswer,
  ProtocolAttendance,
  ProtocolStanding,
  ProtocolStudent,
  RecognitionStanding,
} from "@/components/admin/protocol-standings-types";

export type RecognitionLeadersData = {
  all: RecognitionStanding[];
  accuracy: RecognitionStanding[];
  streak: RecognitionStanding[];
  answers: RecognitionStanding[];
};

function competitionRanks(rows: ProtocolStanding[], value: (row: ProtocolStanding) => number) {
  const sorted = [...rows].sort((left, right) => value(right) - value(left));
  const ranks = new Map<string, number>();
  let previous: number | undefined;
  let rank = 0;
  sorted.forEach((row, index) => {
    const current = value(row);
    if (previous !== current) rank = index + 1;
    ranks.set(row.id, rank);
    previous = current;
  });
  return ranks;
}

export function buildProtocolStandingsRows(
  students: ProtocolStudent[],
  attendance: ProtocolAttendance[],
  activity: ProtocolActivity[],
) {
  const attendanceByStudent = new Map<string, { attended: number; total: number }>();
  for (const record of attendance) {
    const counts = attendanceByStudent.get(record.student_id) ?? { attended: 0, total: 0 };
    if (["PRESENT", "TARDY"].includes(record.status)) {
      counts.attended += 1;
      counts.total += 1;
    } else if (["ABSENT", "EXCUSED"].includes(record.status)) {
      counts.total += 1;
    }
    attendanceByStudent.set(record.student_id, counts);
  }
  const activityByStudent = new Map<string, number>();
  activity.forEach(({ student_id }) => activityByStudent.set(student_id, (activityByStudent.get(student_id) ?? 0) + 1));
  const base: ProtocolStanding[] = students.map((student) => {
    const attendanceCounts = attendanceByStudent.get(student.id) ?? { attended: 0, total: 0 };
    return {
      id: student.id,
      name: student.full_name || "Unnamed student",
      studentId: student.student_id || "",
      group: student.group_id || "—",
      xp: Number(student.current_xp || 0),
      xpRank: 0,
      activity: activityByStudent.get(student.id) ?? 0,
      activityRank: 0,
      attended: attendanceCounts.attended,
      attendanceTotal: attendanceCounts.total,
      attendanceRate: attendanceCounts.total ? attendanceCounts.attended / attendanceCounts.total : null,
      attendanceRank: 0,
      rankPoints: 0,
      overallRank: 0,
    };
  });
  const xpRanks = competitionRanks(base, (row) => row.xp);
  const activityRanks = competitionRanks(base, (row) => row.activity);
  const attendanceRanks = competitionRanks(base, (row) => row.attendanceRate ?? -1);
  const ranked = base.map((row) => {
    const xpRank = xpRanks.get(row.id) ?? 0;
    const activityRank = activityRanks.get(row.id) ?? 0;
    const attendanceRank = attendanceRanks.get(row.id) ?? 0;
    return { ...row, xpRank, activityRank, attendanceRank, rankPoints: xpRank + activityRank + attendanceRank };
  }).sort((left, right) => left.rankPoints - right.rankPoints || right.xp - left.xp || left.name.localeCompare(right.name));
  const rankByPoints = new Map<number, number>();
  ranked.forEach((row, index) => {
    if (!rankByPoints.has(row.rankPoints)) rankByPoints.set(row.rankPoints, index + 1);
  });
  return ranked.map((row) => ({ ...row, overallRank: rankByPoints.get(row.rankPoints) ?? 0 }));
}

export function buildRecognitionLeaders(
  students: ProtocolStudent[],
  answers: ProtocolAnswer[],
  attendance: ProtocolAttendance[],
): RecognitionLeadersData {
  const answerCounts = new Map<string, { correct: number; total: number }>();
  answers.forEach((answer) => {
    const count = answerCounts.get(answer.student_id) ?? { correct: 0, total: 0 };
    count.total++;
    if (answer.is_correct) count.correct++;
    answerCounts.set(answer.student_id, count);
  });
  const streakByStudent = new Map<string, number>();
  const attendanceByStudent = new Map<string, ProtocolAttendance[]>();
  attendance.forEach((record) => {
    const history = attendanceByStudent.get(record.student_id) ?? [];
    history.push(record);
    attendanceByStudent.set(record.student_id, history);
  });
  attendanceByStudent.forEach((history, studentId) => {
    let streak = 0;
    history.sort((left, right) => left.date.localeCompare(right.date)).forEach(({ status }) => {
      if (status === "PRESENT" || status === "TARDY") streak++;
      else streak = 0;
    });
    streakByStudent.set(studentId, streak);
  });
  const candidates: RecognitionStanding[] = students.map((student) => {
    const answerCount = answerCounts.get(student.id) ?? { correct: 0, total: 0 };
    return {
      id: student.id,
      name: student.full_name || "Unnamed student",
      studentId: student.student_id || "",
      group: student.group_id || "—",
      xp: Number(student.current_xp || 0),
      streak: streakByStudent.get(student.id) ?? 0,
      ...answerCount,
      accuracy: answerCount.total ? answerCount.correct / answerCount.total : 0,
    };
  });
  return {
    all: candidates,
    accuracy: [...candidates].filter((item) => item.total >= 10).sort((left, right) => right.accuracy - left.accuracy || right.correct - left.correct).slice(0, 5),
    streak: [...candidates].filter((item) => item.streak > 0).sort((left, right) => right.streak - left.streak || right.xp - left.xp).slice(0, 5),
    answers: [...candidates].filter((item) => item.total > 0).sort((left, right) => right.total - left.total || right.correct - left.correct).slice(0, 5),
  };
}

function csvCell(value: string | number) {
  let safe = String(value);
  if (/^[=+@]/.test(safe) || /^-[^0-9]/.test(safe)) safe = `'${safe}`;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function buildProtocolStandingsCsv(rows: ProtocolStanding[], recognitionLeaders: RecognitionLeadersData) {
  const header = ["Final rank", "Name", "Student ID", "Group", "XP", "Workbook level", "XP rank", "Award activity count", "Activity rank", "Attended sessions", "Counted sessions", "Attendance %", "Attendance rank", "Attendance streak", "Correct answers", "Question answers", "Accuracy %", "Rank points"];
  const recognitionById = new Map(recognitionLeaders.all.map((item) => [item.id, item]));
  const body = rows.map((row) => {
    const recognition = recognitionById.get(row.id);
    const workbookLevel = row.xp > 200 ? 5 : row.xp > 150 ? 4 : row.xp > 100 ? 3 : row.xp > 50 ? 2 : 1;
    return [row.overallRank, row.name, row.studentId, row.group, row.xp, workbookLevel, row.xpRank, row.activity, row.activityRank, row.attended, row.attendanceTotal, row.attendanceRate === null ? "" : `${(row.attendanceRate * 100).toFixed(1)}%`, row.attendanceRank, recognition?.streak ?? 0, recognition?.correct ?? 0, recognition?.total ?? 0, recognition?.total ? `${(recognition.accuracy * 100).toFixed(1)}%` : "", row.rankPoints];
  });
  return [header, ...body].map((line) => line.map(csvCell).join(",")).join("\r\n");
}
