import type { QuestionDraft } from "@/app/actions/question-authoring-actions";
import type { BankTopic } from "@/components/admin/question-bank-types";

export function parseBulkQuestionImport(bulkData: string, topics: BankTopic[]) {
  const lines = bulkData.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const drafts: QuestionDraft[] = [];
  const skipped: string[] = [];

  for (const [index, line] of lines.entries()) {
    const columns = line.split("|").map((column) => column.trim());
    if (columns.length < 7) {
      skipped.push(`Line ${index + 1}: expected at least 7 pipe-separated fields.`);
      continue;
    }
    const [topicName, text, ...rest] = columns;
    const [optionA, optionB, optionC, optionD, correctIndex, pointValue] = rest;
    const topic = topics.find((candidate) => candidate.name.toLocaleLowerCase() === topicName.toLocaleLowerCase());
    const correctNumber = Number(correctIndex);
    if (!topic) {
      skipped.push(`Line ${index + 1}: lesson “${topicName}” was not found.`);
      continue;
    }
    if (!text || [optionA, optionB, optionC, optionD].some((option) => !option) || ![1, 2, 3, 4].includes(correctNumber)) {
      skipped.push(`Line ${index + 1}: question, four choices, and a correct choice from 1–4 are required.`);
      continue;
    }
    drafts.push({
      topic_id: topic.id,
      text,
      points: pointValue ? Number(pointValue) : 10,
      options: [optionA, optionB, optionC, optionD].map((option, optionIndex) => ({ text: option, is_correct: optionIndex + 1 === correctNumber })),
    });
  }

  return { drafts, skipped };
}
