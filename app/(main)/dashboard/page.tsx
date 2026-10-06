import DashboardView from "@/components/dashboard/DashboardView";
import StudentDashboardPreview from "@/components/dashboard/StudentDashboardPreview";
import type { DashboardActivity, DashboardCurriculumModule, DashboardRankHistory, DashboardRival, DashboardStudent, DashboardTopic } from "@/components/dashboard/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getImpersonatedStudentId } from "@/lib/auth/impersonation";
import { getActiveSeasonId, getSelectedSeasonId } from "@/lib/seasons";
import { redirect } from "next/navigation";
import { createPageMetadata } from "@/lib/site-metadata";

export const revalidate = 0;
export const dynamic = "force-dynamic";
export const metadata = createPageMetadata("Dashboard", "See your SSC2 League progress, current objectives, and recent activity.");

type RankedStudent = DashboardStudent & { WeeklyRankHistory: DashboardRankHistory[] };

interface DashboardPageProps {
  searchParams?: Promise<{ view?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createSupabaseServerClient();
  const activeSeasonId = await getActiveSeasonId(supabase);

  let user;
  try {
    const response = await supabase.auth.getUser();
    user = response.data.user;
  } catch {
    return <div className="p-8 text-red-400">Access Denied.</div>;
  }
  if (!user) return <div className="p-8 text-red-400">Access Denied.</div>;

  const [{ data: adminProfile }, impersonateId] = await Promise.all([
    supabase.from("Admin").select("id").eq("auth_id", user.id).maybeSingle(),
    getImpersonatedStudentId(),
  ]);
  const params = searchParams ? await searchParams : {};
  const isAdmin = Boolean(adminProfile);
  const selectedSeasonId = await getSelectedSeasonId(supabase, activeSeasonId, isAdmin);
  const dashboardSeasonId = isAdmin ? selectedSeasonId : activeSeasonId;

  if (isAdmin && params.view === "student" && !impersonateId) return <StudentDashboardPreview />;
  if (isAdmin && !impersonateId) redirect("/admin");

  let targetId = user.id;
  let lookupByAuthId = true;

  if (impersonateId && isAdmin) {
    targetId = impersonateId;
    lookupByAuthId = false;
  }

  let studentQuery = supabase
    .from("Student")
    .select("*, WeeklyRankHistory!WeeklyRankHistory_season_student_fkey(week_number, rank)");
  studentQuery = lookupByAuthId
    ? studentQuery.eq("auth_id", targetId).eq("season_id", dashboardSeasonId)
    : studentQuery.eq("id", targetId).eq("season_id", dashboardSeasonId);
  const { data: studentData, error: studentError } = await studentQuery.maybeSingle();

  if (studentError) console.error("Unable to load the student dashboard:", studentError);
  if (studentError) return <div className="rounded-xl border border-border bg-surface/50 p-8 text-center text-muted">Your dashboard could not be loaded. Please refresh and try again.</div>;
  if (!studentData) return <div className="rounded-xl border border-border bg-surface/50 p-8 text-center text-muted">Your account is not enrolled in the active season.</div>;

  const student = studentData as unknown as RankedStudent;

  const getRankForXp = async (xp: number) => {
    const { count } = await supabase.from("Student").select("id", { count: "exact", head: true }).eq("season_id", dashboardSeasonId).gt("current_xp", xp);
    return (count || 0) + 1;
  };

  const currentRank = await getRankForXp(student.current_xp);

  const { data: rivalsAboveData } = await supabase.from("Student")
    .select("id, full_name, preferred_name, current_xp, avatar_url, WeeklyRankHistory!WeeklyRankHistory_season_student_fkey(week_number, rank)")
    .eq("season_id", dashboardSeasonId).gt("current_xp", student.current_xp).order("current_xp", { ascending: true }).limit(1);
  const { data: rivalsBelowData } = await supabase.from("Student")
    .select("id, full_name, preferred_name, current_xp, avatar_url, WeeklyRankHistory!WeeklyRankHistory_season_student_fkey(week_number, rank)")
    .eq("season_id", dashboardSeasonId).lt("current_xp", student.current_xp).order("current_xp", { ascending: false }).limit(1);

  const rivalsAbove = rivalsAboveData as unknown as RankedStudent[] | null;
  const rivalsBelow = rivalsBelowData as unknown as RankedStudent[] | null;
  const allHistory: DashboardRankHistory[] = [
    ...(student.WeeklyRankHistory || []),
    ...(rivalsAbove?.[0]?.WeeklyRankHistory || []),
    ...(rivalsBelow?.[0]?.WeeklyRankHistory || []),
  ];

  const globalMaxWeek = allHistory.reduce((maxWeek, history) => Math.max(maxWeek, history.week_number), 0);
  const comparisonWeek = globalMaxWeek > 1 ? globalMaxWeek - 1 : 1;

  const formatRival = async (person: RankedStudent, isMe: boolean, liveRank: number): Promise<DashboardRival> => {
    const historyEntry = person.WeeklyRankHistory?.find((history) => history.week_number === comparisonWeek);
    const previousRank = historyEntry ? historyEntry.rank : liveRank;
    return {
      id: person.id,
      rank: liveRank,
      name: person.preferred_name || person.full_name,
      xp: person.current_xp,
      avatar_url: person.avatar_url,
      trend: previousRank - liveRank,
      isMe,
    };
  };

  const formattedRivals: DashboardRival[] = [];
  if (rivalsAbove?.[0]) {
    formattedRivals.push(await formatRival(rivalsAbove[0], false, await getRankForXp(rivalsAbove[0].current_xp)));
  }
  formattedRivals.push(await formatRival(student, true, currentRank));
  if (rivalsBelow?.[0]) {
    formattedRivals.push(await formatRival(rivalsBelow[0], false, await getRankForXp(rivalsBelow[0].current_xp)));
  }

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
  // eslint-disable-next-line react-hooks/purity
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

  return (
    <DashboardView
      student={student}
      firstName={firstName}
      currentRank={currentRank}
      totalStudents={studentCount}
      topPercent={topPercent}
      completedModulesCount={completedModulesCount}
      totalModules={topics.length}
      accuracy={accuracy}
      rivals={formattedRivals}
      nextMission={nextMission}
      recentActivity={recentActivity}
      curriculumModules={curriculumModules}
      seasonId={dashboardSeasonId}
    />
  );
}
