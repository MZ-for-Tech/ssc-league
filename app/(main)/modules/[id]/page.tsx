import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Download, ArrowRight, ClipboardList, Zap } from "lucide-react";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSeasonId, getSelectedSeasonId } from "@/lib/seasons";
import { getImpersonatedStudentId } from "@/lib/auth/impersonation";
import { COURSE_MATERIALS } from "@/lib/course-materials";
import { createPageMetadata } from "@/lib/site-metadata";
import { getTopicNameForMetadata } from "@/lib/topic-metadata";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topicName = await getTopicNameForMetadata(id);
  return createPageMetadata(`${topicName} Lesson`, `Lesson materials and course resources for ${topicName}.`);
}

export default async function ModuleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const activeSeasonId = await getActiveSeasonId(supabase);
  const { data: { user } } = await supabase.auth.getUser();
  const { data: adminProfile } = user
    ? await supabase.from("Admin").select("id").eq("auth_id", user.id).maybeSingle()
    : { data: null };
  const isAdmin = Boolean(adminProfile);
  const seasonId = await getSelectedSeasonId(supabase, activeSeasonId, isAdmin);
  const impersonateId = await getImpersonatedStudentId();

  // 1. Fetch Module Info
  const [{ data: rawTopic }, { data: questions }, { data: essays }] = await Promise.all([
    supabase.from("Topic").select("*").eq("id", id).eq("season_id", seasonId).maybeSingle(),
    supabase.from("Question").select("id, points, topic_id").eq("season_id", seasonId).eq("topic_id", id),
    supabase.from("EssayQuestion").select("id").eq("season_id", seasonId).eq("topic_id", id),
  ]);

  if (!rawTopic) return notFound();

  const { data: parentModule } = rawTopic.module_id
    ? await supabase.from("Module").select("module_number").eq("id", rawTopic.module_id).eq("season_id", seasonId).maybeSingle()
    : { data: null };
  const topic = {
    ...rawTopic,
    Question: (questions || []) as Array<{ id: string; points: number | null; topic_id: string }>,
  };
  const courseMaterials = COURSE_MATERIALS.filter((material) =>
    material.moduleNumber === parentModule?.module_number && material.lessonNumbers.includes(rawTopic.lesson_number ?? 0)
  );

  // 2. Check Progress
  let studentId = isAdmin && impersonateId ? impersonateId : null;
  if (!studentId && user && !isAdmin) {
    const { data: student } = await supabase.from("Student").select("id").eq("auth_id", user.id).eq("season_id", seasonId).maybeSingle();
    studentId = student?.id || null;
  }
  let isComplete = false;
  let bestScore = 0;

  if (studentId) {
          const { data: answers } = await supabase.from("StudentAnswer")
            .select("is_correct")
            .in("question_id", topic.Question.map((q: { id: string }) => q.id))
            .eq("student_id", studentId)
            .eq("season_id", seasonId);
          
          const totalQs = topic.Question.length;
          const correct = answers?.filter((a: { is_correct: boolean }) => a.is_correct).length || 0;
          if (totalQs > 0 && answers?.length === totalQs) isComplete = true;
          bestScore = totalQs > 0 ? Math.round((correct / totalQs) * 100) : 0;
  }

  const totalXP = topic.Question.reduce((sum: number, q: { points: number | null }) => sum + (q.points || 10), 0);
  const mcqCount = topic.Question.length;
  const essayCount = essays?.length || 0;
  const totalItemCount = mcqCount + essayCount;
  return (
    <div className="mx-auto w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 space-y-6">
      <Link href="/modules" className="group inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[.14em] text-muted transition hover:text-primary">
        <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" /> Course map
      </Link>

      <header className="instrument-panel relative isolate overflow-hidden border border-primary/25 bg-[linear-gradient(120deg,rgba(10,28,43,.96),rgba(15,27,45,.88)_56%,rgba(20,32,53,.8))] px-6 py-7 sm:px-9 sm:py-9">
        <div className="pointer-events-none absolute -right-10 -top-20 -z-10 h-72 w-72 rotate-45 border border-primary/10" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(115deg,transparent_35%,rgba(34,211,238,.055)_35.2%,transparent_35.5%,transparent_70%,rgba(34,211,238,.04)_70.2%,transparent_70.5%)]" />
        <h1 className="max-w-4xl text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">{topic.name}</h1>
        {topic.description && <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">{topic.description}</p>}
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-primary/15 pt-4 font-mono text-xs uppercase tracking-wider text-muted">
          <span className="inline-flex items-center gap-2"><ClipboardList size={14} className="text-primary" /> {totalItemCount} total · {mcqCount} MCQ · {essayCount} essays</span>
          <span className="inline-flex items-center gap-2"><FileText size={14} className="text-primary" /> {courseMaterials.length} course files</span>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,.8fr)]">
        <main className="min-w-0 space-y-4" aria-label="Course files">
          <h2 className="console-section-heading"><FileText size={15} className="text-primary" /> Course files</h2>
          {courseMaterials.length ? courseMaterials.map((resource) => {
            const lessonPage = resource.lessonPages?.[rawTopic.lesson_number ?? 0];
            return (
              <a key={resource.url} href={`${resource.url}${lessonPage ? `#page=${lessonPage.start}` : ""}`} target="_blank" rel="noopener noreferrer" className="instrument-panel group flex items-center gap-4 border border-primary/15 bg-surface/55 p-4 transition hover:border-primary/45 hover:bg-surface/80 sm:p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-primary/25 bg-primary/10 text-primary"><FileText size={20} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-foreground transition group-hover:text-primary">{resource.title}</span>
                  <span className="mt-1 block font-mono text-xs uppercase tracking-wider text-muted">{resource.type} <span className="text-primary/50">·</span> {lessonPage ? `Pages ${lessonPage.range}` : `Module ${resource.moduleNumber}`}</span>
                </span>
                <Download size={16} className="shrink-0 text-muted transition group-hover:text-primary" />
              </a>
            );
          }) : <div className="instrument-panel border border-dashed border-border/70 bg-surface/30 p-6 text-sm text-muted">No course materials are assigned to this lesson yet.</div>}

        </main>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-6" aria-label="Lesson overview">
          <section className="instrument-panel border border-border bg-surface/55 p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="font-mono text-xs font-bold uppercase tracking-[.15em] text-muted">Lesson overview</h2>
            </div>
            <dl className="space-y-4">
              <div className="flex items-center justify-between gap-3 text-sm"><dt className="text-muted">Multiple choice</dt><dd className="font-mono font-bold text-foreground">{mcqCount}</dd></div>
              <div className="flex items-center justify-between gap-3 text-sm"><dt className="text-muted">Essays</dt><dd className="font-mono font-bold text-foreground">{essayCount}</dd></div>
              <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-4 text-sm"><dt className="text-muted">Total items</dt><dd className="font-mono font-bold text-foreground">{totalItemCount}</dd></div>
              <div className="flex items-center justify-between gap-3 text-sm"><dt className="inline-flex items-center gap-2 text-muted"><Zap size={14} className="text-warning" /> XP reward</dt><dd className="font-mono font-bold text-warning">+{totalXP}</dd></div>
              <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-4 text-sm"><dt className="text-muted">Progress</dt><dd className="font-mono font-bold text-foreground">{studentId ? isComplete ? `Complete · ${bestScore}%` : "Not started" : isAdmin ? "Teacher preview" : "Available"}</dd></div>
            </dl>

            <div className="mt-6 space-y-2 border-t border-border/70 pt-5">
              {(studentId || isAdmin) && seasonId === activeSeasonId ? <Link href={`/modules/${id}/quiz`} className="console-control flex min-h-12 w-full items-center justify-center gap-2 bg-primary px-4 py-3 text-center text-xs font-black text-background shadow-lg shadow-primary/15 transition hover:bg-primary-dim">
                {studentId ? isComplete ? "Retake quiz" : "Start quiz" : "Preview questions"} <ArrowRight size={15} />
              </Link> : <p className="border border-border/70 bg-background/40 px-3 py-3 text-center text-xs text-muted">{seasonId !== activeSeasonId ? "Archived season · read only" : "Quiz access is unavailable."}</p>}
              {essays?.length ? <Link href={`/modules/${id}/essays`} className="console-control flex min-h-11 w-full items-center justify-center border border-border px-4 py-2 text-center text-xs font-bold text-foreground transition hover:border-primary/40 hover:text-primary">{studentId ? "Open essays" : "Review essays"}</Link> : null}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
