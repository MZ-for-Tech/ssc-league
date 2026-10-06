import AdminUsersView from "@/components/admin/AdminUsersView";
import { getAdminPageContext } from "@/lib/auth/admin-page-context";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata("Students", "Manage student accounts and season access in the SSC2 League.");

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { supabase, activeSeasonId, seasonId } = await getAdminPageContext();
  const { data: seasons } = await supabase.from("Season").select("id, name, status").order("id", { ascending: false });
  return <AdminUsersView seasonId={seasonId} activeSeasonId={activeSeasonId} seasons={seasons || []} />;
}
