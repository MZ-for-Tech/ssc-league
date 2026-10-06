import DashboardView from "@/components/dashboard/DashboardView";
import StudentDashboardPreview from "@/components/dashboard/StudentDashboardPreview";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getImpersonatedStudentId } from "@/lib/auth/impersonation";
import { getActiveSeasonId, getSelectedSeasonId } from "@/lib/seasons";
import { redirect } from "next/navigation";
import { createPageMetadata } from "@/lib/site-metadata";
import { loadStudentDashboardData } from "@/lib/student-dashboard-data";

export const revalidate = 0;
export const dynamic = "force-dynamic";
export const metadata = createPageMetadata("Dashboard", "See your SSC2 League progress, current objectives, and recent activity.");

interface DashboardPageProps {
  searchParams?: Promise<{ view?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createSupabaseServerClient();
  const activeSeasonId = await getActiveSeasonId(supabase);

  let user;
  try {
    const response = await supabase.auth.getUser();
    user = response.data.user;
  } catch {
    return <div className="p-8 text-red-400">Access Denied.</div>;
  }
  if (!user) return <div className="p-8 text-red-400">Access Denied.</div>;

  const [{ data: adminProfile }, impersonateId] = await Promise.all([
    supabase.from("Admin").select("id").eq("auth_id", user.id).maybeSingle(),
    getImpersonatedStudentId(),
  ]);
  const params = searchParams ? await searchParams : {};
  const isAdmin = Boolean(adminProfile);
  const selectedSeasonId = await getSelectedSeasonId(supabase, activeSeasonId, isAdmin);
  const dashboardSeasonId = isAdmin ? selectedSeasonId : activeSeasonId;

  if (isAdmin && params.view === "student" && !impersonateId) return <StudentDashboardPreview />;
  if (isAdmin && !impersonateId) redirect("/admin");

  let targetId = user.id;
  let lookupByAuthId = true;

  if (impersonateId && isAdmin) {
    targetId = impersonateId;
    lookupByAuthId = false;
  }

  const { dashboard, studentError } = await loadStudentDashboardData({ supabase, dashboardSeasonId, targetId, lookupByAuthId });
  if (studentError) console.error("Unable to load the student dashboard:", studentError);
  if (studentError) return <div className="rounded-xl border border-border bg-surface/50 p-8 text-center text-muted">Your dashboard could not be loaded. Please refresh and try again.</div>;
  if (!dashboard) return <div className="rounded-xl border border-border bg-surface/50 p-8 text-center text-muted">Your account is not enrolled in the active season.</div>;

  return <DashboardView {...dashboard} />;
}
