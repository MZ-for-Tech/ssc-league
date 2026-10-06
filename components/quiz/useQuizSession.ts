"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { submitQuizAnswer } from "@/app/actions/quiz-actions";
import { loadActiveQuiz } from "@/app/actions/quiz-loading-actions";
import type { AnswerRecord, Question, QuizFeedback } from "@/components/quiz/quiz-types";

type QuizState = "loading" | "active" | "finished";

export function useQuizSession(id: string, selectedSeasonId: string | null) {
  const router = useRouter();
  const [studentDbId, setStudentDbId] = useState<string | null>(null);
  const [activeSeasonId, setActiveSeasonId] = useState<string | null>(null);
  const [isTeacherPreview, setIsTeacherPreview] = useState(false);
  const [lessonName, setLessonName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answersMap, setAnswersMap] = useState<Record<string, AnswerRecord>>({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [feedback, setFeedback] = useState<QuizFeedback | null>(null);
  const [loadMessage, setLoadMessage] = useState<string | null>(null);

  useEffect(() => {
    const initPage = async () => {
      try {
        const quizData = await loadActiveQuiz(id);
        if (selectedSeasonId && selectedSeasonId !== quizData.seasonId) {
          router.replace(`/modules/${id}`);
          return;
        }
        setActiveSeasonId(quizData.seasonId);
        setStudentDbId(quizData.studentId);
        setIsTeacherPreview(quizData.isTeacherPreview);
        setLessonName(quizData.lessonName);

        const typedQuestions = quizData.questions as Question[];
        setQuestions(typedQuestions);
        const loadedAnswers: Record<string, AnswerRecord> = {};
        let initialScore = 0;
        quizData.answers.forEach((answer: AnswerRecord) => {
          loadedAnswers[answer.question_id] = answer;
          if (answer.is_correct) initialScore += 2;
          else initialScore += 1;
        });
        setAnswersMap(loadedAnswers);
        setScore(initialScore);

        if (typedQuestions.length > 0) {
          const firstQuestion = typedQuestions[0];
          if (loadedAnswers[firstQuestion.id]) {
            setSelectedOption(loadedAnswers[firstQuestion.id].selected_option_id);
            setShowFeedback(true);
            setIsLocked(true);
            setFeedback(firstQuestion.feedback);
          }
        }
        setQuizState("active");
      } catch (error) {
        setLoadMessage(error instanceof Error ? error.message : "Could not load this lesson.");
      }
    };

    void initPage();
  }, [id, router, selectedSeasonId]);

  const jumpToQuestion = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    const targetQuestion = questions[index];
    const existingAnswer = answersMap[targetQuestion.id];
    if (existingAnswer) {
      setSelectedOption(existingAnswer.selected_option_id);
      setShowFeedback(true);
      setIsLocked(true);
      setFeedback(targetQuestion.feedback);
    } else {
      setSelectedOption(null);
      setShowFeedback(false);
      setIsLocked(false);
      setFeedback(null);
    }
    setCurrentQIndex(index);
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) jumpToQuestion(currentQIndex + 1);
    else setQuizState("finished");
  };

  const handleSubmit = async () => {
    if (!selectedOption || isLocked) return;
    const currentQuestion = questions[currentQIndex];
    if (isTeacherPreview) {
      const teacherFeedback = currentQuestion.feedback;
      if (!teacherFeedback?.correctOptionId) {
        setLoadMessage("The answer key for this question is unavailable.");
        return;
      }
      const isCorrect = teacherFeedback.correctOptionId === selectedOption;
      setFeedback(teacherFeedback);
      setAnswersMap((previous) => ({
        ...previous,
        [currentQuestion.id]: { question_id: currentQuestion.id, selected_option_id: selectedOption, is_correct: isCorrect },
      }));
      setShowFeedback(true);
      setIsLocked(true);
      return;
    }
    if (!studentDbId || !activeSeasonId) return;
    setIsSubmitting(true);
    try {
      const result = await submitQuizAnswer(currentQuestion.id, selectedOption);
      const isCorrect = result.isCorrect;
      setScore((previous) => previous + (isCorrect ? 2 : 1));
      setFeedback({ correctOptionId: result.correctOptionId, optionFeedback: result.optionFeedback });
      setAnswersMap((previous) => ({
        ...previous,
        [currentQuestion.id]: { question_id: currentQuestion.id, selected_option_id: selectedOption, is_correct: isCorrect },
      }));
      setShowFeedback(true);
      setIsLocked(true);
    } catch (error) {
      setLoadMessage(error instanceof Error ? error.message : "Could not save this answer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    studentDbId,
    activeSeasonId,
    isTeacherPreview,
    lessonName,
    questions,
    answersMap,
    currentQIndex,
    selectedOption,
    setSelectedOption,
    score,
    quizState,
    showFeedback,
    isSubmitting,
    isLocked,
    feedback,
    loadMessage,
    jumpToQuestion,
    handleNext,
    handleSubmit,
  };
}
