"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createQuestionWithOptions,
  createQuestionsBulk,
} from "@/app/actions/question-authoring-actions";
import type { BankTopic } from "@/components/admin/question-bank-types";
import { parseBulkQuestionImport } from "@/lib/question-import-parser";

type QuestionOptionDraft = { text: string; is_correct: boolean; justification: string };
type Notice = { text: string; kind: "success" | "error" };

const emptyOptions = (): QuestionOptionDraft[] => Array.from({ length: 4 }, (_, index) => ({
  text: "",
  is_correct: index === 0,
  justification: "",
}));

type UseQuestionAuthoringOptions = {
  topics: BankTopic[];
  selectedTopicId: string;
  refreshBank: () => Promise<void>;
  onQuestionAdded: (topicId: string, questionText: string) => void;
  onImportComplete: () => void;
};

export function useQuestionAuthoring({
  topics,
  selectedTopicId,
  refreshBank,
  onQuestionAdded,
  onImportComplete,
}: UseQuestionAuthoringOptions) {
  const router = useRouter();
  const [questionText, setQuestionText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [points, setPoints] = useState(10);
  const [draftTopicId, setDraftTopicId] = useState("");
  const [options, setOptions] = useState<QuestionOptionDraft[]>(emptyOptions);
  const [bulkData, setBulkData] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeDraftTopicId = draftTopicId || topics[0]?.id || "";

  function updateOption(index: number, changes: Partial<QuestionOptionDraft>) {
    setOptions((current) => current.map((option, optionIndex) => optionIndex === index ? { ...option, ...changes } : option));
  }

  async function handleAddQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!activeDraftTopicId) {
      setFormError("Choose a lesson for this question.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createQuestionWithOptions({
        topic_id: activeDraftTopicId,
        text: questionText,
        points,
        explanation,
        options,
      });
      setNotice({ text: "Question added to the bank.", kind: "success" });
      onQuestionAdded(activeDraftTopicId, questionText);
      setQuestionText("");
      setExplanation("");
      setPoints(10);
      setOptions(emptyOptions());
      await refreshBank();
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "The question could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleBulkImport() {
    setNotice(null);
    const { drafts, skipped } = parseBulkQuestionImport(bulkData, topics);

    if (!drafts.length) {
      setNotice({ text: skipped.join(" ") || "Paste at least one question to import.", kind: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createQuestionsBulk(drafts);
      const messages = [`Added ${result.success} question${result.success === 1 ? "" : "s"}.`];
      if (result.failed) messages.push(`${result.failed} failed: ${result.errors.slice(0, 3).join(" ")}`);
      if (skipped.length) messages.push(`${skipped.length} line${skipped.length === 1 ? "" : "s"} skipped: ${skipped.slice(0, 2).join(" ")}`);
      setNotice({ text: messages.join(" "), kind: result.failed || skipped.length ? "error" : "success" });
      if (result.success) {
        setBulkData("");
        onImportComplete();
        await refreshBank();
        router.refresh();
      }
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "The import failed.", kind: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  function openAddQuestion() {
    setDraftTopicId(selectedTopicId || topics[0]?.id || "");
    setFormError(null);
  }

  return {
    activeDraftTopicId,
    questionText,
    explanation,
    points,
    options,
    bulkData,
    formError,
    notice,
    isSubmitting,
    handleAddQuestion,
    handleBulkImport,
    openAddQuestion,
    updateOption,
    setQuestionText,
    setExplanation,
    setPoints,
    setDraftTopicId,
    setBulkData,
    setOptions,
    setFormError,
    setNotice,
  };
}
