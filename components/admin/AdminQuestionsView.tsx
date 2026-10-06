"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  HelpCircle,
  Loader2,
  Plus,
  Search,
  Upload,
  X,
} from "lucide-react";
import clsx from "clsx";
import {
  createQuestionWithOptions,
  createQuestionsBulk,
  loadAdminQuestionBank,
  type QuestionDraft,
} from "@/app/actions/question-actions";
import AdminSeasonToolbar from "@/components/admin/AdminSeasonToolbar";
import PageHeader from "@/components/PageHeader";
import type { SeasonRecord } from "@/lib/seasons";

type BankData = Awaited<ReturnType<typeof loadAdminQuestionBank>>;
type BankQuestion = BankData["questions"][number];
type QuestionOptionDraft = { text: string; is_correct: boolean; justification: string };

const pageSize = 20;
const emptyOptions = (): QuestionOptionDraft[] => Array.from({ length: 4 }, (_, index) => ({
  text: "",
  is_correct: index === 0,
  justification: "",
}));

const fieldClass = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted/70 focus:border-primary";

export default function AdminQuestionsView({
  seasonId,
  activeSeasonId,
  seasons,
}: {
  seasonId: string;
  activeSeasonId: string;
  seasons: SeasonRecord[];
}) {
  const router = useRouter();
  const readOnly = seasonId !== activeSeasonId;
  const [bank, setBank] = useState<BankData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [view, setView] = useState<"library" | "lesson" | "add" | "import">("library");
  const [lessonSearch, setLessonSearch] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [page, setPage] = useState(1);
  const [questionText, setQuestionText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [points, setPoints] = useState(10);
  const [draftTopicId, setDraftTopicId] = useState("");
  const [options, setOptions] = useState<QuestionOptionDraft[]>(emptyOptions);
  const [bulkData, setBulkData] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; kind: "success" | "error" } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshBank = useCallback(async () => {
    try {
      setBank(await loadAdminQuestionBank(seasonId));
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "The question bank could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    let active = true;
    void loadAdminQuestionBank(seasonId).then((nextBank) => {
      if (active) { setBank(nextBank); setLoadError(null); setIsLoading(false); }
    }).catch((error: unknown) => {
      if (active) { setLoadError(error instanceof Error ? error.message : "The question bank could not be loaded."); setIsLoading(false); }
    });
    return () => { active = false; };
  }, [seasonId]);

  const topics = useMemo(() => bank?.topics ?? [], [bank]);
  const questions = useMemo(() => bank?.questions ?? [], [bank]);
  const essays = useMemo(() => bank?.essays ?? [], [bank]);
  const activeDraftTopicId = draftTopicId || topics[0]?.id || "";
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId) || null;
  const selectedEssayCount = selectedTopic ? essays.filter((essay) => essay.topic_id === selectedTopic.id).length : 0;
  const lessonSummaries = useMemo(() => topics.map((topic) => ({
    ...topic,
    questionCount: questions.filter((question) => question.topic_id === topic.id).length,
    essayCount: essays.filter((essay) => essay.topic_id === topic.id).length,
  })), [topics, questions, essays]);
  const curriculumGroups = useMemo(() => {
    const groups = (bank?.modules || []).map((module) => ({
      id: module.id,
      number: module.module_number as number | null,
      name: module.name,
      lessons: lessonSummaries.filter((topic) => topic.module_id === module.id),
    }));
    const unassignedLessons = lessonSummaries.filter((topic) => !topic.module_id);
    if (unassignedLessons.length) groups.push({
      id: "archive",
      number: null,
      name: "Archived lessons",
      lessons: unassignedLessons,
    });
    return groups;
  }, [bank, lessonSummaries]);
  const visibleLessonGroups = useMemo(() => curriculumGroups.map((group) => ({
    ...group,
    lessons: group.lessons.filter((topic) => `${topic.name} ${topic.description || ""} ${group.name}`.toLocaleLowerCase().includes(lessonSearch.trim().toLocaleLowerCase())),
  })).filter((group) => group.lessons.length), [curriculumGroups, lessonSearch]);
  const filteredQuestions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return questions.filter((question) => {
      if (question.topic_id !== selectedTopicId) return false;
      if (!normalizedSearch) return true;
      return [question.text, question.bank_item_id || "", question.topic_label]
        .some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
    }).sort((left, right) => (left.display_order ?? Number.MAX_SAFE_INTEGER) - (right.display_order ?? Number.MAX_SAFE_INTEGER) ||
      left.created_at.localeCompare(right.created_at));
  }, [questions, search, selectedTopicId]);
  const pageCount = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const visibleQuestions = filteredQuestions.slice((page - 1) * pageSize, page * pageSize);

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
      setSearch(questionText.trim().slice(0, 80));
      setSelectedTopicId(activeDraftTopicId);
      setPage(1);
      setQuestionText("");
      setExplanation("");
      setPoints(10);
      setOptions(emptyOptions());
      setView("lesson");
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
    const lines = bulkData.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const drafts: QuestionDraft[] = [];
    const skipped: string[] = [];
    for (const [index, line] of lines.entries()) {
      const columns = line.split("|").map((column) => column.trim());
      if (columns.length < 7) {
        skipped.push(`Line ${index + 1}: expected at least 7 pipe-separated fields.`);
        continue;
      }
      const [topicName, text, ...rest] = columns;
      const [optionA, optionB, optionC, optionD, correctIndex, pointValue] = rest;
      const topic = topics.find((candidate) => candidate.name.toLocaleLowerCase() === topicName.toLocaleLowerCase());
      const correctNumber = Number(correctIndex);
      if (!topic) {
        skipped.push(`Line ${index + 1}: lesson “${topicName}” was not found.`);
        continue;
      }
      if (!text || [optionA, optionB, optionC, optionD].some((option) => !option) || ![1, 2, 3, 4].includes(correctNumber)) {
        skipped.push(`Line ${index + 1}: question, four choices, and a correct choice from 1–4 are required.`);
        continue;
      }
      drafts.push({
        topic_id: topic.id,
        text,
        points: pointValue ? Number(pointValue) : 10,
        options: [optionA, optionB, optionC, optionD].map((option, optionIndex) => ({ text: option, is_correct: optionIndex + 1 === correctNumber })),
      });
    }

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
        setSelectedTopicId("");
        setView("library");
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
    setView("add");
  }

  const pageTitle = view === "lesson" && selectedTopic
    ? selectedTopic.name
    : view === "add" ? "Add question" : view === "import" ? "Import questions" : "Question Bank";
  const pageDescription = view === "lesson" && selectedTopic
    ? selectedTopic.description || "Review this lesson’s questions and written prompts."
    : view === "add" ? "Write a question and add it to a lesson."
      : view === "import" ? "Add multiple-choice questions in a structured batch."
        : readOnly ? "Browse the archived season’s curriculum." : "Choose a lesson to review its questions.";

  return (
    <div className="w-full animate-in fade-in space-y-6 pb-16">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        icon={<FileQuestion size={28} />}
        actions={(
          <div className="flex flex-wrap items-center gap-2">
            <AdminSeasonToolbar seasons={seasons} seasonId={seasonId} />
            {view === "lesson" && <button type="button" onClick={() => { setView("library"); setSearch(""); setPage(1); }} className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-muted transition hover:text-foreground"><ArrowLeft size={16} /> All lessons</button>}
            {!readOnly && <>
              <button type="button" onClick={() => { setView(view === "import" ? "library" : "import"); setNotice(null); }} className={clsx("inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition", view === "import" ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-surface text-muted hover:text-foreground")}>
                {view === "import" ? <X size={16} /> : <Upload size={16} />} {view === "import" ? "Close import" : "Import"}
              </button>
              <button type="button" onClick={() => { if (view === "add") setView(selectedTopicId ? "lesson" : "library"); else openAddQuestion(); setNotice(null); }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-background transition hover:bg-primary-dim">
                {view === "add" ? <X size={16} /> : <Plus size={17} />} {view === "add" ? "Close form" : "Add question"}
              </button>
            </>}
          </div>
        )}
      />

      {notice && <div role="status" className={clsx("flex items-start gap-3 rounded-xl border px-4 py-3 text-sm", notice.kind === "success" ? "border-success/20 bg-success/5 text-success" : "border-danger/20 bg-danger/5 text-danger")}>
        {notice.kind === "success" ? <Check size={17} className="mt-0.5 shrink-0" /> : <AlertCircle size={17} className="mt-0.5 shrink-0" />}
        <p>{notice.text}</p>
      </div>}

      {view === "add" && !readOnly && <section className="rounded-2xl border border-border bg-surface/70 p-5 sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">New multiple-choice question</p>
            <h2 className="mt-1 text-xl font-bold text-foreground">Add to the question bank</h2>
            <p className="mt-1 text-sm text-muted">Choose a lesson, write the prompt, and mark one correct answer.</p>
          </div>
          <button type="button" onClick={() => setView("library")} aria-label="Close question form" className="rounded-lg p-2 text-muted transition hover:bg-background hover:text-foreground"><X size={18} /></button>
        </div>
        <form onSubmit={handleAddQuestion} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Question</span>
              <textarea required rows={4} value={questionText} onChange={(event) => setQuestionText(event.target.value)} className={fieldClass} placeholder="Write a clear question or scenario…" />
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
                    <button type="button" onClick={() => setOptions((current) => current.map((item, itemIndex) => ({ ...item, is_correct: itemIndex === index })))} aria-label={`Mark option ${String.fromCharCode(65 + index)} correct`} aria-pressed={option.is_correct} className={clsx("grid h-6 w-6 place-items-center rounded-full border transition", option.is_correct ? "border-success bg-success text-background" : "border-border text-transparent hover:border-success")}><Check size={13} /></button>
                  </div>
                  <input required value={option.text} onChange={(event) => updateOption(index, { text: event.target.value })} className={fieldClass} placeholder={`Answer choice ${index + 1}`} />
                  <textarea required rows={2} value={option.justification} onChange={(event) => updateOption(index, { justification: event.target.value })} className={`${fieldClass} mt-2`} placeholder={option.is_correct ? "Why this answer is correct…" : "Why this answer choice is incorrect…"} />
                </div>)}
              </div>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Explanation <span className="font-normal text-muted">(optional)</span></span>
              <textarea rows={3} value={explanation} onChange={(event) => setExplanation(event.target.value)} className={fieldClass} placeholder="Explain why the correct answer is right…" />
            </label>
          </div>
          <aside className="h-fit space-y-5 rounded-xl border border-border bg-background/50 p-4 sm:p-5">
            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Lesson</span>
              <select required value={activeDraftTopicId} onChange={(event) => setDraftTopicId(event.target.value)} className={fieldClass}>
                <option value="">Select a lesson</option>
                {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Points</span>
              <input required type="number" min={0} step={1} value={points} onChange={(event) => setPoints(Number(event.target.value))} className={fieldClass} />
            </label>
            {formError && <p role="alert" className="flex gap-2 rounded-lg border border-danger/20 bg-danger/5 p-3 text-xs text-danger"><AlertCircle size={15} className="shrink-0" />{formError}</p>}
            <button type="submit" disabled={isSubmitting || !topics.length} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-background transition hover:bg-primary-dim disabled:cursor-wait disabled:opacity-60">
              {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />}
              {isSubmitting ? "Saving question…" : "Add to bank"}
            </button>
          </aside>
        </form>
      </section>}

      {view === "import" && !readOnly && <section className="rounded-2xl border border-border bg-surface/70 p-5 sm:p-7">
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
        <textarea value={bulkData} onChange={(event) => setBulkData(event.target.value)} rows={10} className={`${fieldClass} resize-y font-mono text-xs leading-6`} placeholder="Loops | What does range(3) produce? | 0, 1, 2 | 1, 2, 3 | 0, 1, 2, 3 | 3 | 1 | 10" />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-xs text-muted"><HelpCircle size={14} /> Lesson names must match the curriculum.</p>
          <button type="button" onClick={handleBulkImport} disabled={isSubmitting || !bulkData.trim()} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-background transition hover:bg-primary-dim disabled:opacity-50">
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Import questions
          </button>
        </div>
      </section>}

      {isLoading ? <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-surface/50 p-12 text-sm text-muted"><Loader2 size={18} className="animate-spin text-primary" />Loading question bank…</div>
        : loadError ? <div role="alert" className="flex items-center gap-3 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger"><AlertCircle size={18} />{loadError}</div>
        : view === "library" ? <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 text-sm text-muted">
            <p><span className="font-semibold text-foreground">{questions.length}</span> questions <span className="mx-2 text-border">·</span> <span className="font-semibold text-foreground">{topics.length}</span> lessons <span className="mx-2 text-border">·</span> <span className="font-semibold text-foreground">{essays.length}</span> written prompts</p>
            <label className="relative block w-full sm:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input value={lessonSearch} onChange={(event) => setLessonSearch(event.target.value)} className={`${fieldClass} py-2.5 pl-9`} placeholder="Find a lesson" />
            </label>
          </div>
          {visibleLessonGroups.length ? visibleLessonGroups.map((group) => <section key={group.id} className="space-y-3">
            <header className="flex items-baseline justify-between gap-4 px-1">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{group.number ? `Module ${group.number}` : "Archive"}</p>
                <h2 className="mt-1 text-lg font-bold text-foreground">{group.name}</h2>
              </div>
              <span className="shrink-0 text-xs text-muted">{group.lessons.length} lessons</span>
            </header>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {group.lessons.map((topic) => <button
                type="button"
                key={topic.id}
                onClick={() => { setSelectedTopicId(topic.id); setSearch(""); setPage(1); setNotice(null); setView("lesson"); }}
                className="group/card rounded-2xl border border-border bg-surface/55 p-5 text-left transition hover:border-primary/35 hover:bg-surface/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/10 text-xs font-bold text-primary">
                      {group.number && topic.lesson_number ? `${group.number}.${topic.lesson_number}` : `W${topic.week_number}`}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-semibold leading-5 text-foreground">{topic.name}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted">{topic.description || "Open this lesson to review its questions."}</p>
                    </div>
                  </div>
                  <ArrowRight size={17} className="mt-1 shrink-0 text-muted transition group-hover/card:translate-x-0.5 group-hover/card:text-primary" />
                </div>
                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t border-border/70 pt-3 text-xs text-muted">
                  <span>{topic.questionCount} questions</span>
                  <span>{topic.essayCount} written prompts</span>
                </div>
              </button>)}
            </div>
          </section>) : <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <Search size={22} className="mx-auto text-muted" />
            <h2 className="mt-3 font-semibold text-foreground">No lessons found</h2>
            <p className="mt-1 text-sm text-muted">Try another search.</p>
          </div>}
        </section>
        : view === "lesson" && selectedTopic ? <section className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-border bg-surface/45">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
              <div>
                <h3 className="font-semibold text-foreground">Multiple-choice questions</h3>
                <p className="mt-1 text-xs text-muted">{questions.filter((question) => question.topic_id === selectedTopic.id).length} questions · {selectedEssayCount} written prompts</p>
              </div>
              <label className="relative block w-full sm:w-72">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className={`${fieldClass} py-2.5 pl-9`} placeholder="Search this lesson" />
              </label>
            </div>
            {!visibleQuestions.length ? <div className="p-10 text-center text-sm text-muted">No questions match this search.</div> : <div className="divide-y divide-border/70">
              {visibleQuestions.map((question) => <QuestionRow key={question.id} question={question} />)}
            </div>}
            {filteredQuestions.length > pageSize && <footer className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-xs text-muted">Page {page} of {pageCount}</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground disabled:opacity-40"><ChevronLeft size={15} /> Previous</button>
                <button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground disabled:opacity-40">Next <ChevronRight size={15} /></button>
              </div>
            </footer>}
          </section>
        </section> : null}
    </div>
  );
}

function QuestionRow({ question }: { question: BankQuestion }) {
  return <details className="group px-4 py-4 transition hover:bg-background/25 sm:px-5">
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
          <span className={clsx("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold", option.is_correct ? "bg-success text-background" : "bg-surface text-muted")}>{String.fromCharCode(65 + index)}</span>
          <span className="min-w-0 flex-1 whitespace-pre-wrap">{option.text}{option.justification && <span className="mt-1 block text-xs leading-5 text-muted">{option.justification}</span>}</span>
          {option.is_correct && <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-success">Correct</span>}
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
