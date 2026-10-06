"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getImpersonatedStudentId } from "@/lib/auth/impersonation";

async function getActiveLearner() {
  const sessionClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await sessionClient.auth.getUser();
  if (authError || !user) throw new Error("Authentication required.");

  const adminClient = createSupabaseAdminClient();
  const { data: season, error: seasonError } = await adminClient
    .from("Season").select("id").eq("status", "active").single();
  if (seasonError || !season) throw new Error("There is no active league season.");

  const [{ data: admin }, impersonatedId] = await Promise.all([
    adminClient.from("Admin").select("id").eq("auth_id", user.id).maybeSingle(),
    getImpersonatedStudentId(),
  ]);

  const studentQuery = admin && impersonatedId
    ? adminClient.from("Student").select("id").eq("id", impersonatedId)
    : adminClient.from("Student").select("id").eq("auth_id", user.id);
  const { data: student, error: studentError } = await studentQuery
    .eq("season_id", season.id).maybeSingle();
  if (studentError || !student) throw new Error("This account is not enrolled in the active season.");

  return { adminClient, studentId: student.id, seasonId: season.id as string };
}

export async function loadActiveQuiz(topicId: string) {
  const { adminClient, studentId, seasonId } = await getActiveLearner();
  const { data: topic, error: topicError } = await adminClient.from("Topic")
    .select("id, season_id")
    .eq("id", topicId)
    .eq("season_id", seasonId)
    .maybeSingle();
  if (topicError || !topic) throw new Error("Lesson not found in the active season.");

  const { data: questions, error: questionError } = await adminClient.from("Question")
    .select("id, text, points, display_order, stimulus_code, stimulus_asset_url, stimulus_asset_alt")
    .eq("season_id", seasonId)
    .eq("topic_id", topic.id)
    .order("display_order", { ascending: true });
  if (questionError) throw questionError;

  const questionIds = (questions || []).map((question) => question.id);
  if (!questionIds.length) return { studentId, seasonId, questions: [], answers: [] };

  const [{ data: options, error: optionsError }, { data: answers, error: answersError }] = await Promise.all([
    adminClient.from("QuestionOption")
      .select("id, question_id, text, option_order, is_correct, justification")
      .eq("season_id", seasonId)
      .in("question_id", questionIds)
      .order("option_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }),
    adminClient.from("StudentAnswer")
      .select("question_id, selected_option_id, is_correct")
      .eq("season_id", seasonId)
      .eq("student_id", studentId)
      .in("question_id", questionIds),
  ]);
  if (optionsError) throw optionsError;
  if (answersError) throw answersError;

  const answeredQuestionIds = new Set((answers || []).map((answer) => answer.question_id));
  const feedbackFor = (questionId: string) => {
    if (!answeredQuestionIds.has(questionId)) return null;
    const questionOptions = (options || []).filter((option) => option.question_id === questionId);
    return {
      correctOptionId: questionOptions.find((option) => option.is_correct)?.id || null,
      optionFeedback: questionOptions.map((option) => ({
        optionId: option.id,
        isCorrect: option.is_correct,
        justification: option.justification,
      })),
    };
  };

  return {
    studentId,
    seasonId,
    questions: (questions || []).map((question) => ({
      ...question,
      QuestionOption: (options || []).filter((option) => option.question_id === question.id).map(({ id, question_id, text, option_order }) => ({ id, question_id, text, option_order })),
      feedback: feedbackFor(question.id),
    })),
    answers: answers || [],
  };
}

export async function submitQuizAnswer(questionId: string, optionId: string) {
  const { adminClient, studentId, seasonId } = await getActiveLearner();
  const { data: existing, error: existingError } = await adminClient.from("StudentAnswer")
    .select("question_id, selected_option_id, is_correct")
    .eq("season_id", seasonId)
    .eq("student_id", studentId)
    .eq("question_id", questionId)
    .maybeSingle();
  if (existingError) throw existingError;

  const [{ data: question, error: questionError }, { data: option, error: optionError }] = await Promise.all([
    adminClient.from("Question").select("id")
      .eq("id", questionId).eq("season_id", seasonId).maybeSingle(),
    adminClient.from("QuestionOption").select("id, question_id, is_correct")
      .eq("id", optionId).eq("season_id", seasonId).maybeSingle(),
  ]);
  if (questionError) throw questionError;
  if (optionError) throw optionError;
  if (!question || !option || option.question_id !== question.id) {
    throw new Error("That answer option does not belong to this active question.");
  }

  const { data: options, error: allOptionsError } = await adminClient.from("QuestionOption")
    .select("id, is_correct, justification")
    .eq("question_id", question.id).eq("season_id", seasonId)
    .order("option_order", { ascending: true, nullsFirst: false });
  if (allOptionsError) throw allOptionsError;
  const optionFeedback = (options || []).map((item) => ({
    optionId: item.id,
    isCorrect: item.is_correct,
    justification: item.justification,
  }));
  const correctOptionId = (options || []).find((item) => item.is_correct)?.id || null;

  if (!existing) {
    const { error: insertError } = await adminClient.from("StudentAnswer").insert({
      season_id: seasonId,
      student_id: studentId,
      question_id: question.id,
      selected_option_id: option.id,
      is_correct: option.is_correct,
    });
    if (insertError) {
      if (insertError.code !== "23505") throw insertError;
      const { data: racedAnswer, error: racedError } = await adminClient.from("StudentAnswer")
        .select("selected_option_id, is_correct")
        .eq("season_id", seasonId).eq("student_id", studentId).eq("question_id", question.id).single();
      if (racedError) throw racedError;
      return {
        selectedOptionId: racedAnswer.selected_option_id,
        isCorrect: racedAnswer.is_correct,
        correctOptionId,
        optionFeedback,
      };
    }
  }

  return {
    selectedOptionId: existing?.selected_option_id || option.id,
    isCorrect: existing?.is_correct ?? option.is_correct,
    correctOptionId,
    optionFeedback,
  };
}
