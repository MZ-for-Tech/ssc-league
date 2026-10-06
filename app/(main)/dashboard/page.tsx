import DashboardView from "@/components/dashboard/DashboardView";
import AdminDashboardView from "@/components/admin/AdminDashboardView";
import AdminUsersView from "@/components/admin/AdminUsersView";
import AdminQuestionsView from "@/components/admin/AdminQuestionsView";
import StudentDashboardPreview from "@/components/dashboard/StudentDashboardPreview";
import type { DashboardActivity, DashboardRankHistory, DashboardRival, DashboardStudent, DashboardTopic } from "@/components/dashboard/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getImpersonatedStudentId } from "@/lib/auth/impersonation";
import { getActiveSeasonId, getSelectedSeasonId } from "@/lib/seasons";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type RankedStudent = DashboardStudent & { WeeklyRankHistory: DashboardRankHistory[] };

interface DashboardPageProps {
  searchParams?: Promise<{ view?: string; season?: string }>;
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
  const isAdminPage = ["admin", "users", "questions", "operations"].includes(params.view || "");
  const showAdminView = isAdmin && (!impersonateId || isAdminPage);

  if (isAdmin && params.view === "student") return <StudentDashboardPreview />;

  if (showAdminView) {
    const { data: seasons } = await supabase
      .from("Season")
      .select("id, name, status")
      .order("id", { ascending: false });
    const adminDisplayName = user.user_metadata?.preferred_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Agent";
    const adminWelcomeName = String(adminDisplayName).trim().split(/\s+/)[0] || "Agent";
    const adminAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
    if (params.view === "users") return <AdminUsersView seasonId={selectedSeasonId} activeSeasonId={activeSeasonId} seasons={seasons || []} />;
    if (params.view === "questions") return <AdminQuestionsView seasonId={selectedSeasonId} activeSeasonId={activeSeasonId} seasons={seasons || []} />;

    if (params.view === "operations") {
      return (
        <AdminDashboardView
          totalStudents={0}
          studentsNotStarted={0}
          totalQuestions={0}
          totalAttempts={0}
          activityByDay={[]}
          activeLearners={0}
          topicStats={[]}
          activityWindowLabel="Past 7 days"
          recentActivity={[]}
          isImpersonating={Boolean(impersonateId)}
          seasonId={selectedSeasonId}
          activeSeasonId={activeSeasonId}
          seasons={seasons || []}
          welcomeName={adminWelcomeName}
          welcomeAvatarUrl={adminAvatarUrl}
          view="operations"
        />
      );
    }

    const [studentsResult, answerCountResult, topicsResult, questionsResult] = await Promise.all([
      supabase.from("Student").select("id", { count: "exact", head: true }).eq("season_id", selectedSeasonId),
      supabase.from("StudentAnswer").select("id", { count: "exact", head: true }).eq("season_id", selectedSeasonId),
      supabase.from("Topic").select("id, name, week_number").eq("season_id", selectedSeasonId).order("week_number"),
      supabase.from("Question").select("id, topic_id").eq("season_id", selectedSeasonId),
    ]);
    const totalStudents = studentsResult.count || 0;
    const totalAnswerCount = answerCountResult.count || 0;
    const topics = topicsResult.data || [];
    const questions = questionsResult.data || [];

    const answerPageSize = 1000;
    const answerPageCount = Math.ceil((totalAnswerCount || 0) / answerPageSize);
    const answerPages = await Promise.all(Array.from({ length: answerPageCount }, (_, page) =>
      supabase.from("StudentAnswer")
        .select("id, student_id, question_id, is_correct, attempted_at")
        .eq("season_id", selectedSeasonId)
        .order("id", { ascending: true })
        .range(page * answerPageSize, (page + 1) * answerPageSize - 1)
    ));
    const allAnswers = answerPages.flatMap((page) => page.data || []);
    const studentsWithAttempts = new Set(allAnswers.map((answer) => answer.student_id));
    const studentsNotStarted = Math.max(0, totalStudents - studentsWithAttempts.size);
    const chartDataError = Boolean(
      studentsResult.error || answerCountResult.error || topicsResult.error || questionsResult.error ||
      answerPages.some((page) => page.error)
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
    for (const topic of topics || []) {
      topicStatsById.set(topic.id, {
        topicId: topic.id,
        name: topic.name,
        weekNumber: topic.week_number,
        learnerIds: new Set(),
        attempts: 0,
        correct: 0,
      });
    }
    for (const question of questions || []) questionTopic.set(question.id, question.topic_id);

    const isArchivedSeason = selectedSeasonId !== activeSeasonId;
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
      ? await supabase.from("Student").select("id, full_name, preferred_name").eq("season_id", selectedSeasonId).in("id", recentStudentIds)
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

    return (
      <AdminDashboardView
        totalStudents={totalStudents}
        studentsNotStarted={studentsNotStarted}
        totalQuestions={questions.length}
        totalAttempts={totalAnswerCount}
        activityByDay={activityByDay}
        activeLearners={activeStudentIds.size}
        topicStats={topicStats}
        activityWindowLabel={activityWindowLabel}
        dataError={chartDataError}
        recentActivity={recentActivity}
        isImpersonating={Boolean(impersonateId)}
        seasonId={selectedSeasonId}
        activeSeasonId={activeSeasonId}
        seasons={seasons || []}
        welcomeName={adminWelcomeName}
        welcomeAvatarUrl={adminAvatarUrl}
      />
    );
  }

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

  const { data: answersData } = await supabase.from("StudentAnswer").select("is_correct, question_id").eq("season_id", dashboardSeasonId).eq("student_id", student.id);
  const answers = (answersData || []) as { is_correct: boolean; question_id: string }[];
  const totalAnswers = answers.length;
  const correctAnswers = answers.filter((answer) => answer.is_correct).length;
  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  const { data: rawTopics } = await supabase.from("Topic")
    .select("id, name, week_number, description, Question(id)")
    .eq("season_id", dashboardSeasonId).order("week_number", { ascending: true });
  const topics = (rawTopics || []) as unknown as DashboardTopic[];
  const attemptedQuestionIds = new Set(answers.map((answer) => answer.question_id));

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
      totalModules={topics.length || 12}
      accuracy={accuracy}
      rivals={formattedRivals}
      nextMission={nextMission}
      recentActivity={recentActivity}
      seasonId={dashboardSeasonId}
    />
  );
}
