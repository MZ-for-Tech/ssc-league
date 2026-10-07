"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";

type QuizCompletionViewProps = {
  id: string;
  questionCount: number;
  score: number;
  isTeacherPreview: boolean;
  onReturnToModules: () => void;
};

export function QuizCompletionView({ id, questionCount, score, isTeacherPreview, onReturnToModules }: QuizCompletionViewProps) {
  return (
      <div className="instrument-panel relative isolate mx-auto mt-8 max-w-2xl overflow-hidden rounded-2xl border border-primary/25 bg-[linear-gradient(125deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] p-6 text-center shadow-2xl shadow-black/20 animate-in zoom-in-95 sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgb(var(--primary)/0.13),transparent_60%)]" />
        <div className="mb-6 flex justify-center">
            <div className="instrument-panel border border-primary/40 bg-primary/10 p-4 shadow-glow-primary-subtle"><Trophy className="h-14 w-14 text-primary sm:h-16 sm:w-16" /></div>
        </div>
        <p className="font-mono text-xs font-bold uppercase tracking-[.18em] text-primary">Mission report</p>
        <h2 className="app-page-title mt-2 font-black text-foreground">{isTeacherPreview ? "Practice complete" : "Quiz complete"}</h2>
        <p className="mb-8 mt-2 text-muted">{isTeacherPreview ? "You’ve reached the end of the questions. No answers were saved." : "Your result has been saved."}</p>
        {!isTeacherPreview && <div className="mb-8 grid grid-cols-2 gap-3">
            <div className="instrument-panel border border-border/80 bg-background/40 p-4">
                <div className="mb-1 font-mono text-xs uppercase tracking-wider text-muted">Questions</div>
                <div className="font-mono text-2xl font-bold text-foreground">{questionCount}</div>
            </div>
            <div className="instrument-panel border border-warning/20 bg-warning/[.06] p-4">
                <div className="mb-1 font-mono text-xs uppercase tracking-wider text-muted">XP earned</div>
                <div className="font-mono text-2xl font-bold text-warning">+{score}</div>
            </div>
        </div>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href={`/modules/${id}/essays`} className="console-control inline-flex min-h-12 w-full items-center justify-center bg-primary px-4 py-3 text-center text-sm font-black text-background transition-all hover:bg-primary-dim">Continue to written responses</Link>
          <button onClick={onReturnToModules} className="console-control min-h-12 w-full border border-border bg-surface/70 px-4 py-3 font-bold text-foreground transition-all hover:border-primary/35 hover:bg-primary/5">Return to modules</button>
        </div>
      </div>
  );
}
