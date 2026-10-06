import AdminDashboardView from "@/components/admin/AdminDashboardView";
import { loadAdminDashboardData } from "@/lib/admin-dashboard-data";
import { getAdminPageContext } from "@/lib/auth/admin-page-context";
import { getImpersonatedStudentId } from "@/lib/auth/impersonation";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata("Admin Dashboard", "League overview and administration tools for SSC2 League staff.");

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const { supabase, user, activeSeasonId, seasonId } = await getAdminPageContext();
  const impersonateId = await getImpersonatedStudentId();
  const dashboardData = await loadAdminDashboardData({ supabase, seasonId, activeSeasonId });
  const adminDisplayName = user.user_metadata?.preferred_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Agent";
  const welcomeName = String(adminDisplayName).trim().split(/\s+/)[0] || "Agent";
  const welcomeAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  return (
    <AdminDashboardView
      {...dashboardData}
      isImpersonating={Boolean(impersonateId)}
      seasonId={seasonId}
      activeSeasonId={activeSeasonId}
      welcomeName={welcomeName}
      welcomeAvatarUrl={welcomeAvatarUrl}
    />
  );
}
