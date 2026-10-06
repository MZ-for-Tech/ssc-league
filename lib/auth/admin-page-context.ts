import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSeasonId, getSelectedSeasonId } from "@/lib/seasons";

export async function getAdminPageContext() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  const { data: admin } = await supabase.from("Admin").select("id").eq("auth_id", user.id).maybeSingle();
  if (!admin) redirect("/dashboard");

  const activeSeasonId = await getActiveSeasonId(supabase);
  const seasonId = await getSelectedSeasonId(supabase, activeSeasonId, true);
  return { supabase, user, activeSeasonId, seasonId };
}
