import AdminQuestionsView from "@/components/admin/AdminQuestionsView";
import { getAdminPageContext } from "@/lib/auth/admin-page-context";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AdminQuestionsPage() {
  const { supabase, activeSeasonId, seasonId } = await getAdminPageContext();
  const { data: seasons } = await supabase.from("Season").select("id, name, status").order("id", { ascending: false });
  return <AdminQuestionsView seasonId={seasonId} activeSeasonId={activeSeasonId} seasons={seasons || []} />;
}
