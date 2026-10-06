import AdminDashboardView from "@/components/admin/AdminDashboardView";
import { getAdminPageContext } from "@/lib/auth/admin-page-context";
import { getImpersonatedStudentId } from "@/lib/auth/impersonation";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata("Operations", "Monitor league activity and manage season operations.");

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AdminOperationsPage() {
  const { supabase, user, activeSeasonId, seasonId } = await getAdminPageContext();
  const [{ data: seasons }, impersonateId] = await Promise.all([
    supabase.from("Season").select("id, name, status").order("id", { ascending: false }),
    getImpersonatedStudentId(),
  ]);
  const displayName = user.user_metadata?.preferred_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Agent";
  const welcomeName = String(displayName).trim().split(/\s+/)[0] || "Agent";

  return (
    <AdminDashboardView
      totalStudents={0}
      studentsAttempted={0}
      totalQuestions={0}
      totalAttempts={0}
      activityByDay={[]}
      activeLearners={0}
      topicStats={[]}
      activityWindowLabel="Past 7 days"
      recentActivity={[]}
      isImpersonating={Boolean(impersonateId)}
      seasonId={seasonId}
      activeSeasonId={activeSeasonId}
      seasons={seasons || []}
      welcomeName={welcomeName}
      welcomeAvatarUrl={user.user_metadata?.avatar_url || user.user_metadata?.picture || null}
      view="operations"
    />
  );
}
