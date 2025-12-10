import React from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Terminal, FileText, PlayCircle, Download, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function ModuleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // 1. Fetch Module Info
  const { data: topic } = await supabase
    .from("Topic")
    .select(`*, TopicResource ( title, type, url ), Question ( id, points )`)
    .eq("id", id)
    .single();

  if (!topic) return notFound();

  // 2. Check Progress
  const { data: { user } } = await supabase.auth.getUser();
  let isComplete = false;
  let bestScore = 0;

  if (user) {
      const { data: student } = await supabase.from("Student").select("id").eq("auth_id", user.id).single();
      if (student) {
          const { data: answers } = await supabase.from("StudentAnswer")
            .select("is_correct")
            .in("question_id", topic.Question.map((q: any) => q.id))
            .eq("student_id", student.id);
          
          const totalQs = topic.Question.length;
          const correct = answers?.filter((a: any) => a.is_correct).length || 0;
          if (totalQs > 0 && answers?.length === totalQs) isComplete = true;
          bestScore = totalQs > 0 ? Math.round((correct / totalQs) * 100) : 0;
      }
  }

  const totalXP = topic.Question.reduce((sum: number, q: any) => sum + (q.points || 10), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4">
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
                      {topic.TopicResource?.length > 0 ? (
                          topic.TopicResource.map((res: any, idx: number) => (
                              <a key={idx} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-primary/50 hover:bg-surface-light transition-all group">
                                  <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border group-hover:border-primary/30">
                                      {res.type === 'video' ? <PlayCircle size={20} className="text-primary" /> : <FileText size={20} className="text-blue-400" />}
                                  </div>
                                  <div className="flex-1">
                                      <div className="font-bold text-foreground group-hover:text-primary transition-colors">{res.title}</div>
                                      <div className="text-xs text-muted uppercase font-mono">{res.type}</div>
                                  </div>
                                  <Download size={16} className="text-muted group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                              </a>
                          ))
                      ) : <div className="p-6 border border-dashed border-border rounded-xl text-center text-muted text-sm">No intel documents attached.</div>}
                  </div>
              </div>
          </div>

          {/* Action Card */}
          <div className="space-y-6">
              <div className="bg-surface/80 border border-border rounded-2xl p-6 sticky top-6 shadow-2xl">
                  <h3 className="text-foreground font-bold mb-6 flex items-center gap-2"><ShieldAlert className="text-warning" size={18} /> Mission Parameters</h3>
                  <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center text-sm"><span className="text-muted">Objectives</span><span className="text-foreground font-mono font-bold">{topic.Question.length} Qs</span></div>
                      <div className="flex justify-between items-center text-sm"><span className="text-muted">XP Reward</span><span className="text-warning font-mono font-bold">+{totalXP} XP</span></div>
                      <div className="flex justify-between items-center text-sm"><span className="text-muted">Status</span>{isComplete ? <span className="text-success font-bold flex items-center gap-1"><CheckCircle2 size={14} /> COMPLETE ({bestScore}%)</span> : <span className="text-muted font-bold">PENDING</span>}</div>
                  </div>
                  <Link href={`/modules/${id}/quiz`}>
                      <button className="w-full py-4 bg-primary hover:bg-primary-dim text-background font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all group relative overflow-hidden">
                          <span className="relative flex items-center gap-2 uppercase tracking-wider text-xs">{isComplete ? "Replay Simulation" : "Engage Mission"} <ArrowRight size={16} /></span>
                      </button>
                  </Link>
              </div>
          </div>
      </div>
    </div>
  );
}