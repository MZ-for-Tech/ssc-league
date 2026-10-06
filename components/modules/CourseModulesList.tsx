import ModuleNode from "@/components/modules/ModuleNode";
import type { CourseModule, ModuleTopic } from "@/components/modules/module-types";

export default function CourseModulesList({
  modules,
  topics,
  bestAnswerMap,
}: {
  modules: CourseModule[] | null;
  topics: ModuleTopic[];
  bestAnswerMap: Map<string, boolean>;
}) {
  return (
    <main className="min-w-0 space-y-8" aria-label="Course lessons">
      {modules?.length ? modules.map((module) => {
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
      {!modules?.length && !topics.length && <div className="instrument-panel border border-dashed border-border bg-surface/40 p-8 text-center text-sm text-muted">Season curriculum is being prepared.</div>}
    </main>
  );
}
