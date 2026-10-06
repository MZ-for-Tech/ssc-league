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

export async function loadAdminQuestionBank(seasonId: string) {
  const { adminClient } = await requireAdmin();
  const { data: season, error: seasonError } = await adminClient
    .from("Season").select("id, status").eq("id", seasonId).maybeSingle();
  if (seasonError || !season || !["active", "archived"].includes(season.status)) {
    throw new Error("That season's question bank is unavailable.");
  }

  const [{ data: topics, error: topicError }, { data: modules, error: moduleError }, { data: questions, error: questionError }, { data: essays, error: essayError }] = await Promise.all([
    adminClient.from("Topic").select("id, name, description, week_number, module_id, lesson_number").eq("season_id", seasonId).order("week_number"),
    adminClient.from("Module").select("id, module_number, name").eq("season_id", seasonId).order("display_order"),
    adminClient.from("Question").select("id, topic_id, text, points, explanation, bank_item_id, display_order, created_at, bloom_level, stimulus_asset_url, stimulus_asset_alt").eq("season_id", seasonId).order("topic_id").order("display_order", { ascending: true, nullsFirst: false }).order("created_at"),
    adminClient.from("EssayQuestion").select("id, topic_id, prompt, response_type, stimulus_asset_url, stimulus_asset_alt, display_order").eq("season_id", seasonId).order("topic_id").order("display_order"),
  ]);
  if (topicError) throw topicError;
  if (moduleError) throw moduleError;
  if (questionError) throw questionError;
  if (essayError) throw essayError;

  const questionIds = (questions || []).map((question) => question.id);
  // Keep `in(...)` filters well below Node/PostgREST URL and header limits.
  const questionIdBatchSize = 200;
  const questionIdBatches = Array.from({ length: Math.ceil(questionIds.length / questionIdBatchSize) }, (_, index) =>
    questionIds.slice(index * questionIdBatchSize, (index + 1) * questionIdBatchSize),
  );
  const optionPageSize = 1000;
  const [optionBatches, answerBatches] = await Promise.all([
    Promise.all(questionIdBatches.map(async (ids) => {
      const rows: Array<{ id: string; question_id: string; text: string; is_correct: boolean; justification: string | null; option_order: number | null; created_at: string }> = [];
      for (let offset = 0; ; offset += optionPageSize) {
        const { data: page, error } = await adminClient.from("QuestionOption")
          .select("id, question_id, text, is_correct, justification, option_order, created_at")
          .eq("season_id", seasonId).in("question_id", ids)
          .order("question_id").order("option_order", { ascending: true, nullsFirst: false }).order("created_at")
          .range(offset, offset + optionPageSize - 1);
        if (error) throw error;
        rows.push(...(page || []));
        if (!page || page.length < optionPageSize) break;
      }
      return rows;
    })),
    Promise.all(questionIdBatches.map(async (ids) => {
      const rows: Array<{ question_id: string }> = [];
      for (let offset = 0; ; offset += optionPageSize) {
        const { data: page, error } = await adminClient.from("StudentAnswer").select("question_id")
          .eq("season_id", seasonId).in("question_id", ids).range(offset, offset + optionPageSize - 1);
        if (error) throw error;
        rows.push(...(page || []));
        if (!page || page.length < optionPageSize) break;
      }
      return rows;
    })),
  ]);
  const options = optionBatches.flat();

  const topicById = new Map((topics || []).map((topic) => [topic.id, topic]));
  const moduleById = new Map((modules || []).map((module) => [module.id, module]));
  const topicLabels = Object.fromEntries((topics || []).map((topic) => {
    const moduleRecord = topic.module_id ? moduleById.get(topic.module_id) : null;
    return [topic.id, moduleRecord
      ? `Module ${moduleRecord.module_number} · Lesson ${moduleRecord.module_number}.${topic.lesson_number} · ${topic.name}`
      : `Week ${topic.week_number} · ${topic.name}`];
  }));
  const attemptsByQuestion = new Map<string, number>();
  for (const answer of answerBatches.flat()) {
    attemptsByQuestion.set(answer.question_id, (attemptsByQuestion.get(answer.question_id) || 0) + 1);
  }

  const optionsByQuestion = new Map<string, typeof options>();
  for (const option of options) {
    const questionOptions = optionsByQuestion.get(option.question_id) || [];
    questionOptions.push(option);
    optionsByQuestion.set(option.question_id, questionOptions);
  }

  return {
    topics: topics || [],
    modules: modules || [],
    questions: (questions || []).map((question) => ({
      ...question,
      topic_name: topicById.get(question.topic_id)?.name || "Unassigned lesson",
      topic_label: topicLabels[question.topic_id] || "Unassigned lesson",
      topic_week_number: topicById.get(question.topic_id)?.week_number || Number.MAX_SAFE_INTEGER,
      module_number: topicById.get(question.topic_id)?.module_id
        ? moduleById.get(topicById.get(question.topic_id)!.module_id!)?.module_number || null
        : null,
      attempts: attemptsByQuestion.get(question.id) || 0,
      options: optionsByQuestion.get(question.id) || [],
    })),
    essays: essays || [],
  };
}

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
