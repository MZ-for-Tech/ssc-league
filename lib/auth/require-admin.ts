import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required.");
  }

  const adminClient = createSupabaseAdminClient();
  const { data: admin, error: adminError } = await adminClient
    .from("Admin")
    .select("id")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (adminError || !admin) {
    throw new Error("Administrator access required.");
  }

  const { data: activeSeason, error: seasonError } = await adminClient
    .from("Season")
    .select("id")
    .eq("status", "active")
    .single();

  if (seasonError || !activeSeason) {
    throw new Error("There is no active league season.");
  }

  return { user, adminId: admin.id, adminClient, activeSeasonId: activeSeason.id as string };
}
