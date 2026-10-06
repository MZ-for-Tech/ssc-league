"use server";

import { getActiveQuizAccess } from "@/lib/quiz-access";

export async function loadActiveQuiz(topicId: string) {
  const { adminClient, studentId, seasonId, isTeacherPreview } = await getActiveQuizAccess();
  const { data: topic, error: topicError } = await adminClient.from("Topic")
    .select("id, season_id, name")
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
  if (!questionIds.length) return { studentId, seasonId, isTeacherPreview, lessonName: topic.name, questions: [], answers: [] };

  const { data: options, error: optionsError } = await adminClient.from("QuestionOption")
      .select("id, question_id, text, option_order, is_correct, justification")
      .eq("season_id", seasonId)
      .in("question_id", questionIds)
      .order("option_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });
  if (optionsError) throw optionsError;

  let answers: { question_id: string; selected_option_id: string; is_correct: boolean }[] = [];
  if (studentId) {
    const { data, error } = await adminClient.from("StudentAnswer")
      .select("question_id, selected_option_id, is_correct")
      .eq("season_id", seasonId)
      .eq("student_id", studentId)
      .in("question_id", questionIds);
    if (error) throw error;
    answers = data || [];
  }

  const answeredQuestionIds = new Set((answers || []).map((answer) => answer.question_id));
  const feedbackFor = (questionId: string) => {
    if (!isTeacherPreview && !answeredQuestionIds.has(questionId)) return null;
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
    isTeacherPreview,
    lessonName: topic.name,
    questions: (questions || []).map((question) => ({
      ...question,
      QuestionOption: (options || []).filter((option) => option.question_id === question.id).map(({ id, question_id, text, option_order }) => ({ id, question_id, text, option_order })),
      feedback: feedbackFor(question.id),
    })),
    answers: answers || [],
  };
}

