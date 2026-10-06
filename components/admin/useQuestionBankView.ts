"use client";

import { useMemo } from "react";
import type { AdminQuestionBank } from "@/components/admin/question-bank-types";

type UseQuestionBankViewOptions = {
  bank: AdminQuestionBank | null;
  lessonSearch: string;
  search: string;
  selectedTopicId: string;
  page: number;
  pageSize: number;
};

export function useQuestionBankView({ bank, lessonSearch, search, selectedTopicId, page, pageSize }: UseQuestionBankViewOptions) {
  const topics = useMemo(() => bank?.topics ?? [], [bank]);
  const questions = useMemo(() => bank?.questions ?? [], [bank]);
  const essays = useMemo(() => bank?.essays ?? [], [bank]);
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId) || null;
  const selectedEssayCount = selectedTopic ? essays.filter((essay) => essay.topic_id === selectedTopic.id).length : 0;

  const lessonSummaries = useMemo(() => topics.map((topic) => ({
    ...topic,
    questionCount: questions.filter((question) => question.topic_id === topic.id).length,
    essayCount: essays.filter((essay) => essay.topic_id === topic.id).length,
  })), [topics, questions, essays]);

  const curriculumGroups = useMemo(() => {
    const groups = (bank?.modules || []).map((module) => ({
      id: module.id,
      number: module.module_number as number | null,
      name: module.name,
      lessons: lessonSummaries.filter((topic) => topic.module_id === module.id),
    }));
    const unassignedLessons = lessonSummaries.filter((topic) => !topic.module_id);
    if (unassignedLessons.length) groups.push({
      id: "archive",
      number: null,
      name: "Archived lessons",
      lessons: unassignedLessons,
    });
    return groups;
  }, [bank, lessonSummaries]);

  const visibleLessonGroups = useMemo(() => curriculumGroups.map((group) => ({
    ...group,
    lessons: group.lessons.filter((topic) => `${topic.name} ${topic.description || ""} ${group.name}`.toLocaleLowerCase().includes(lessonSearch.trim().toLocaleLowerCase())),
  })).filter((group) => group.lessons.length), [curriculumGroups, lessonSearch]);

  const filteredQuestions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return questions.filter((question) => {
      if (question.topic_id !== selectedTopicId) return false;
      if (!normalizedSearch) return true;
      return [question.text, question.bank_item_id || "", question.topic_label]
        .some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
    }).sort((left, right) => (left.display_order ?? Number.MAX_SAFE_INTEGER) - (right.display_order ?? Number.MAX_SAFE_INTEGER) ||
      left.created_at.localeCompare(right.created_at));
  }, [questions, search, selectedTopicId]);

  const pageCount = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const visibleQuestions = filteredQuestions.slice((page - 1) * pageSize, page * pageSize);

  return {
    topics,
    questions,
    essays,
    selectedTopic,
    selectedEssayCount,
    visibleLessonGroups,
    filteredQuestions,
    pageCount,
    visibleQuestions,
  };
}
