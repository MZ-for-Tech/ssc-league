import type { DashboardActivity, DashboardCurriculumModule, DashboardTopic } from "@/components/dashboard/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadStudentDashboardRivals, type RankedStudent } from "@/lib/student-dashboard-rivals";

export async function loadStudentDashboardData({
  supabase,
  dashboardSeasonId,
  targetId,
  lookupByAuthId,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  dashboardSeasonId: string;
  targetId: string;
  lookupByAuthId: boolean;
}) {
  let studentQuery = supabase
    .from("Student")
    .select("*, WeeklyRankHistory!WeeklyRankHistory_season_student_fkey(week_number, rank)");
  studentQuery = lookupByAuthId
    ? studentQuery.eq("auth_id", targetId).eq("season_id", dashboardSeasonId)
    : studentQuery.eq("id", targetId).eq("season_id", dashboardSeasonId);
  const { data: studentData, error: studentError } = await studentQuery.maybeSingle();

  if (studentError || !studentData) return { dashboard: null, studentError };

  const student = studentData as unknown as RankedStudent;
  const { currentRank, rivals: formattedRivals } = await loadStudentDashboardRivals({ supabase, seasonId: dashboardSeasonId, student });

  const { data: answersData } = await supabase.from("StudentAnswer")
    .select("is_correct, question_id, attempted_at")
    .eq("season_id", dashboardSeasonId)
    .eq("student_id", student.id);
  const answers = (answersData || []) as { is_correct: boolean; question_id: string; attempted_at: string }[];
  const totalAnswers = answers.length;
  const correctAnswers = answers.filter((answer) => answer.is_correct).length;
  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  const [{ data: rawTopics }, { data: courseQuestions }, { data: moduleRows }] = await Promise.all([
    supabase.from("Topic")
      .select("id, name, week_number, description, module_id, lesson_number")
      .eq("season_id", dashboardSeasonId)
      .order("week_number", { ascending: true }),
    supabase.from("Question")
      .select("id, topic_id")
      .eq("season_id", dashboardSeasonId),
    supabase.from("Module")
      .select("id, module_number, name, description, display_order")
      .eq("season_id", dashboardSeasonId)
      .order("display_order", { ascending: true }),
  ]);
  const questionsByTopic = new Map<string | number, { id: string }[]>();
  for (const question of courseQuestions || []) {
    const topicQuestions = questionsByTopic.get(question.topic_id) || [];
    topicQuestions.push({ id: question.id });
    questionsByTopic.set(question.topic_id, topicQuestions);
  }
  const topics: DashboardTopic[] = ((rawTopics || []) as Omit<DashboardTopic, "Question">[]).map((topic) => ({
    ...topic,
    Question: questionsByTopic.get(topic.id) || [],
  }));
  const attemptedQuestionIds = new Set(answers.map((answer) => answer.question_id));
  const moduleByQuestionId = new Map<string, string>();
  const moduleIdByTopicId = new Map(topics.map((topic) => [String(topic.id), topic.module_id]));
  for (const question of courseQuestions || []) {
    const moduleId = moduleIdByTopicId.get(String(question.topic_id));
    if (moduleId) moduleByQuestionId.set(question.id, moduleId);
  }
  // The rolling window is calculated once per server request.
  const recentPracticeSince = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentAttemptsByModule = new Map<string, number>();
  for (const answer of answers) {
    const moduleId = moduleByQuestionId.get(answer.question_id);
    if (moduleId && new Date(answer.attempted_at).getTime() >= recentPracticeSince) {
      recentAttemptsByModule.set(moduleId, (recentAttemptsByModule.get(moduleId) || 0) + 1);
    }
  }
  const curriculumModules: DashboardCurriculumModule[] = (moduleRows || []).map((module) => ({
    id: module.id,
    module_number: module.module_number,
    name: module.name,
    description: module.description,
    recentAttempts: recentAttemptsByModule.get(module.id) || 0,
    lessons: topics
      .filter((topic) => topic.module_id === module.id)
      .sort((left, right) => (left.lesson_number ?? left.week_number) - (right.lesson_number ?? right.week_number))
      .map((topic) => ({
        id: topic.id,
        name: topic.name,
        lesson_number: topic.lesson_number,
        questionCount: topic.Question.length,
        exploredCount: topic.Question.filter((question) => attemptedQuestionIds.has(question.id)).length,
      })),
  }));

  let nextMission: DashboardTopic | null = null;
  let completedModulesCount = 0;
  for (const topic of topics) {
    const questions = topic.Question || [];
    const isComplete = questions.length > 0 && questions.every((question) => attemptedQuestionIds.has(question.id));
    if (isComplete) completedModulesCount++;
    if (!isComplete && !nextMission) nextMission = topic;
  }

  const { data: activityData } = await supabase.from("StudentAnswer")
    .select("is_correct, attempted_at, Question ( points, Topic (name) )")
    .eq("season_id", dashboardSeasonId).eq("student_id", student.id).order("attempted_at", { ascending: false }).limit(3);
  const recentActivity = (activityData || []) as unknown as DashboardActivity[];

  const { count: totalStudents } = await supabase.from("Student").select("id", { count: "exact", head: true }).eq("season_id", dashboardSeasonId);
  const studentCount = totalStudents || 0;
  const topPercent = studentCount ? Math.round((currentRank / studentCount) * 100) : 100;
  const firstName = student.preferred_name?.split(" ")[0] || student.full_name.split(" ")[0];
  return {
    dashboard: {
      student,
      firstName,
      currentRank,
      totalStudents: studentCount,
      topPercent,
      completedModulesCount,
      totalModules: topics.length,
      accuracy,
      rivals: formattedRivals,
      nextMission,
      recentActivity,
      curriculumModules,
      seasonId: dashboardSeasonId,
    },
    studentError: null,
  };
}
