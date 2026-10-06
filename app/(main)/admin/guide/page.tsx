import AdminGuideView from "@/components/admin/AdminGuideView";
import { getAdminPageContext } from "@/lib/auth/admin-page-context";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata("Admin Guide", "Operational guidance for managing the SSC2 League.");

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AdminGuidePage() {
  const { seasonId, activeSeasonId } = await getAdminPageContext();
  return <AdminGuideView seasonId={seasonId} activeSeasonId={activeSeasonId} />;
}
