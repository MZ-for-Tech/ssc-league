"use server";

import { getActiveQuizLearner } from "@/lib/quiz-access";

export async function submitQuizAnswer(questionId: string, optionId: string) {
  const { adminClient, studentId, seasonId } = await getActiveQuizLearner();
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
