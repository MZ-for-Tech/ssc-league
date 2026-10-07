import Image from "next/image";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import type { loadAdminQuestionBank } from "@/app/actions/question-bank-actions";

type BankQuestion = Awaited<ReturnType<typeof loadAdminQuestionBank>>["questions"][number];

export function QuestionBankSkeleton() {
  return (
    <section className="animate-pulse space-y-7" aria-busy="true" aria-label="Loading question bank">
      <div className="instrument-panel relative isolate overflow-hidden rounded-xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] p-4 shadow-lg shadow-black/15 sm:p-5">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2.5">
            {["w-24", "w-20", "w-32"].map((width, index) => (
              <div key={index} className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background/40 px-3">
                <div className={`h-4 rounded bg-surface-light/35 ${width}`} />
                <div className="h-3 w-12 rounded bg-surface-light/20" />
              </div>
            ))}
          </div>
          <div className="h-11 w-full rounded-xl border border-border bg-background/50 sm:w-72" />
        </div>
      </div>

      {[0, 1, 2].map((group) => (
        <section key={group} className="space-y-3">
          <header className="flex items-end justify-between gap-4 border-b border-border/70 px-1 pb-3">
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-primary/20" />
              <div className="h-5 w-44 rounded bg-surface-light/35" />
            </div>
            <div className="h-3 w-16 rounded bg-surface-light/20" />
          </header>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((lesson) => (
              <article key={lesson} className="instrument-panel relative isolate min-h-44 overflow-hidden rounded-xl border border-border bg-[linear-gradient(135deg,rgb(var(--surface-hero)),rgb(var(--surface))_62%,rgb(var(--surface-node)))] p-5 shadow-lg shadow-black/10">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-lg border border-primary/15 bg-primary/10" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="h-4 w-4/5 rounded bg-surface-light/35" />
                    <div className="space-y-2">
                      <div className="h-3 w-full rounded bg-surface-light/20" />
                      <div className="h-3 w-2/3 rounded bg-surface-light/20" />
                    </div>
                  </div>
                  <div className="h-4 w-4 shrink-0 rounded bg-surface-light/20" />
                </div>
                <div className="mt-5 flex gap-4 border-t border-border/70 pt-3">
                  <div className="h-3 w-24 rounded bg-surface-light/20" />
                  <div className="h-3 w-28 rounded bg-surface-light/20" />
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}

export function QuestionRow({ question }: { question: BankQuestion }) {
  return <details className="group px-4 py-4 transition hover:bg-primary/[0.035] sm:px-5">
    <summary className="flex cursor-pointer list-none items-start gap-3 [&::-webkit-details-marker]:hidden">
      <span className="min-w-0 flex-1">
        <span className="block whitespace-pre-wrap text-sm font-medium leading-6 text-foreground">{question.text}</span>
      </span>
      <span className="flex shrink-0 items-center gap-2 pt-1 text-xs text-muted">
        <span className="hidden whitespace-nowrap sm:inline">{question.options.length} options · {question.points} pts</span>
        <ChevronDown size={16} className="transition group-open:rotate-180" />
      </span>
    </summary>
    <div className="mt-4 space-y-4 pl-1 sm:pl-0">
      <div className="grid gap-2 sm:grid-cols-2">
        {question.options.map((option, index) => <div key={option.id} className={clsx("flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm", option.is_correct ? "border-success/25 bg-success/5 text-foreground" : "border-border bg-background/40 text-muted")}>
          <span className={clsx("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs font-bold", option.is_correct ? "bg-success text-background" : "bg-surface text-muted")}>{String.fromCharCode(65 + index)}</span>
          <span className="min-w-0 flex-1 whitespace-pre-wrap">{option.text}{option.justification && <span className="mt-1 block text-xs leading-5 text-muted">{option.justification}</span>}</span>
          {option.is_correct && <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-success">Correct</span>}
        </div>)}
      </div>
      {question.explanation && <div className="rounded-lg border border-primary/15 bg-primary/5 px-3 py-2.5 text-sm leading-6 text-muted"><span className="mr-2 text-xs font-bold uppercase tracking-wider text-primary">Explanation</span>{question.explanation}</div>}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        {question.bank_item_id && <span className="font-mono">{question.bank_item_id}</span>}
        {question.bloom_level && <span>{question.bloom_level}</span>}
        {question.attempts > 0 && <span>{question.attempts} student {question.attempts === 1 ? "response" : "responses"}</span>}
      </div>
      {question.stimulus_asset_url && <figure className="max-w-md rounded-xl border border-border bg-background p-3">
        <Image unoptimized width={640} height={360} src={question.stimulus_asset_url} alt={question.stimulus_asset_alt || question.text} className="max-h-56 w-full object-contain" />
        {question.stimulus_asset_alt && question.stimulus_asset_alt !== question.text && <figcaption className="mt-2 text-xs text-muted">{question.stimulus_asset_alt}</figcaption>}
      </figure>}
    </div>
  </details>;
}
