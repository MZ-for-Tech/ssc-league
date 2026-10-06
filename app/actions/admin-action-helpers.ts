import type { SupabaseClient } from "@supabase/supabase-js";

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The operation failed.";
}

export async function logAudit(supabaseAdmin: SupabaseClient, adminId: string, action: string, details: string, target: string, seasonId: string | null = null) {
  try {
    await supabaseAdmin.from("AuditLog").insert({
      admin_id: adminId,
      action,
      details,
      target,
      season_id: seasonId,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error("Audit Log Failed:", err);
  }
}

export async function getCurrentWeekNumber(supabaseAdmin: SupabaseClient, seasonId: string) {
  const { data, error } = await supabaseAdmin
    .from("WeeklyRankHistory")
    .select("week_number")
    .eq("season_id", seasonId)
    .order("week_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.week_number ?? 1;
}

export async function getWeekNumberForDate(supabaseAdmin: SupabaseClient, seasonId: string, date: string) {
  const { data, error } = await supabaseAdmin
    .from("SeasonWeek")
    .select("week_number")
    .eq("season_id", seasonId)
    .lte("starts_on", date)
    .gte("ends_on", date)
    .maybeSingle();
  if (error) throw error;
  return data?.week_number ?? getCurrentWeekNumber(supabaseAdmin, seasonId);
}
