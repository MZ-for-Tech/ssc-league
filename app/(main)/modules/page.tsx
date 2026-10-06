import React from "react";
import ModuleNode from "@/components/modules/ModuleNode"; 
import {
  LayoutDashboard, Zap, Terminal,
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
    <div className="w-full animate-in fade-in slide-in-from-bottom-4">
      {/* HEADER */}
      <div className="mb-8">
      <PageHeader
        title="Mission Control"
        description="Select a module to engage training protocols."
        icon={<Terminal size={28} />}
      />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* TIMELINE */}
        <div className="lg:col-span-2 relative">
          <div className="space-y-10">
              {moduleRows?.length ? moduleRows.map((module) => {
                const moduleTopics = topics.filter((topic) => topic.module_id === module.id);
                return <section key={module.id} className="relative">
                  <header className="mb-4 rounded-xl border border-primary/15 bg-primary/5 px-5 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Module {module.module_number}</p>
                    <h2 className="mt-1 text-xl font-bold text-foreground">{module.name}</h2>
                    <p className="mt-1 text-sm text-muted">{module.description}</p>
                    {COURSE_MATERIALS.filter((material) => material.moduleNumber === module.module_number).length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-primary/10 pt-3">
                        {COURSE_MATERIALS.filter((material) => material.moduleNumber === module.module_number).map((material) => (
                          <a
                            key={material.url}
                            href={material.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 border border-border bg-background/40 px-2.5 py-1.5 text-[11px] font-medium text-muted transition hover:border-primary/40 hover:text-primary"
                          >
                            <FileText size={12} /> {material.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </header>
                  <div className="relative space-y-3">
              {moduleTopics.map((topic, index) => {
                const questions = topic.Question || [];
                const totalQs = questions.length;
                
                const attemptedQs = questions.filter((q) => bestAnswerMap.has(q.id)).length;
                const isModuleCompleted = totalQs > 0 && attemptedQs === totalQs;
                
                // --- CHANGED LOGIC START ---
                // OLD: Checks previous topic completion to unlock current one.
                // NEW: Defaults to "active" so everything is unlocked. Only "completed" changes state.
                
                let uiStatus: "active" | "completed" | "locked" = "active"; 
                if (isModuleCompleted) {
                    uiStatus = "completed";
                }
                // --- CHANGED LOGIC END ---

                return (
                  <ModuleNode
                    key={topic.id}
                    moduleId={topic.id}
                    missionId={topic.week_number}
                    moduleNumber={module.module_number}
                    lessonNumber={topic.lesson_number ?? undefined}
                    title={topic.name}
                    description={topic.description || ""}
                    status={uiStatus} 
                    resources={[]}
                    isLast={index === moduleTopics.length - 1}
                  />
                );
              })}
                  </div>
                </section>;
              }) : topics.map((topic, index) => {
                const questions = topic.Question || [];
                const attemptedQs = questions.filter((question) => bestAnswerMap.has(question.id)).length;
                const completed = questions.length > 0 && attemptedQs === questions.length;
                return <ModuleNode key={topic.id} moduleId={topic.id} missionId={topic.week_number} title={topic.name} description={topic.description || ""} status={completed ? "completed" : "active"} resources={[]} isLast={index === topics.length - 1} />;
              })}
              {!moduleRows?.length && !topics.length && <div className="rounded-xl border border-dashed border-border bg-surface/40 p-8 text-center text-sm text-muted">Season curriculum is being prepared.</div>}
          </div>
        </div>

        {/* HUD */}
        <div className="space-y-6 h-fit lg:sticky lg:top-8">
            <a
                href="https://tn-data.github.io/PFwithPython/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block overflow-hidden border border-cyan-300/25 bg-slate-900/70 p-5 transition hover:border-cyan-300/60"
            >
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(110deg,transparent,rgb(var(--primary)/0.06))]" />
                <div className="relative">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="grid h-10 w-10 place-items-center border border-cyan-300/25 bg-cyan-300/[0.08] text-cyan-300">
                            <BookOpen size={18} />
                        </div>
                        <ExternalLink size={15} className="text-slate-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                    </div>
                    <h2 className="text-base font-bold text-white">Programming Fundamentals</h2>
                    <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-cyan-200/70">Python course reference</p>
                    <p className="mt-3 text-xs leading-5 text-slate-400">Review programming foundations, Python, and data science in the course guide.</p>
                    <div className="mt-4 border-t border-cyan-100/10 pt-3 text-xs font-bold text-cyan-200 transition group-hover:text-white">Open full guide <span aria-hidden="true">↗</span></div>
                </div>
            </a>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                    <LayoutDashboard size={14} /> Campaign Status
                </h3>
                <div className="flex items-end justify-between mb-2">
                    <span className="text-4xl font-bold text-white">{completedMissions}</span>
                    <span className="text-sm text-slate-500 mb-1">/ {totalMissions} Missions</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div 
                        className="h-full bg-cyan-500 transition-all duration-1000" 
                        style={{ width: `${totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0}%` }}
                    />
                </div>
                <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg text-xs text-cyan-400 leading-relaxed">
                    {completedMissions === totalMissions && totalMissions > 0
                        ? "All systems operational. Campaign complete."
                        : "Pending missions detected. Proceed to next objective."}
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-slate-500 text-xs uppercase tracking-widest mb-1">Quiz XP</div>
                        <div className="text-2xl font-bold text-white flex items-center gap-2">
                            {totalXP} <span className="text-sm text-slate-600 font-normal">pts</span>
                        </div>
                    </div>
                    <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl border border-yellow-500/20">
                        <Zap size={24} />
                    </div>
                </div>
            </div>

             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col max-h-[500px]">
                <div className="flex-shrink-0 mb-4">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <FileText size={14} /> Intel Bank
                    </h3>
                </div>
                <div className="overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent flex-1">
                    {COURSE_MATERIALS.length > 0 ? (
                        COURSE_MATERIALS.map((res) => (
                            <a 
                                key={res.url}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center p-2 rounded hover:bg-slate-800 transition-colors cursor-pointer group"
                            >
                                <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center mr-3 border border-blue-500/20 group-hover:border-blue-500/50 transition-colors flex-shrink-0">
                                    <FileText size={14} className="text-blue-400 group-hover:text-blue-300" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm text-slate-300 group-hover:text-white block truncate">{res.title}</span>
                                    <span className="text-[10px] text-slate-500 uppercase">Module {res.moduleNumber} · {res.type}</span>
                                </div>
                                <Download size={14} className="text-slate-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                            </a>
                        ))
                    ) : (
                        <div className="text-xs text-slate-500 italic text-center py-2">
                            No documents available.
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
