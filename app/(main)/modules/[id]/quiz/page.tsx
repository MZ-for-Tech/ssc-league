"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Target, Crosshair } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useLeagueSeasonId } from "@/components/LeagueSeasonContext";
import QuizQuestionCard from "@/components/quiz/QuizQuestionCard";
import QuizProgressSidebar from "@/components/quiz/QuizProgressSidebar";
import { QuizCompletionView } from "@/components/quiz/QuizCompletionView";
import { useQuizSession } from "@/components/quiz/useQuizSession";

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const router = useRouter();
  const selectedSeasonId = useLeagueSeasonId();
  
  const {
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
  } = useQuizSession(id, selectedSeasonId);

  if (quizState === "loading" && loadMessage) return <div className="instrument-panel mx-auto mt-12 max-w-xl border border-danger/25 bg-surface/70 p-6 text-center"><p className="text-foreground">{loadMessage}</p><button onClick={() => router.push(`/modules/${id}`)} className="console-control mt-4 inline-flex min-h-11 items-center gap-2 border border-primary/25 px-4 text-sm font-semibold text-primary">Back to module <ArrowRight size={16} /></button></div>;
  if (quizState === "loading") return <div className="instrument-panel flex h-[50vh] items-center justify-center border border-primary/15 bg-surface/35 text-primary" aria-label="Loading quiz"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  if (!questions.length) return <div className="instrument-panel mx-auto mt-12 max-w-xl border border-border bg-surface/70 p-6 text-center"><p className="font-semibold text-foreground">No multiple-choice questions are available for this lesson yet.</p><Link href={`/modules/${id}/essays`} className="console-control mt-4 inline-flex min-h-11 items-center gap-2 border border-primary/25 px-4 text-sm font-semibold text-primary">Open written responses <ArrowRight size={16} /></Link></div>;
  
  if (quizState === "finished") {
    return (
      <QuizCompletionView
        id={id}
        questionCount={questions.length}
        score={score}
        isTeacherPreview={isTeacherPreview}
        onReturnToModules={() => router.push("/modules")}
      />
    );
  }

  const currentQ = questions[currentQIndex];
  const progressPercent = ((currentQIndex + 1) / questions.length) * 100;
  const currentAnswer = answersMap[currentQ.id];

  return (
    <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-4 sm:space-y-6">
      <div className="hidden sm:block">
        <PageHeader
          title={`Quiz: ${lessonName || "Lesson"}`}
          icon={<Crosshair size={27} />}
          actions={<div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
            <span className="inline-flex min-h-10 items-center gap-2 border border-primary/20 bg-primary/[.06] px-3 text-primary"><Target size={14} /> Question {currentQIndex + 1} <span className="text-muted">/ {questions.length}</span></span>
          </div>}
        />
      </div>
      <div className="flex items-center justify-between gap-3 px-1 font-mono text-xs font-bold uppercase tracking-[.16em] text-muted sm:hidden">
        <span className="inline-flex min-w-0 items-center gap-2 text-primary"><Crosshair size={15} /><span className="truncate">Quiz: {lessonName || "Lesson"}</span></span>
        <span className="shrink-0">{currentQIndex + 1} / {questions.length}</span>
      </div>

      <div className="grid grid-cols-1 items-start gap-3 sm:gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(19rem,.8fr)]">
        
        <QuizQuestionCard
          currentQ={currentQ}
          currentQIndex={currentQIndex}
          questions={questions}
          currentAnswer={currentAnswer}
          progressPercent={progressPercent}
          feedback={feedback}
          showFeedback={showFeedback}
          selectedOption={selectedOption}
          isLocked={isLocked}
          isSubmitting={isSubmitting}
          isTeacherPreview={isTeacherPreview}
          studentDbId={studentDbId}
          activeSeasonId={activeSeasonId}
          onSelectOption={setSelectedOption}
          onSubmit={handleSubmit}
          onNext={handleNext}
        />
        <QuizProgressSidebar
          questions={questions}
          answersMap={answersMap}
          currentQIndex={currentQIndex}
          score={score}
          isTeacherPreview={isTeacherPreview}
          progressPercent={progressPercent}
          onJumpToQuestion={jumpToQuestion}
        />
      </div>
    </div>
  );
}
