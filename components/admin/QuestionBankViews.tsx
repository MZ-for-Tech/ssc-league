"use client";

import { ArrowRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { QuestionRow } from "@/components/admin/QuestionBankParts";
import type { BankQuestion, LessonGroup, LessonTopic } from "@/components/admin/question-bank-types";

const fieldClass = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted/70 focus:border-primary";

type QuestionBankLibraryProps = {
  questionCount: number;
  lessonCount: number;
  essayCount: number;
  lessonSearch: string;
  groups: LessonGroup[];
  onSearchChange: (value: string) => void;
  onOpenLesson: (topic: LessonTopic) => void;
};

export function QuestionBankLibrary({
  questionCount, lessonCount, essayCount, lessonSearch, groups, onSearchChange, onOpenLesson,
}: QuestionBankLibraryProps) {
  return (
    <section className="space-y-7">
      <div className="instrument-panel relative isolate overflow-hidden rounded-xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] p-4 shadow-lg shadow-black/15 sm:p-5">
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-1/3 bg-dot-grid opacity-[0.06]" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2.5">
            <div className="rounded-lg border border-primary/15 bg-background/45 px-3 py-2"><span className="font-mono text-base font-bold text-foreground">{questionCount}</span><span className="ml-2 text-xs text-muted">questions</span></div>
            <div className="rounded-lg border border-border/80 bg-background/35 px-3 py-2"><span className="font-mono text-base font-bold text-foreground">{lessonCount}</span><span className="ml-2 text-xs text-muted">lessons</span></div>
            <div className="rounded-lg border border-border/80 bg-background/35 px-3 py-2"><span className="font-mono text-base font-bold text-foreground">{essayCount}</span><span className="ml-2 text-xs text-muted">written prompts</span></div>
          </div>
          <label className="relative block w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={lessonSearch} onChange={(event) => onSearchChange(event.target.value)} className={`${fieldClass} bg-background/65 py-2.5 pl-9 focus:ring-2 focus:ring-primary/10`} placeholder="Find a lesson" />
          </label>
        </div>
      </div>
      {groups.length ? groups.map((group) => <section key={group.id} className="space-y-3">
        <header className="flex items-end justify-between gap-4 border-b border-border/70 px-1 pb-3">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">{group.number ? `Module ${group.number}` : "Archive"}</p>
            <h2 className="mt-1 text-lg font-bold text-foreground">{group.name}</h2>
          </div>
          <span className="shrink-0 font-mono text-xs text-muted">{group.lessons.length} lessons</span>
        </header>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {group.lessons.map((topic) => <button
            type="button"
            key={topic.id}
            onClick={() => onOpenLesson(topic)}
            className="instrument-panel group/card relative isolate overflow-hidden rounded-xl border border-border bg-[linear-gradient(135deg,rgb(var(--surface-hero)),rgb(var(--surface))_62%,rgb(var(--surface-node)))] p-5 text-left shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[0_0_28px_rgb(var(--primary)/0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent opacity-0 transition group-hover/card:opacity-100" />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-primary/25 bg-primary/10 font-mono text-xs font-bold text-primary shadow-[0_0_18px_rgb(var(--primary)/0.08)]">
                  {group.number && topic.lesson_number ? `${group.number}.${topic.lesson_number}` : `W${topic.week_number}`}
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold leading-5 text-foreground">{topic.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted">{topic.description || "Open this lesson to review its questions."}</p>
                </div>
              </div>
              <ArrowRight size={17} className="mt-1 shrink-0 text-muted transition group-hover/card:translate-x-0.5 group-hover/card:text-primary" />
            </div>
            <div className="relative z-10 mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t border-border/70 pt-3 font-mono text-xs text-muted">
              <span>{topic.questionCount} questions</span>
              <span>{topic.essayCount} written prompts</span>
            </div>
          </button>)}
        </div>
      </section>) : <div className="instrument-panel rounded-2xl border border-dashed border-border bg-surface/35 p-10 text-center">
        <Search size={22} className="mx-auto text-primary" />
        <h2 className="mt-3 font-semibold text-foreground">No lessons found</h2>
        <p className="mt-1 text-sm text-muted">Try another search.</p>
      </div>}
    </section>
  );
}

type LessonQuestionBrowserProps = {
  topicQuestionCount: number;
  essayCount: number;
  questions: BankQuestion[];
  filteredCount: number;
  search: string;
  page: number;
  pageCount: number;
  pageSize: number;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
};

export function LessonQuestionBrowser({
  topicQuestionCount, essayCount, questions, filteredCount, search, page, pageCount, pageSize, onSearchChange, onPageChange,
}: LessonQuestionBrowserProps) {
  return (
    <section className="space-y-5">
      <section className="instrument-panel relative isolate overflow-hidden rounded-2xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] shadow-lg shadow-black/20">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div>
            <h3 className="font-semibold text-foreground">Multiple-choice questions</h3>
            <p className="mt-1 text-xs text-muted">{topicQuestionCount} questions · {essayCount} written prompts</p>
          </div>
          <label className="relative block w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={search} onChange={(event) => onSearchChange(event.target.value)} className={`${fieldClass} py-2.5 pl-9`} placeholder="Search this lesson" />
          </label>
        </div>
        {!questions.length ? <div className="p-10 text-center text-sm text-muted">No questions match this search.</div> : <div className="divide-y divide-border/70">
          {questions.map((question) => <QuestionRow key={question.id} question={question} />)}
        </div>}
        {filteredCount > pageSize && <footer className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-xs text-muted">Page {page} of {pageCount}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground disabled:opacity-40"><ChevronLeft size={15} /> Previous</button>
            <button type="button" onClick={() => onPageChange(Math.min(pageCount, page + 1))} disabled={page === pageCount} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground disabled:opacity-40">Next <ChevronRight size={15} /></button>
          </div>
        </footer>}
      </section>
    </section>
  );
}
