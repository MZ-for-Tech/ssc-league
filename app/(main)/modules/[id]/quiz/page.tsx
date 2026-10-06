"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle, Trophy, Loader2, Zap, Target, Terminal, XCircle, Crosshair } from "lucide-react";
import clsx from "clsx";
import PythonCodeBlock from "@/components/PythonCodeBlock";
import PythonPlayground from "@/components/PythonPlayground";
import ReportButton from "@/components/ReportButton";
import PageHeader from "@/components/PageHeader";
import { useLeagueSeasonId } from "@/components/LeagueSeasonContext";
import { loadActiveQuiz, submitQuizAnswer } from "@/app/actions/quiz-actions";

// --- TYPES ---
type Option = { id: string; text: string };
type OptionFeedback = { optionId: string; isCorrect: boolean; justification: string | null };
type QuizFeedback = { correctOptionId: string | null; optionFeedback: OptionFeedback[] };
type Question = { id: string; text: string; points: number; stimulus_code: string | null; stimulus_asset_url: string | null; stimulus_asset_alt: string | null; QuestionOption: Option[]; feedback: QuizFeedback | null };

type AnswerRecord = {
    question_id: string;
    selected_option_id: string;
    is_correct: boolean;
};

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const router = useRouter();
  const selectedSeasonId = useLeagueSeasonId();
  
  // State
  const [studentDbId, setStudentDbId] = useState<string | null>(null);
  const [activeSeasonId, setActiveSeasonId] = useState<string | null>(null);
  const [isTeacherPreview, setIsTeacherPreview] = useState(false);
  const [lessonName, setLessonName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answersMap, setAnswersMap] = useState<Record<string, AnswerRecord>>({});
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const [score, setScore] = useState(0);
  const [quizState, setQuizState] = useState<"loading" | "active" | "finished">("loading");
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [feedback, setFeedback] = useState<QuizFeedback | null>(null);
  const [loadMessage, setLoadMessage] = useState<string | null>(null);

  // 1. Initialization
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
      
      quizData.answers.forEach((ans: AnswerRecord) => {
          loadedAnswers[ans.question_id] = ans;
          if (ans.is_correct) initialScore += 2; else initialScore += 1;
      });

      setAnswersMap(loadedAnswers);
      setScore(initialScore);

      // Restore state for first question
      if (typedQuestions.length > 0) {
          const firstQ = typedQuestions[0];
          if (loadedAnswers[firstQ.id]) {
              setSelectedOption(loadedAnswers[firstQ.id].selected_option_id);
              setShowFeedback(true);
              setIsLocked(true);
              setFeedback(firstQ.feedback);
          }
      }

      setQuizState("active");
      } catch (error) {
        setLoadMessage(error instanceof Error ? error.message : "Could not load this lesson.");
      }
    };

    initPage();
  }, [id, router, selectedSeasonId]);

  // --- NEW: NAVIGATION FUNCTION ---
  const jumpToQuestion = (index: number) => {
    if (index < 0 || index >= questions.length) return;

    const targetQ = questions[index];
    const existingAns = answersMap[targetQ.id];

    // Restore state based on whether the target question is answered
    if (existingAns) {
        setSelectedOption(existingAns.selected_option_id);
        setShowFeedback(true);
        setIsLocked(true);
        setFeedback(targetQ.feedback);
    } else {
        setSelectedOption(null);
        setShowFeedback(false);
        setIsLocked(false);
        setFeedback(null);
    }
    setCurrentQIndex(index);
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
        jumpToQuestion(currentQIndex + 1);
    } else {
        setQuizState("finished");
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption || isLocked) return;
    const currentQ = questions[currentQIndex];
    if (isTeacherPreview) {
      const teacherFeedback = currentQ.feedback;
      if (!teacherFeedback?.correctOptionId) {
        setLoadMessage("The answer key for this question is unavailable.");
        return;
      }
      const isCorrect = teacherFeedback.correctOptionId === selectedOption;
      setFeedback(teacherFeedback);
      setAnswersMap((previous) => ({
        ...previous,
        [currentQ.id]: { question_id: currentQ.id, selected_option_id: selectedOption, is_correct: isCorrect },
      }));
      setShowFeedback(true);
      setIsLocked(true);
      return;
    }
    if (!studentDbId || !activeSeasonId) return;
    setIsSubmitting(true);

    try {
      const result = await submitQuizAnswer(currentQ.id, selectedOption);
      const isCorrect = result.isCorrect;
      setScore((prev) => prev + (isCorrect ? 2 : 1));
      setFeedback({ correctOptionId: result.correctOptionId, optionFeedback: result.optionFeedback });
      setAnswersMap((prev) => ({
        ...prev,
        [currentQ.id]: { question_id: currentQ.id, selected_option_id: selectedOption, is_correct: isCorrect },
      }));
      setShowFeedback(true);
      setIsLocked(true);
    } catch (error) {
      setLoadMessage(error instanceof Error ? error.message : "Could not save this answer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (quizState === "loading" && loadMessage) return <div className="instrument-panel mx-auto mt-12 max-w-xl border border-danger/25 bg-surface/70 p-6 text-center"><p className="text-foreground">{loadMessage}</p><button onClick={() => router.push(`/modules/${id}`)} className="console-control mt-4 inline-flex min-h-11 items-center gap-2 border border-primary/25 px-4 text-sm font-semibold text-primary">Back to module <ArrowRight size={16} /></button></div>;
  if (quizState === "loading") return <div className="instrument-panel flex h-[50vh] items-center justify-center border border-primary/15 bg-surface/35 text-primary" aria-label="Loading quiz"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  if (!questions.length) return <div className="instrument-panel mx-auto mt-12 max-w-xl border border-border bg-surface/70 p-6 text-center"><p className="font-semibold text-foreground">No multiple-choice questions are available for this lesson yet.</p><Link href={`/modules/${id}/essays`} className="console-control mt-4 inline-flex min-h-11 items-center gap-2 border border-primary/25 px-4 text-sm font-semibold text-primary">Open written responses <ArrowRight size={16} /></Link></div>;
  
  if (quizState === "finished") {
    return (
      <div className="instrument-panel relative isolate mx-auto mt-8 max-w-2xl overflow-hidden rounded-2xl border border-primary/25 bg-[linear-gradient(125deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] p-6 text-center shadow-2xl shadow-black/20 animate-in zoom-in-95 sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgb(var(--primary)/0.13),transparent_60%)]" />
        <div className="mb-6 flex justify-center">
            <div className="instrument-panel border border-primary/40 bg-primary/10 p-4 shadow-glow-primary-subtle"><Trophy className="h-14 w-14 text-primary sm:h-16 sm:w-16" /></div>
        </div>
        <p className="font-mono text-xs font-bold uppercase tracking-[.18em] text-primary">Mission report</p>
        <h2 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">{isTeacherPreview ? "Practice complete" : "Quiz complete"}</h2>
        <p className="mb-8 mt-2 text-muted">{isTeacherPreview ? "You’ve reached the end of the questions. No answers were saved." : "Your result has been saved."}</p>
        {!isTeacherPreview && <div className="mb-8 grid grid-cols-2 gap-3">
            <div className="instrument-panel border border-border/80 bg-background/40 p-4">
                <div className="mb-1 font-mono text-xs uppercase tracking-wider text-muted">Questions</div>
                <div className="font-mono text-2xl font-bold text-foreground">{questions.length}</div>
            </div>
            <div className="instrument-panel border border-warning/20 bg-warning/[.06] p-4">
                <div className="mb-1 font-mono text-xs uppercase tracking-wider text-muted">XP earned</div>
                <div className="font-mono text-2xl font-bold text-warning">+{score}</div>
            </div>
        </div>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href={`/modules/${id}/essays`} className="console-control inline-flex min-h-12 w-full items-center justify-center bg-primary px-4 py-3 text-center text-sm font-black text-background transition-all hover:bg-primary-dim">Continue to written responses</Link>
          <button onClick={() => router.push("/modules")} className="console-control min-h-12 w-full border border-border bg-surface/70 px-4 py-3 font-bold text-foreground transition-all hover:border-primary/35 hover:bg-primary/5">Return to modules</button>
        </div>
      </div>
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
        
        {/* Left Col */}
        <div className="min-w-0 space-y-5">
            <section className="instrument-panel relative isolate overflow-hidden rounded-2xl border border-primary/20 bg-[linear-gradient(125deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] p-4 shadow-xl shadow-black/20 sm:p-8">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_88%_0%,rgb(var(--primary)/0.11),transparent_46%)]" />
                <div className="absolute inset-x-0 top-0 h-1 bg-surface-light/70"><div className="h-full bg-gradient-to-r from-cyan-500 via-primary to-fuchsia-400 shadow-glow-primary-subtle transition-all duration-500" style={{ width: `${progressPercent}%` }} /></div>

                <div className="mb-4 mt-1 sm:mb-8 sm:mt-2">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4 sm:gap-3">
                        <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.14em] text-primary sm:text-xs sm:tracking-[.16em]"><span className="grid h-7 w-7 place-items-center border border-primary/30 bg-primary/10">{String(currentQIndex + 1).padStart(2, "0")}</span> Question</span>
                        {!isTeacherPreview && <span className="console-control inline-flex min-h-7 items-center border border-warning/20 bg-warning/[.06] px-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-warning sm:min-h-8 sm:px-3 sm:text-xs">+2 XP</span>}
                    </div>
                    <h2 className="whitespace-pre-wrap text-base font-semibold leading-6 text-foreground sm:text-2xl sm:leading-relaxed">{currentQ.text}</h2>
                    {currentQ.stimulus_code && <PythonCodeBlock code={currentQ.stimulus_code} />}
                    {currentQ.stimulus_asset_url && <figure className="instrument-panel my-6 overflow-hidden border border-primary/15 bg-background/60 p-3"><Image unoptimized width={1200} height={800} src={currentQ.stimulus_asset_url} alt={currentQ.stimulus_asset_alt || currentQ.text} className="mx-auto h-auto max-h-[32rem] w-full object-contain" priority /><figcaption className="mt-2 text-center font-mono text-xs uppercase tracking-wider text-muted">Lesson visual</figcaption></figure>}
                    {currentQ.stimulus_code && (<div className="mt-8 border-t border-primary/15 pt-6"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><span className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-primary"><Terminal size={13} /> Optional Python sandbox</span><span className="text-xs text-muted">Runs in this browser</span></div><PythonPlayground initialCode={currentQ.stimulus_code} /></div>)}
                </div>

                <div className="grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 sm:grid-cols-1 sm:gap-3">
                    {currentQ.QuestionOption.map((opt, optionIndex) => {
                        const optionFeedback = feedback?.optionFeedback.find((item) => item.optionId === opt.id);
                        let borderClass = "border-border/80 hover:border-primary/35", bgClass = "bg-background/25 hover:bg-primary/[.035]", textClass = "text-slate-300", Icon = null;
                        if (showFeedback) {
                            if (feedback?.correctOptionId === opt.id || (selectedOption === opt.id && currentAnswer?.is_correct)) { borderClass = "border-success/50"; bgClass = "bg-success/10"; textClass = "text-success"; Icon = <CheckCircle className="text-success" size={20} />; }
                            else if (selectedOption === opt.id) { borderClass = "border-danger/50"; bgClass = "bg-danger/10"; textClass = "text-danger"; Icon = <XCircle className="text-danger" size={20} />; }
                            else { bgClass = "bg-background/15 opacity-55"; }
                        } else if (selectedOption === opt.id) { 
                            borderClass = "border-primary"; bgClass = "bg-primary/10"; textClass = "text-foreground"; Icon = <CheckCircle className="text-primary" size={20} />; 
                        }

                        return (
                            <div key={opt.id} className={`instrument-panel relative isolate overflow-hidden rounded-xl border transition-all duration-200 ${borderClass} ${bgClass}`}>
                                {selectedOption === opt.id && !showFeedback && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-primary shadow-glow-primary" />}
                                <button onClick={() => !isLocked && setSelectedOption(opt.id)} disabled={isLocked || isSubmitting} aria-pressed={selectedOption === opt.id} className={clsx("flex min-h-12 w-full items-center gap-2 p-2.5 text-left sm:min-h-14 sm:gap-4 sm:p-4", isLocked ? "cursor-default" : "cursor-pointer")}>
                                    <span className={clsx("grid h-7 w-7 shrink-0 place-items-center border font-mono text-[10px] font-bold sm:h-8 sm:w-8 sm:text-xs", selectedOption === opt.id ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-surface/70 text-muted")}>{String.fromCharCode(65 + optionIndex)}</span>
                                    <span className={`min-w-0 flex-1 text-sm font-medium leading-5 sm:text-base sm:leading-6 ${textClass}`}>{opt.text}</span>{Icon}
                                </button>
                                {showFeedback && optionFeedback?.justification && <div className="border-t border-border/50 px-4 py-3 text-sm leading-6 text-muted"><span className={clsx("mr-2 text-xs font-bold uppercase tracking-wider", optionFeedback.isCorrect ? "text-success" : "text-primary")}>{optionFeedback.isCorrect ? "Why this is correct" : "Why this choice is incorrect"}</span>{optionFeedback.justification}</div>}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 flex flex-col items-stretch gap-2.5 border-t border-primary/15 pt-3 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-5">
                    {isTeacherPreview ? <span className="hidden text-xs text-muted sm:inline">Teacher preview · answers are not recorded</span> : <ReportButton questionId={currentQ.id} studentId={studentDbId!} seasonId={activeSeasonId!} />}
                    {!isLocked ? (
                        <button onClick={handleSubmit} disabled={!selectedOption || isSubmitting} className={clsx("console-control inline-flex min-h-12 w-full items-center justify-center gap-1 px-6 py-3 font-black transition-all sm:w-auto", !selectedOption || isSubmitting ? "border border-border bg-surface/70 text-muted cursor-not-allowed" : "bg-primary text-background shadow-lg shadow-primary/20 hover:bg-primary-dim")}>
                            {isSubmitting ? "Processing..." : <>{isTeacherPreview ? "CHECK ANSWER" : "CONFIRM ENTRY"} <ArrowRight className="ml-2 w-4 h-4" /></>}
                        </button>
                    ) : (
                        <button onClick={handleNext} className="console-control inline-flex min-h-12 w-full items-center justify-center gap-1 bg-success px-6 py-3 font-black text-slate-950 shadow-lg shadow-success/20 transition-all hover:bg-success/80 animate-in fade-in sm:w-auto">
                            {currentQIndex < questions.length - 1 ? "Next question" : isTeacherPreview ? "Finish practice" : "Finish quiz"} <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                    )}
                </div>
            </section>
        </div>

        {/* Right Col: Stats & Map */}
        <aside className="min-w-0 space-y-5">
            <section className="instrument-panel relative isolate overflow-hidden rounded-2xl border border-primary/15 bg-[linear-gradient(135deg,rgb(var(--surface-hero)),rgb(var(--surface))_60%,rgb(var(--surface-node)))] p-5 shadow-lg shadow-black/20 sm:p-6">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_100%_0%,rgb(var(--primary)/0.1),transparent_58%)]" />
                <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-[.16em] text-primary">{isTeacherPreview ? "Practice" : "Session stats"}</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 border border-border/80 bg-background/35 p-3">
                        <div className="border border-warning/20 bg-warning/10 p-2.5 text-warning"><Zap size={18} /></div>
                        <div><div className="font-mono text-xs uppercase tracking-wider text-muted">{isTeacherPreview ? "Question" : "Current score"}</div><div className="font-mono text-lg font-bold text-foreground">{isTeacherPreview ? `${currentQIndex + 1} / ${questions.length}` : `${score} XP`}</div></div>
                    </div>
                    <div className="flex items-center gap-3 border border-border/80 bg-background/35 p-3">
                        <div className="border border-success/20 bg-success/10 p-2.5 text-success"><Target size={18} /></div>
                        <div><div className="font-mono text-xs uppercase tracking-wider text-muted">{isTeacherPreview ? "XP" : "Remaining"}</div><div className="font-mono text-lg font-bold text-foreground">{isTeacherPreview ? "None" : `${questions.length - currentQIndex} Qs`}</div></div>
                    </div>
                </div>
                <div className="mt-4 border-t border-primary/15 pt-4">
                  <div className="mb-2 flex items-center justify-between font-mono text-xs uppercase tracking-wider"><span className="text-muted">Mission progress</span><span className="text-primary">{Math.round(progressPercent)}%</span></div>
                  <div className="h-1.5 overflow-hidden bg-surface-light/50"><div className="h-full bg-gradient-to-r from-cyan-500 to-primary shadow-glow-primary-subtle" style={{ width: `${progressPercent}%` }} /></div>
                </div>
            </section>

            <section className="instrument-panel relative isolate hidden overflow-hidden rounded-2xl border border-border bg-[linear-gradient(135deg,rgb(var(--surface-hero)),rgb(var(--surface))_60%,rgb(var(--surface-node)))] p-5 shadow-lg shadow-black/20 lg:block sm:p-6">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-[.045]" />
                <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-[.16em] text-muted">Question map <span className="ml-1 text-primary">· {questions.length} items</span></h3>
                <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => {
                        let mapClass = "border-border/80 bg-background/45 text-muted hover:border-primary/35 hover:bg-primary/[.06] hover:text-foreground cursor-pointer";
                        const ans = answersMap[q.id];
                        
                        if (idx === currentQIndex) {
                            mapClass = "border-primary/70 bg-primary/15 text-primary shadow-[0_0_16px_rgb(var(--primary)/.13)] cursor-default";
                        } else if (ans) {
                            mapClass = ans.is_correct 
                                ? "border-success/35 bg-success/[.09] text-success hover:bg-success/15"
                                : "border-danger/35 bg-danger/[.09] text-danger hover:bg-danger/15";
                        }

                        return (
                            <button 
                                key={idx} 
                                onClick={() => jumpToQuestion(idx)}
                                className={clsx("console-control h-10 flex items-center justify-center border font-mono text-xs font-bold transition-all", mapClass)}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>
            </section>
        </aside>
      </div>
    </div>
  );
}
