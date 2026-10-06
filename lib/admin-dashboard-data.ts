import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function loadAdminDashboardData({
  supabase,
  seasonId,
  activeSeasonId,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  seasonId: string;
  activeSeasonId: string;
}) {
  const [{ data: seasons }, studentsResult, answerCountResult, topicsResult, questionsResult, essaysResult] = await Promise.all([
    supabase.from("Season").select("id, name, status").order("id", { ascending: false }),
    supabase.from("Student").select("id", { count: "exact", head: true }).eq("season_id", seasonId),
    supabase.from("StudentAnswer").select("id", { count: "exact", head: true }).eq("season_id", seasonId),
    supabase.from("Topic").select("id, name, week_number").eq("season_id", seasonId).order("week_number"),
    supabase.from("Question").select("id, topic_id").eq("season_id", seasonId),
    supabase.from("EssayQuestion").select("id", { count: "exact", head: true }).eq("season_id", seasonId),
  ]);

  const totalStudents = studentsResult.count || 0;
  const totalAnswerCount = answerCountResult.count || 0;
  const topics = topicsResult.data || [];
  const questions = questionsResult.data || [];

  const answerPageSize = 1000;
  const answerPageCount = Math.ceil(totalAnswerCount / answerPageSize);
  const answerPages = await Promise.all(Array.from({ length: answerPageCount }, (_, page) =>
    supabase.from("StudentAnswer")
      .select("id, student_id, question_id, is_correct, attempted_at")
      .eq("season_id", seasonId)
      .order("id", { ascending: true })
      .range(page * answerPageSize, (page + 1) * answerPageSize - 1),
  ));
  const allAnswers = answerPages.flatMap((page) => page.data || []);
  const studentsAttempted = new Set(allAnswers.map((answer) => answer.student_id)).size;
  const dataError = Boolean(
    studentsResult.error || answerCountResult.error || topicsResult.error || questionsResult.error || essaysResult.error ||
    answerPages.some((page) => page.error),
  );

  const questionTopic = new Map<string, string>();
  const topicStatsById = new Map<string, {
    topicId: string;
    name: string;
    weekNumber: number;
    learnerIds: Set<string>;
    attempts: number;
    correct: number;
  }>();
  for (const topic of topics) {
    topicStatsById.set(topic.id, {
      topicId: topic.id,
      name: topic.name,
      weekNumber: topic.week_number,
      learnerIds: new Set(),
      attempts: 0,
      correct: 0,
    });
  }
  for (const question of questions) questionTopic.set(question.id, question.topic_id);

  const isArchivedSeason = seasonId !== activeSeasonId;
  const currentStartDate = new Date();
  currentStartDate.setUTCHours(0, 0, 0, 0);
  currentStartDate.setUTCDate(currentStartDate.getUTCDate() - 6);
  let activityStartDate = currentStartDate;
  let activityEndDate: Date | null = null;
  let activityWindowLabel = "Past 7 days";
  if (isArchivedSeason && allAnswers.length) {
    const latestAttempt = allAnswers.reduce((latest, answer) => {
      const attemptedAt = new Date(answer.attempted_at);
      return attemptedAt > latest ? attemptedAt : latest;
    }, new Date(0));
    activityEndDate = new Date(latestAttempt);
    activityEndDate.setUTCHours(0, 0, 0, 0);
    activityEndDate.setUTCDate(activityEndDate.getUTCDate() + 1);
    activityStartDate = new Date(activityEndDate);
    activityStartDate.setUTCDate(activityStartDate.getUTCDate() - 7);
    activityWindowLabel = "Last active week";
  }

  const attemptsByDate = new Map<string, number>();
  const activeStudentIds = new Set<string>();
  for (const answer of allAnswers) {
    const attemptedAt = new Date(answer.attempted_at);
    const topicId = questionTopic.get(answer.question_id);
    const topicStats = topicId ? topicStatsById.get(topicId) : null;
    if (topicStats) {
      topicStats.attempts++;
      if (answer.is_correct) topicStats.correct++;
      topicStats.learnerIds.add(answer.student_id);
    }
    if (attemptedAt >= activityStartDate && (!activityEndDate || attemptedAt < activityEndDate)) {
      const date = attemptedAt.toISOString().slice(0, 10);
      attemptsByDate.set(date, (attemptsByDate.get(date) || 0) + 1);
      activeStudentIds.add(answer.student_id);
    }
  }

  const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" });
  const activityByDay = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(activityStartDate);
    date.setUTCDate(activityStartDate.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);
    return { date: key, label: weekdayFormatter.format(date), count: attemptsByDate.get(key) || 0 };
  });
  const topicStats = Array.from(topicStatsById.values()).map(({ learnerIds, ...topic }) => ({
    ...topic,
    learners: learnerIds.size,
  }));
  const latestAttemptsByStudent = new Map<string, (typeof allAnswers)[number]>();
  for (const attempt of [...allAnswers].sort((a, b) => new Date(b.attempted_at).getTime() - new Date(a.attempted_at).getTime())) {
    if (!latestAttemptsByStudent.has(attempt.student_id)) latestAttemptsByStudent.set(attempt.student_id, attempt);
    if (latestAttemptsByStudent.size === 6) break;
  }
  const latestAttempts = [...latestAttemptsByStudent.values()];
  const recentStudentIds = [...new Set(latestAttempts.map((attempt) => attempt.student_id))];
  const { data: recentStudents } = recentStudentIds.length
    ? await supabase.from("Student").select("id, full_name, preferred_name").eq("season_id", seasonId).in("id", recentStudentIds)
    : { data: [] };
  const studentNameById = new Map<string, string>((recentStudents || []).map((student) => [student.id, student.preferred_name || student.full_name] as const));
  const topicNameById = new Map<string, string>(topicStats.map((topic) => [topic.topicId, topic.name] as const));
  const recentActivity = latestAttempts.map((attempt) => ({
    id: attempt.id,
    studentName: studentNameById.get(attempt.student_id) || "Student",
    topicName: topicNameById.get(questionTopic.get(attempt.question_id) || "") || "Course question",
    isCorrect: attempt.is_correct,
    attemptedAt: attempt.attempted_at,
  }));


  return {
    totalStudents,
    studentsAttempted,
    totalQuestions: questions.length + (essaysResult.count || 0),
    totalAttempts: totalAnswerCount,
    activityByDay,
    activeLearners: activeStudentIds.size,
    topicStats,
    activityWindowLabel,
    dataError,
    recentActivity,
    seasons: seasons || [],
  };
}
