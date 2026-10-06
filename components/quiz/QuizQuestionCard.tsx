"use client";

import Image from "next/image";
import { ArrowRight, CheckCircle, Terminal, XCircle } from "lucide-react";
import clsx from "clsx";
import PythonCodeBlock from "@/components/PythonCodeBlock";
import PythonPlayground from "@/components/PythonPlayground";
import ReportButton from "@/components/ReportButton";
import type { AnswerRecord, Question, QuizFeedback } from "@/components/quiz/quiz-types";

type QuizQuestionCardProps = {
  currentQ: Question;
  currentQIndex: number;
  questions: Question[];
  currentAnswer: AnswerRecord | undefined;
  progressPercent: number;
  feedback: QuizFeedback | null;
  showFeedback: boolean;
  selectedOption: string | null;
  isLocked: boolean;
  isSubmitting: boolean;
  isTeacherPreview: boolean;
  studentDbId: string | null;
  activeSeasonId: string | null;
  onSelectOption: (optionId: string) => void;
  onSubmit: () => void;
  onNext: () => void;
};

export default function QuizQuestionCard({
  currentQ, currentQIndex, questions, currentAnswer, progressPercent, feedback, showFeedback, selectedOption, isLocked,
  isSubmitting, isTeacherPreview, studentDbId, activeSeasonId, onSelectOption, onSubmit, onNext,
}: QuizQuestionCardProps) {
  return (
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
                                <button onClick={() => !isLocked && onSelectOption(opt.id)} disabled={isLocked || isSubmitting} aria-pressed={selectedOption === opt.id} className={clsx("flex min-h-12 w-full items-center gap-2 p-2.5 text-left sm:min-h-14 sm:gap-4 sm:p-4", isLocked ? "cursor-default" : "cursor-pointer")}>
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
                        <button onClick={onSubmit} disabled={!selectedOption || isSubmitting} className={clsx("console-control inline-flex min-h-12 w-full items-center justify-center gap-1 px-6 py-3 font-black transition-all sm:w-auto", !selectedOption || isSubmitting ? "border border-border bg-surface/70 text-muted cursor-not-allowed" : "bg-primary text-background shadow-lg shadow-primary/20 hover:bg-primary-dim")}>
                            {isSubmitting ? "Processing..." : <>{isTeacherPreview ? "CHECK ANSWER" : "CONFIRM ENTRY"} <ArrowRight className="ml-2 w-4 h-4" /></>}
                        </button>
                    ) : (
                        <button onClick={onNext} className="console-control inline-flex min-h-12 w-full items-center justify-center gap-1 bg-success px-6 py-3 font-black text-slate-950 shadow-lg shadow-success/20 transition-all hover:bg-success/80 animate-in fade-in sm:w-auto">
                            {currentQIndex < questions.length - 1 ? "Next question" : isTeacherPreview ? "Finish practice" : "Finish quiz"} <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                    )}
                </div>
            </section>
        </div>
  );
}
