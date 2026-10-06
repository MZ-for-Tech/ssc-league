type AttendanceRecord = { date: string; status: string };
type QuizAnswer = {
  id: string; attempted_at: string; is_correct: boolean;
  Question: Array<{ text: string; points: number | null; Topic: Array<{ name: string }> }>;
};
type XPTransaction = { id: string; action_type: string; description: string | null; amount: number; created_at: string };
type RankRecord = { rank: number };
type ProfileStudentData = {
  id: string;
  full_name: string;
  preferred_name: string | null;
  student_id: string;
  email: string | null;
  group_id: string | null;
  avatar_url: string | null;
  current_xp: number | null;
  current_level: number | null;
  current_streak: number | null;
};

export type ProfileDashboardSource = {
  student: ProfileStudentData;
  season: { name: string | null; starts_on: string | null } | null;
  transactions: XPTransaction[] | null;
  quizAnswers: QuizAnswer[] | null;
  rankHistory: RankRecord[] | null;
  attendanceRecords: AttendanceRecord[] | null;
};

const LEVEL_RANGES = [
  { level: 1, min: 0, max: 50 },
  { level: 2, min: 50, max: 100 },
  { level: 3, min: 100, max: 150 },
  { level: 4, min: 150, max: 200 },
  { level: 5, min: 200, max: 500 },
  { level: 6, min: 500, max: 1000 },
];

export function buildProfileDashboardData({ student, season, transactions, quizAnswers, rankHistory, attendanceRecords }: ProfileDashboardSource) {
  const heatmapData: { [key: string]: number } = {};
  const addActivity = (dateStr: string | Date, weight: number = 1) => {
    if (!dateStr) return;
    const d = new Date(dateStr);
    const key = d.toISOString().split("T")[0];
    heatmapData[key] = (heatmapData[key] || 0) + weight;
  };

  (attendanceRecords as AttendanceRecord[] | null)?.forEach((rec) => {
      if (rec.status === 'PRESENT' || rec.status === 'TARDY') addActivity(rec.date, 3);
  });
  (quizAnswers as QuizAnswer[] | null)?.forEach((q) => addActivity(q.attempted_at, 1));
  (transactions as XPTransaction[] | null)?.forEach((t) => addActivity(t.created_at, 1));

  const earliestRecordedActivity = Object.keys(heatmapData).sort()[0];
  // Season start dates are optional in the database; use the first real season event as a fallback.
  const heatmapStartDate = season?.starts_on || earliestRecordedActivity || new Date().toISOString().slice(0, 10);

  const unifiedLog = [
    ...((transactions || []) as XPTransaction[]).map((t) => ({
      id: t.id,
      type: 'reward' as const,
      title: t.action_type === 'MANUAL_ENTRY' ? 'Manual adjustment' : t.action_type.replaceAll('_', ' ').toLowerCase(),
      desc: t.description || "",
      xp: t.amount,
      date: new Date(t.created_at),
    })),
    ...((quizAnswers || []) as QuizAnswer[]).map((q) => ({
      id: q.id,
      type: 'practice' as const,
      title: q.is_correct ? "Question solved" : "Question attempted",
      desc: q.Question[0]?.Topic[0]?.name || "General Module",
      xp: q.is_correct ? 2 : 1,
      date: new Date(q.attempted_at),
      isCorrect: q.is_correct,
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  // --- CALCULATE METRICS ---
  const currentXP = student.current_xp || 0;
  const currentLevel = student.current_level || 1;
  const levelDef = LEVEL_RANGES.find(l => l.level === currentLevel) || LEVEL_RANGES[0];
  const nextLevelDef = LEVEL_RANGES.find(l => l.level === (levelDef.level + 1)) || { min: 1000 };
  const xpInLevel = currentXP - levelDef.min;
  const xpNeededForLevel = nextLevelDef.min - levelDef.min;
  const progressPercent = Math.min(100, Math.max(0, (xpInLevel / xpNeededForLevel) * 100));

  const countedAttendanceRecords = ((attendanceRecords as AttendanceRecord[] | null) || []).filter((record) => record.status !== "VACATION");
  const totalSessions = countedAttendanceRecords.length;
  const attendanceRate = totalSessions > 0 
    ? Math.round((countedAttendanceRecords.filter((a) => ['PRESENT', 'TARDY'].includes(a.status)).length || 0) / totalSessions * 100)
    : 0;
  
  const bestRank = rankHistory && rankHistory.length > 0 ? Math.min(...(rankHistory as RankRecord[]).map((h) => h.rank)) : 0;
  const currentStreak = student.current_streak || 0;

  // Quiz Stats
  const totalQuizzes = quizAnswers?.length || 0;
  const correctQuizzes = (quizAnswers as QuizAnswer[] | null)?.filter((a) => a.is_correct).length || 0;
  const quizAccuracy = totalQuizzes > 0 ? Math.round((correctQuizzes / totalQuizzes) * 100) : 0;

  // --- ACHIEVEMENT LOGIC (TACTICAL THEME) ---
  const badges = {
      neuro_link: true, // Always unlocked (Joined)
      signal_lock: currentStreak >= 3,
      sniper_grade: totalQuizzes >= 5 && quizAccuracy >= 80,
      grid_reliability: totalSessions >= 3 && attendanceRate >= 90,
      senior_operative: currentLevel >= 5,
      high_command: bestRank > 0 && bestRank <= 10,
      unbroken_stream: currentStreak >= 7,
      data_warlord: currentXP >= 500
  };

  const displayName = student.preferred_name || student.full_name.split(' ')[0];
  const studentForEdit = {
    id: student.id,
    full_name: student.full_name,
    preferred_name: student.preferred_name || "",
    student_id: student.student_id,
    email: student.email || "",
    group_id: student.group_id || "G1",
    avatar_url: student.avatar_url
  };

  return {
    displayName,
    studentForEdit,
    levelDef,
    currentXP,
    progressPercent,
    xpInLevel,
    xpNeededForLevel,
    heatmapData,
    heatmapStartDate,
    bestRank,
    quizAccuracy,
    attendanceRate,
    badges,
    currentStreak,
    unifiedLog,
  };
}
