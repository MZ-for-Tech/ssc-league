import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getImpersonatedStudentId } from "@/lib/auth/impersonation";

export async function getActiveQuizAccess() {
  const sessionClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await sessionClient.auth.getUser();
  if (authError || !user) throw new Error("Authentication required.");

  const adminClient = createSupabaseAdminClient();
  const { data: season, error: seasonError } = await adminClient
    .from("Season").select("id").eq("status", "active").single();
  if (seasonError || !season) throw new Error("There is no active league season.");

  const [{ data: admin }, impersonatedId] = await Promise.all([
    adminClient.from("Admin").select("id").eq("auth_id", user.id).maybeSingle(),
    getImpersonatedStudentId(),
  ]);

  let studentId: string | null = null;
  if (!admin || impersonatedId) {
    const studentQuery = admin && impersonatedId
      ? adminClient.from("Student").select("id").eq("id", impersonatedId)
      : adminClient.from("Student").select("id").eq("auth_id", user.id);
    const { data: student, error: studentError } = await studentQuery
      .eq("season_id", season.id).maybeSingle();
    if (studentError || !student) throw new Error("This account is not enrolled in the active season.");
    studentId = student.id;
  }

  return {
    adminClient,
    studentId,
    seasonId: season.id as string,
    isTeacherPreview: Boolean(admin && !impersonatedId),
  };
}

export async function getActiveQuizLearner() {
  const access = await getActiveQuizAccess();
  if (!access.studentId) throw new Error("A student account is required to submit quiz answers.");
  return { ...access, studentId: access.studentId };
}

