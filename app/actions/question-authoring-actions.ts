"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";

export type QuestionDraft = {
  topic_id: string;
  text: string;
  points: number;
  explanation?: string;
  options: {
    text: string;
    is_correct: boolean;
    justification?: string;
  }[];
};

function validateQuestion(question: QuestionDraft) {
  if (!question.topic_id || !question.text.trim()) {
    throw new Error("A topic and question text are required.");
  }

  if (!Number.isInteger(question.points) || question.points < 0) {
    throw new Error("Question points must be a non-negative integer.");
  }

  if (question.options.length < 2 || question.options.some(option => !option.text.trim())) {
    throw new Error("At least two non-empty answer options are required.");
  }

  if (question.options.some(option => !option.justification?.trim())) {
    throw new Error("Add a rationale for every answer option, including why each distractor is incorrect.");
  }

  if (question.options.filter(option => option.is_correct).length !== 1) {
    throw new Error("Exactly one answer option must be marked correct.");
  }
}

async function insertQuestion(
  supabaseAdmin: Awaited<ReturnType<typeof requireAdmin>>["adminClient"],
  question: QuestionDraft,
  seasonId: string
) {
  validateQuestion(question);

  const { data: topic } = await supabaseAdmin.from("Topic").select("id").eq("id", question.topic_id).eq("season_id", seasonId).maybeSingle();
  if (!topic) throw new Error("Choose a topic from the active season.");

  const { data: lastQuestion, error: orderError } = await supabaseAdmin.from("Question")
    .select("display_order").eq("season_id", seasonId).eq("topic_id", question.topic_id)
    .not("display_order", "is", null).order("display_order", { ascending: false }).limit(1).maybeSingle();
  if (orderError) throw orderError;

  const { data: created, error: questionError } = await supabaseAdmin
    .from("Question")
    .insert({
      text: question.text.trim(),
      topic_id: question.topic_id,
      points: question.points,
      display_order: (lastQuestion?.display_order || 0) + 1,
      explanation: question.explanation?.trim() || null,
      season_id: seasonId,
    })
    .select("id")
    .single();

  if (questionError) throw questionError;

  const { error: optionsError } = await supabaseAdmin
    .from("QuestionOption")
    .insert(question.options.map((option, index) => ({
      question_id: created.id,
      season_id: seasonId,
      option_order: index + 1,
      text: option.text.trim(),
      is_correct: option.is_correct,
      justification: option.justification?.trim() || "",
    })));

  if (optionsError) {
    await supabaseAdmin.from("Question").delete().eq("id", created.id);
    throw optionsError;
  }

  return created.id;
}

export async function createQuestionWithOptions(question: QuestionDraft) {
  const { adminClient, activeSeasonId } = await requireAdmin();
  await insertQuestion(adminClient, question, activeSeasonId);
  revalidatePath("/admin/questions");
  return { success: true };
}

export async function createQuestionsBulk(questions: QuestionDraft[]) {
  const { adminClient, activeSeasonId } = await requireAdmin();
  const result = { success: 0, failed: 0, errors: [] as string[] };

  for (const [index, question] of questions.entries()) {
    try {
      await insertQuestion(adminClient, question, activeSeasonId);
      result.success++;
    } catch (error) {
      result.failed++;
      result.errors.push(`Question ${index + 1}: ${error instanceof Error ? error.message : "Upload failed."}`);
    }
  }

  revalidatePath("/admin/questions");
  return result;
}
