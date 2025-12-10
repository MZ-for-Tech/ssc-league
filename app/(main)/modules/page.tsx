import React from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import ModuleNode from "@/components/modules/ModuleNode"; 
import { 
  LayoutDashboard, Zap, Terminal, Activity, 
  FileText, Download 
} from "lucide-react";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function ModulesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {}
        },
      },
    }
  );

  // --- 1. DETERMINE USER ---
  let studentId = null;
  const impersonateId = cookieStore.get("impersonate_id")?.value;

  if (impersonateId) {
    studentId = impersonateId;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: student } = await supabase
          .from("Student")
          .select("id")
          .eq("auth_id", user.id)
          .single();
      studentId = student?.id;
    }
  }

  // --- 2. FETCH DATA ---
  const { data: topics, error } = await supabase
    .from("Topic")
    .select(`
      id, name, description, week_number,
      TopicResource ( title, type, url ),
      Question ( id )
    `)
    .order("week_number", { ascending: true });

  let userAnswers: any[] = [];
  if (studentId) {
    const { data: answers } = await supabase
      .from("StudentAnswer")
      .select("question_id, is_correct")
      .eq("student_id", studentId);
    if (answers) userAnswers = answers;
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

  topics?.forEach((topic: any) => {
      const questions = topic.Question || [];
      const totalQs = questions.length;
      
      const attemptedQs = questions.filter((q: any) => bestAnswerMap.has(q.id)).length;
      if (totalQs > 0 && attemptedQs === totalQs) {
          completedMissions++;
      }

      const moduleXP = questions.reduce((sum: number, q: any) => {
          if (bestAnswerMap.has(q.id)) {
              return sum + (bestAnswerMap.get(q.id) ? 2 : 1);
          }
          return sum;
      }, 0);
      totalXP += moduleXP;
  });

  const allResources = topics?.flatMap((t: any) => t.TopicResource) || [];
  const quickResources = allResources
    .filter((r: any) => r.type === 'slides' || r.url.endsWith('.pdf'));

  if (error) return <div className="text-red-500 p-10">System Failure.</div>;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Terminal className="text-cyan-400" />
                Mission Control
            </h1>
            <p className="text-slate-400 text-sm mt-1">Select a module to engage training protocols.</p>
        </div>
        <div className="hidden md:flex items-center gap-4">
             <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wider">
                <Activity size={14} /> ONLINE
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* TIMELINE */}
        <div className="lg:col-span-2 relative">
           <div className="absolute left-6 top-4 bottom-0 w-0.5 bg-gradient-to-b from-slate-800 via-slate-800 to-transparent hidden md:block" />

           <div className="space-y-4">
              {topics?.map((topic: any, index: number) => {
                const questions = topic.Question || [];
                const totalQs = questions.length;
                
                const attemptedQs = questions.filter((q: any) => bestAnswerMap.has(q.id)).length;
                const isModuleCompleted = totalQs > 0 && attemptedQs === totalQs;
                
                const prevTopic = index > 0 ? topics[index - 1] : null;
                const prevQuestions = prevTopic?.Question || [];
                const prevAttempted = prevQuestions.filter((q: any) => bestAnswerMap.has(q.id)).length;
                const isPrevCompleted = prevQuestions.length === 0 || prevAttempted === prevQuestions.length;
                
                let uiStatus: "active" | "completed" | "locked" = "locked";
                if (isModuleCompleted) uiStatus = "completed";
                else if (index === 0 || isPrevCompleted) uiStatus = "active";

                return (
                  <ModuleNode
                    key={topic.id}
                    moduleId={topic.id} // <--- Added this to ensure accurate linking
                    missionId={topic.week_number}
                    title={topic.name}
                    description={topic.description}
                    status={uiStatus} 
                    resources={topic.TopicResource || []}
                    isLast={index === topics.length - 1}
                  />
                );
              })}
           </div>
        </div>

        {/* HUD */}
        <div className="space-y-6 h-fit lg:sticky lg:top-8">
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
                    {quickResources.length > 0 ? (
                        quickResources.map((res: any, idx: number) => (
                            <a 
                                key={idx}
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
                                    <span className="text-[10px] text-slate-500 uppercase">{res.type}</span>
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