import Link from "next/link";
import { ArrowLeft, FilePenLine } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSeasonId, getSelectedSeasonId } from "@/lib/seasons";
import { getImpersonatedStudentId } from "@/lib/auth/impersonation";
import EssayResponsesView from "@/components/modules/EssayResponsesView";
import { createPageMetadata } from "@/lib/site-metadata";
import { getTopicNameForMetadata } from "@/lib/topic-metadata";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topicName = await getTopicNameForMetadata(id);
  return createPageMetadata(`${topicName} Written Practice`, `Written response practice for ${topicName}.`);
}

export default async function LessonEssaysPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const activeSeasonId = await getActiveSeasonId(supabase);
  const { data: { user } } = await supabase.auth.getUser();
  const { data: admin } = user
    ? await supabase.from("Admin").select("id").eq("auth_id", user.id).maybeSingle()
    : { data: null };
  const isAdmin = Boolean(admin);
  const seasonId = await getSelectedSeasonId(supabase, activeSeasonId, isAdmin);
  const isArchived = seasonId !== activeSeasonId;

  const [{ data: topic }, { data: essays }] = await Promise.all([
    supabase.from("Topic").select("id, name, module_id, lesson_number").eq("id", id).eq("season_id", seasonId).maybeSingle(),
    supabase.from("EssayQuestion")
      .select("id, bank_item_id, prompt, response_type, stimulus_code, stimulus_asset_url, stimulus_asset_alt, display_order")
      .eq("season_id", seasonId).eq("topic_id", id).order("display_order", { ascending: true }),
  ]);

  if (!topic) return <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted">Lesson not found.</div>;

  let studentId: string | null = null;
  const impersonatedId = isAdmin ? await getImpersonatedStudentId() : null;
  if (impersonatedId) {
    const { data } = await supabase.from("Student").select("id").eq("id", impersonatedId).eq("season_id", seasonId).maybeSingle();
    studentId = data?.id || null;
  } else if (user && !isAdmin && !isArchived) {
    const { data } = await supabase.from("Student").select("id").eq("auth_id", user.id).eq("season_id", seasonId).maybeSingle();
    studentId = data?.id || null;
  }

  const { data: savedResponses } = studentId && !isArchived
    ? await supabase.from("StudentEssayResponse").select("essay_question_id, response_text").eq("season_id", seasonId).eq("student_id", studentId)
    : { data: [] };

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 pb-16">
      <Link href={`/modules/${id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-foreground"><ArrowLeft size={16} /> Back to lesson</Link>
      <header className="rounded-2xl border border-border bg-surface/70 p-6 md:p-8">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary"><FilePenLine size={15} /> Written practice</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">{topic.name}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Respond in your own words. Responses are saved for later review and receive no automated mark or score.</p>
      </header>
      <EssayResponsesView
        essays={essays || []}
        existingResponses={savedResponses || []}
        studentId={studentId}
        seasonId={seasonId}
        readOnly={isArchived}
      />
    </main>
  );
}
