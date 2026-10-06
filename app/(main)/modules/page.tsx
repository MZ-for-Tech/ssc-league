import React from "react";
import ModuleNode from "@/components/modules/ModuleNode"; 
import {
  Zap,
  FileText, Download, BookOpen, ExternalLink
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getImpersonatedStudentId } from "@/lib/auth/impersonation";
import { getActiveSeasonId, getSelectedSeasonId } from "@/lib/seasons";
import PageHeader from "@/components/PageHeader";
import { COURSE_MATERIALS } from "@/lib/course-materials";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type TopicQuestion = { id: string };
type ModuleTopic = {
  id: string; name: string; description: string | null; week_number: number;
  module_id: string | null; lesson_number: number | null; Question: TopicQuestion[];
};
type StudentAnswer = { question_id: string; is_correct: boolean };

export default async function ModulesPage() {
  const supabase = await createSupabaseServerClient();
  const activeSeasonId = await getActiveSeasonId(supabase);
  const { data: { user } } = await supabase.auth.getUser();
  const { data: adminProfile } = user
    ? await supabase.from("Admin").select("id").eq("auth_id", user.id).maybeSingle()
    : { data: null };
  const isAdmin = Boolean(adminProfile);
  const seasonId = await getSelectedSeasonId(supabase, activeSeasonId, isAdmin);

  // --- 1. DETERMINE USER ---
  let studentId = null;
  const impersonateId = await getImpersonatedStudentId();

  if (impersonateId && isAdmin) {
    studentId = impersonateId;
  } else if (user && !isAdmin) {
    const { data: student } = await supabase
      .from("Student")
      .select("id")
      .eq("auth_id", user.id)
      .eq("season_id", seasonId)
      .single();
    studentId = student?.id;
  }

  // --- 2. FETCH DATA ---
  const [{ data: moduleRows }, { data: rawTopics, error }, { data: questions }] = await Promise.all([
    supabase.from("Module").select("id, module_number, name, description, display_order").eq("season_id", seasonId).order("display_order", { ascending: true }),
    supabase
    .from("Topic")
      .select("id, name, description, week_number, module_id, lesson_number")
      .eq("season_id", seasonId)
      .order("week_number", { ascending: true }),
    supabase.from("Question").select("id, topic_id").eq("season_id", seasonId),
  ]);
  const questionRows = (questions || []) as Array<{ id: string; topic_id: string }>;
  const topics: ModuleTopic[] = ((rawTopics || []) as Omit<ModuleTopic, "Question">[]).map((topic) => ({
    ...topic,
    Question: questionRows.filter((question) => question.topic_id === topic.id),
  }));

  let userAnswers: StudentAnswer[] = [];
  if (studentId) {
    const { data: answers } = await supabase
      .from("StudentAnswer")
      .select("question_id, is_correct")
      .eq("student_id", studentId)
      .eq("season_id", seasonId);
    if (answers) userAnswers = answers as StudentAnswer[];
  }

  // --- 3. CALCULATE STATS ---
  const bestAnswerMap = new Map<string, boolean>();
  userAnswers.forEach(a => {
      const currentBest = bestAnswerMap.get(a.question_id) || false;
      bestAnswerMap.set(a.question_id, currentBest || a.is_correct);
  });

  let completedMissions = 0;
  let totalXP = 0;
  const totalMissions = topics?.length || 0;

  topics.forEach((topic) => {
      const questions = topic.Question || [];
      const totalQs = questions.length;
      
      const attemptedQs = questions.filter((q) => bestAnswerMap.has(q.id)).length;
      if (totalQs > 0 && attemptedQs === totalQs) {
          completedMissions++;
      }

      const moduleXP = questions.reduce((sum: number, q) => {
          if (bestAnswerMap.has(q.id)) {
              return sum + (bestAnswerMap.get(q.id) ? 2 : 1);
          }
          return sum;
      }, 0);
      totalXP += moduleXP;
  });

  if (error) return <div className="text-red-500 p-10">System Failure.</div>;

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <PageHeader
        title="Course Map"
        icon={<BookOpen size={27} />}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.8fr)]">
        <main className="min-w-0 space-y-8" aria-label="Course lessons">
          {moduleRows?.length ? moduleRows.map((module) => {
            const moduleTopics = topics.filter((topic) => topic.module_id === module.id);
            const completedTopics = moduleTopics.filter((topic) => {
              const questions = topic.Question || [];
              return questions.length > 0 && questions.every((question) => bestAnswerMap.has(question.id));
            }).length;
            const moduleProgress = moduleTopics.length ? Math.round((completedTopics / moduleTopics.length) * 100) : 0;

            return (
              <section key={module.id} className="relative">
                <header className="instrument-panel mb-4 grid gap-4 border border-primary/20 bg-surface/55 p-4 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-center sm:px-5">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-primary">Module {module.module_number}</p>
                    <h2 className="mt-1 text-xl font-bold text-foreground">{module.name}</h2>
                    {module.description && <p className="mt-1 max-w-2xl text-sm leading-5 text-muted">{module.description}</p>}
                  </div>
                  <div className="sm:border-l sm:border-border/70 sm:pl-4">
                    <div className="flex items-center justify-between gap-3 font-mono text-xs uppercase tracking-wider text-muted">
                      <span>Module progress</span>
                      <span className="font-bold text-foreground">{completedTopics}/{moduleTopics.length}</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden bg-surface-light/45">
                      <div className="h-full bg-primary transition-[width]" style={{ width: `${moduleProgress}%` }} />
                    </div>
                  </div>
                </header>

                <div className="relative">
                  {moduleTopics.map((topic, index) => {
                    const questions = topic.Question || [];
                    const isCompleted = questions.length > 0 && questions.every((question) => bestAnswerMap.has(question.id));
                    return (
                      <ModuleNode
                        key={topic.id}
                        moduleId={topic.id}
                        missionId={topic.week_number}
                        moduleNumber={module.module_number}
                        lessonNumber={topic.lesson_number ?? undefined}
                        title={topic.name}
                        description={topic.description || ""}
                        status={isCompleted ? "completed" : "active"}
                        resources={[]}
                        isLast={index === moduleTopics.length - 1}
                      />
                    );
                  })}
                  {moduleTopics.length === 0 && <p className="ml-8 border border-dashed border-border/70 p-4 text-xs text-muted">No lessons are assigned to this module yet.</p>}
                </div>
              </section>
            );
          }) : topics.map((topic, index) => {
            const questions = topic.Question || [];
            const completed = questions.length > 0 && questions.every((question) => bestAnswerMap.has(question.id));
            return <ModuleNode key={topic.id} moduleId={topic.id} missionId={topic.week_number} title={topic.name} description={topic.description || ""} status={completed ? "completed" : "active"} resources={[]} isLast={index === topics.length - 1} />;
          })}
          {!moduleRows?.length && !topics.length && <div className="instrument-panel border border-dashed border-border bg-surface/40 p-8 text-center text-sm text-muted">Season curriculum is being prepared.</div>}
        </main>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-6" aria-label="Course information">
          <section className="instrument-panel border border-border bg-surface/50 p-4 sm:p-5" aria-label="Campaign progress">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-muted">Campaign status</h2>
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            </div>
            <div className="flex items-end justify-between gap-3">
              <p className="font-mono text-3xl font-bold leading-none tabular-nums text-foreground">{completedMissions}<span className="ml-1 text-base text-muted">/ {totalMissions}</span></p>
              <p className="pb-0.5 text-xs uppercase tracking-wider text-muted">Lessons complete</p>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden bg-surface-light/45">
              <div className="h-full bg-primary transition-[width] duration-700" style={{ width: `${totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0}%` }} />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">Quiz XP</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-sm font-bold tabular-nums text-warning"><Zap size={14} /> {totalXP}</span>
            </div>
          </section>

          <a
            href="https://tn-data.github.io/PFwithPython/"
            target="_blank"
            rel="noopener noreferrer"
            className="instrument-panel group relative block overflow-hidden border border-amber-200/20 bg-[linear-gradient(130deg,rgba(37,37,25,.72),rgba(16,25,34,.92)_58%)] p-4 transition hover:border-amber-200/50 sm:p-5"
          >
            <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rotate-45 border border-amber-100/[.08]" />
            <div className="relative">
              <ExternalLink size={14} className="absolute right-0 top-0 text-amber-200/60 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-200" />
              <p className="pr-7 font-mono text-xs uppercase tracking-[.18em] text-amber-100/55">COURSE SOURCE // PYTHON</p>
              <p className="mt-2 text-lg font-semibold text-white">Programming Fundamentals</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">Course guide for programming foundations, Python, and data science.</p>
              <div className="mt-3 flex items-center justify-between border-t border-amber-100/15 pt-3 font-mono text-xs uppercase tracking-[.15em] text-amber-100/75 transition group-hover:text-amber-50">Open external source <span aria-hidden="true">↗</span></div>
            </div>
          </a>

          <section className="instrument-panel border border-border bg-surface/50 p-4 sm:p-5" aria-label="Course reference files">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-muted">Reference files</h2>
              <span className="font-mono text-xs text-muted">{COURSE_MATERIALS.length} files</span>
            </div>
            <div className="max-h-[360px] space-y-1 overflow-y-auto pr-1">
              {COURSE_MATERIALS.length > 0 ? COURSE_MATERIALS.map((resource) => (
                <a
                  key={resource.url}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-w-0 items-center gap-2.5 border border-transparent px-2 py-2 transition hover:border-border/70 hover:bg-background/35"
                >
                  <FileText size={14} className="shrink-0 text-primary/70 group-hover:text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-foreground/85 group-hover:text-foreground">{resource.title}</span>
                    <span className="mt-0.5 block font-mono text-xs uppercase tracking-wider text-muted">Module {resource.moduleNumber} · {resource.type}</span>
                  </span>
                  <Download size={12} className="shrink-0 text-muted opacity-0 transition group-hover:opacity-100" />
                </a>
              )) : <p className="py-3 text-xs text-muted">No course files are available.</p>}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
