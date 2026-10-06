"use client";

import { Target, Zap } from "lucide-react";
import clsx from "clsx";
import type { AnswerRecord, Question } from "@/components/quiz/quiz-types";

type QuizProgressSidebarProps = {
  questions: Question[];
  answersMap: Record<string, AnswerRecord>;
  currentQIndex: number;
  score: number;
  isTeacherPreview: boolean;
  progressPercent: number;
  onJumpToQuestion: (index: number) => void;
};

export default function QuizProgressSidebar({
  questions, answersMap, currentQIndex, score, isTeacherPreview, progressPercent, onJumpToQuestion,
}: QuizProgressSidebarProps) {
  return (
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
                                onClick={() => onJumpToQuestion(idx)}
                                className={clsx("console-control h-10 flex items-center justify-center border font-mono text-xs font-bold transition-all", mapClass)}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>
            </section>
        </aside>
  );
}
