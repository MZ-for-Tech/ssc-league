"use client";

import { useState } from "react";
import {
  ArrowLeft,
  AlertCircle,
  Check,
  FileQuestion,
  Plus,
  Upload,
  X,
} from "lucide-react";
import clsx from "clsx";
import { QuestionBankSkeleton } from "@/components/admin/QuestionBankParts";
import { LessonQuestionBrowser, QuestionBankLibrary } from "@/components/admin/QuestionBankViews";
import { QuestionEditorForm, BulkQuestionImportForm } from "@/components/admin/QuestionAuthoringForms";
import AdminSeasonToolbar from "@/components/admin/AdminSeasonToolbar";
import PageHeader from "@/components/PageHeader";
import type { SeasonRecord } from "@/lib/seasons";
import { useQuestionAuthoring } from "@/components/admin/useQuestionAuthoring";
import { useQuestionBankView } from "@/components/admin/useQuestionBankView";
import { useAdminQuestionBank } from "@/components/admin/useAdminQuestionBank";

const pageSize = 20;
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
  const readOnly = seasonId !== activeSeasonId;
  const { bank, isLoading, loadError, refreshBank } = useAdminQuestionBank(seasonId);
  const [view, setView] = useState<"library" | "lesson" | "add" | "import">("library");
  const [lessonSearch, setLessonSearch] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [page, setPage] = useState(1);

  const {
    topics,
    questions,
    essays,
    selectedTopic,
    selectedEssayCount,
    visibleLessonGroups,
    filteredQuestions,
    pageCount,
    visibleQuestions,
  } = useQuestionBankView({ bank, lessonSearch, search, selectedTopicId, page, pageSize });
  const {
    activeDraftTopicId,
    questionText,
    explanation,
    points,
    options,
    bulkData,
    formError,
    notice,
    isSubmitting,
    handleAddQuestion,
    handleBulkImport,
    openAddQuestion,
    updateOption,
    setQuestionText,
    setExplanation,
    setPoints,
    setDraftTopicId,
    setBulkData,
    setOptions,
    setNotice,
  } = useQuestionAuthoring({
    topics,
    selectedTopicId,
    refreshBank,
    onQuestionAdded: (topicId, text) => {
      setSearch(text.trim().slice(0, 80));
      setSelectedTopicId(topicId);
      setPage(1);
      setView("lesson");
    },
    onImportComplete: () => {
      setSelectedTopicId("");
      setView("library");
    },
  });
  const pageTitle = view === "lesson" && selectedTopic
    ? selectedTopic.name
    : view === "add" ? "Add question" : view === "import" ? "Import questions" : "Question Bank";

  return (
    <div className="w-full animate-in fade-in space-y-6 pb-16">
      <PageHeader
        title={pageTitle}
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

      {view === "add" && !readOnly && <QuestionEditorForm
        activeDraftTopicId={activeDraftTopicId}
        topics={topics}
        questionText={questionText}
        explanation={explanation}
        points={points}
        options={options}
        formError={formError}
        isSubmitting={isSubmitting}
        fieldClass={fieldClass}
        onClose={() => setView("library")}
        onSubmit={handleAddQuestion}
        onQuestionTextChange={setQuestionText}
        onExplanationChange={setExplanation}
        onPointsChange={setPoints}
        onTopicChange={setDraftTopicId}
        onCorrectOption={(index) => setOptions((current) => current.map((item, itemIndex) => ({ ...item, is_correct: itemIndex === index })))}
        onOptionChange={updateOption}
      />}

      {view === "import" && !readOnly && <BulkQuestionImportForm
        bulkData={bulkData}
        isSubmitting={isSubmitting}
        fieldClass={fieldClass}
        onBulkDataChange={setBulkData}
        onImport={handleBulkImport}
      />}

      {isLoading ? <QuestionBankSkeleton />
        : loadError ? <div role="alert" className="flex items-center gap-3 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger"><AlertCircle size={18} />{loadError}</div>
         : view === "library" ? <QuestionBankLibrary
          questionCount={questions.length}
          lessonCount={topics.length}
          essayCount={essays.length}
          lessonSearch={lessonSearch}
          groups={visibleLessonGroups}
          onSearchChange={setLessonSearch}
          onOpenLesson={(topic) => { setSelectedTopicId(topic.id); setSearch(""); setPage(1); setNotice(null); setView("lesson"); }}
        />
        : view === "lesson" && selectedTopic ? <LessonQuestionBrowser
          topicQuestionCount={questions.filter((question) => question.topic_id === selectedTopic.id).length}
          essayCount={selectedEssayCount}
          questions={visibleQuestions}
          filteredCount={filteredQuestions.length}
          search={search}
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          onSearchChange={(value) => { setSearch(value); setPage(1); }}
          onPageChange={setPage}
        /> : null}
    </div>
  );
}
