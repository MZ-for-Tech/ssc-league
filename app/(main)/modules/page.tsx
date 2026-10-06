import React from "react";
import { BookOpen } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getImpersonatedStudentId } from "@/lib/auth/impersonation";
import { getActiveSeasonId, getSelectedSeasonId } from "@/lib/seasons";
import PageHeader from "@/components/PageHeader";
import { createPageMetadata } from "@/lib/site-metadata";
import CourseInformationSidebar from "@/components/modules/CourseInformationSidebar";
import CourseModulesList from "@/components/modules/CourseModulesList";
import type { ModuleTopic, StudentAnswer } from "@/components/modules/module-types";

export const revalidate = 0;
export const dynamic = "force-dynamic";
export const metadata = createPageMetadata("Course Map", "Explore SSC2 League modules, lessons, course files, and Python practice.");

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
        <CourseModulesList
          modules={moduleRows}
          topics={topics}
          bestAnswerMap={bestAnswerMap}
        />

        <CourseInformationSidebar
          completedMissions={completedMissions}
          totalMissions={totalMissions}
          totalXP={totalXP}
        />
      </div>
    </div>
  );
}
