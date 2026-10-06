"use client";

import type { FormEvent } from "react";
import { AlertCircle, Check, HelpCircle, Loader2, Plus, Upload, X } from "lucide-react";
import clsx from "clsx";
import SelectDropdown from "@/components/ui/SelectDropdown";

type QuestionOptionDraft = { text: string; is_correct: boolean; justification: string };
type TopicOption = { id: string; name: string };

type QuestionEditorFormProps = {
  activeDraftTopicId: string;
  topics: TopicOption[];
  questionText: string;
  explanation: string;
  points: number;
  options: QuestionOptionDraft[];
  formError: string | null;
  isSubmitting: boolean;
  fieldClass: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onQuestionTextChange: (value: string) => void;
  onExplanationChange: (value: string) => void;
  onPointsChange: (value: number) => void;
  onTopicChange: (value: string) => void;
  onCorrectOption: (index: number) => void;
  onOptionChange: (index: number, changes: Partial<QuestionOptionDraft>) => void;
};

export function QuestionEditorForm({
  activeDraftTopicId, topics, questionText, explanation, points, options, formError, isSubmitting, fieldClass,
  onClose, onSubmit, onQuestionTextChange, onExplanationChange, onPointsChange, onTopicChange, onCorrectOption, onOptionChange,
}: QuestionEditorFormProps) {
  return (
<section className="instrument-panel relative isolate overflow-hidden rounded-2xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] p-5 shadow-lg shadow-black/20 sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">New multiple-choice question</p>
            <h2 className="mt-1 text-xl font-bold text-foreground">Add to the question bank</h2>
            <p className="mt-1 text-sm text-muted">Choose a lesson, write the prompt, and mark one correct answer.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close question form" className="rounded-lg p-2 text-muted transition hover:bg-background hover:text-foreground"><X size={18} /></button>
        </div>
        <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Question</span>
              <textarea required rows={4} value={questionText} onChange={(event) => onQuestionTextChange(event.target.value)} className={fieldClass} placeholder="Write a clear question or scenario…" />
            </label>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Answer choices</h3>
                <p className="mt-1 text-xs text-muted">Select the circle beside the correct answer.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {options.map((option, index) => <div key={index} className={clsx("rounded-xl border p-4 transition", option.is_correct ? "border-success/40 bg-success/5" : "border-border bg-background/50")}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className={clsx("text-xs font-bold uppercase tracking-wider", option.is_correct ? "text-success" : "text-muted")}>Option {String.fromCharCode(65 + index)}</span>
                    <button type="button" onClick={() => onCorrectOption(index)} aria-label={`Mark option ${String.fromCharCode(65 + index)} correct`} aria-pressed={option.is_correct} className={clsx("grid h-6 w-6 place-items-center rounded-full border transition", option.is_correct ? "border-success bg-success text-background" : "border-border text-transparent hover:border-success")}><Check size={13} /></button>
                  </div>
                  <input required value={option.text} onChange={(event) => onOptionChange(index, { text: event.target.value })} className={fieldClass} placeholder={`Answer choice ${index + 1}`} />
                  <textarea required rows={2} value={option.justification} onChange={(event) => onOptionChange(index, { justification: event.target.value })} className={`${fieldClass} mt-2`} placeholder={option.is_correct ? "Why this answer is correct…" : "Why this answer choice is incorrect…"} />
                </div>)}
              </div>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Explanation <span className="font-normal text-muted">(optional)</span></span>
              <textarea rows={3} value={explanation} onChange={(event) => onExplanationChange(event.target.value)} className={fieldClass} placeholder="Explain why the correct answer is right…" />
            </label>
          </div>
          <aside className="h-fit space-y-5 rounded-xl border border-border bg-background/50 p-4 sm:p-5">
            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Lesson</span>
              <SelectDropdown required value={activeDraftTopicId} onChange={(event) => onTopicChange(event.target.value)} className={fieldClass}>
                <option value="">Select a lesson</option>
                {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
              </SelectDropdown>
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Points</span>
              <input required type="number" min={0} step={1} value={points} onChange={(event) => onPointsChange(Number(event.target.value))} className={fieldClass} />
            </label>
            {formError && <p role="alert" className="flex gap-2 rounded-lg border border-danger/20 bg-danger/5 p-3 text-xs text-danger"><AlertCircle size={15} className="shrink-0" />{formError}</p>}
            <button type="submit" disabled={isSubmitting || !topics.length} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-background transition hover:bg-primary-dim disabled:cursor-wait disabled:opacity-60">
              {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />}
              {isSubmitting ? "Saving question…" : "Add to bank"}
            </button>
          </aside>
        </form>
      </section>
  );
}

type BulkQuestionImportFormProps = {
  bulkData: string;
  isSubmitting: boolean;
  fieldClass: string;
  onBulkDataChange: (value: string) => void;
  onImport: () => void;
};

export function BulkQuestionImportForm({ bulkData, isSubmitting, fieldClass, onBulkDataChange, onImport }: BulkQuestionImportFormProps) {
  return (
<section className="instrument-panel relative isolate overflow-hidden rounded-2xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] p-5 shadow-lg shadow-black/20 sm:p-7">
        <div className="mb-5 flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary"><Upload size={18} /></div>
          <div>
            <h2 className="font-semibold text-foreground">Import multiple-choice questions</h2>
            <p className="mt-1 text-sm text-muted">One question per line. Separate fields with a pipe character.</p>
          </div>
        </div>
        <div className="mb-4 rounded-lg border border-border bg-background/60 p-3">
          <code className="block overflow-x-auto text-xs text-muted">Lesson | Question | Option A | Option B | Option C | Option D | Correct choice (1–4) | Points</code>
        </div>
        <textarea value={bulkData} onChange={(event) => onBulkDataChange(event.target.value)} rows={10} className={`${fieldClass} resize-y font-mono text-xs leading-6`} placeholder="Loops | What does range(3) produce? | 0, 1, 2 | 1, 2, 3 | 0, 1, 2, 3 | 3 | 1 | 10" />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-xs text-muted"><HelpCircle size={14} /> Lesson names must match the curriculum.</p>
          <button type="button" onClick={onImport} disabled={isSubmitting || !bulkData.trim()} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-background transition hover:bg-primary-dim disabled:opacity-50">
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Import questions
          </button>
        </div>
      </section>
  );
}
