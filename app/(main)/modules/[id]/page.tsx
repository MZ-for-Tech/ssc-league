import React from "react";
import Link from "next/link";
import { ArrowLeft, Terminal, FileText, Download, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSeasonId, getSelectedSeasonId } from "@/lib/seasons";
import { getImpersonatedStudentId } from "@/lib/auth/impersonation";
import { COURSE_MATERIALS } from "@/lib/course-materials";

export const revalidate = 0;

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
  const courseMaterials = COURSE_MATERIALS.filter((material) => material.moduleNumber === parentModule?.module_number);

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

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <Link href="/modules" className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-8 text-sm font-bold uppercase tracking-wider group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Return to Mission Control
      </Link>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/50 p-8 mb-8">
         <div className="absolute top-0 right-0 p-8 opacity-10"><Terminal size={120} /></div>
         <div className="relative z-10">
             <div className="flex items-center gap-3 mb-2 text-primary font-mono text-xs font-bold uppercase tracking-widest">
                 <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                 Mission Briefing // M-{topic.week_number}
             </div>
             <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">{topic.name}</h1>
             <p className="text-lg text-muted max-w-2xl leading-relaxed">{topic.description || "Classified intel. Review materials before engaging."}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resources */}
          <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border pb-2">
                      <FileText size={16} className="text-muted" /> Operational Resources
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                      {courseMaterials.length > 0 ? (
                          courseMaterials.map((res) => (
                              <a key={res.url} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-primary/50 hover:bg-surface-light transition-all group">
                                  <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border group-hover:border-primary/30">
                                      <FileText size={20} className="text-blue-400" />
                                  </div>
                                  <div className="flex-1">
                                      <div className="font-bold text-foreground group-hover:text-primary transition-colors">{res.title}</div>
                                      <div className="text-xs text-muted uppercase font-mono">{res.type}</div>
                                  </div>
                                  <Download size={16} className="text-muted group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                              </a>
                          ))
                      ) : <div className="p-6 border border-dashed border-border rounded-xl text-center text-muted text-sm">No course materials are assigned to this module yet.</div>}
                  </div>
              </div>
          </div>

          {/* Action Card */}
          <div className="space-y-6">
              <div className="bg-surface/80 border border-border rounded-2xl p-6 sticky top-6 shadow-2xl">
                  <h3 className="text-foreground font-bold mb-6 flex items-center gap-2"><ShieldAlert className="text-warning" size={18} /> Mission Parameters</h3>
                  <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center text-sm"><span className="text-muted">Objectives</span><span className="text-foreground font-mono font-bold">{topic.Question.length} Qs</span></div>
                      <div className="flex justify-between items-center text-sm"><span className="text-muted">Written practice</span><span className="text-foreground font-mono font-bold">{essays?.length || 0} prompts</span></div>
                      <div className="flex justify-between items-center text-sm"><span className="text-muted">XP Reward</span><span className="text-warning font-mono font-bold">+{totalXP} XP</span></div>
                      <div className="flex justify-between items-center text-sm"><span className="text-muted">Status</span>{isComplete ? <span className="text-success font-bold flex items-center gap-1"><CheckCircle2 size={14} /> COMPLETE ({bestScore}%)</span> : <span className="text-muted font-bold">PENDING</span>}</div>
                  </div>
                  {studentId && seasonId === activeSeasonId ? (
                    <div className="space-y-3">
                    <Link href={`/modules/${id}/quiz`}>
                      <button className="w-full py-4 bg-primary hover:bg-primary-dim text-background font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all group relative overflow-hidden">
                        <span className="relative flex items-center gap-2 uppercase tracking-wider text-xs">{isComplete ? "Replay Simulation" : "Engage Mission"} <ArrowRight size={16} /></span>
                      </button>
                    </Link>
                    <Link href={`/modules/${id}/essays`} className="block w-full rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:border-primary/50 hover:text-primary">Open written responses</Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                    <div className="rounded-xl border border-border bg-background/50 px-4 py-3 text-center text-xs text-muted">
                      {seasonId !== activeSeasonId ? "Archived season · read only" : "Teaching preview · student access required to attempt questions"}
                    </div>
                    {essays?.length ? <Link href={`/modules/${id}/essays`} className="block w-full rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:border-primary/50 hover:text-primary">Review written prompts</Link> : null}
                    </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}
