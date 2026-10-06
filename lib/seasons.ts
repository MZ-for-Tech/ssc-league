import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const SELECTED_SEASON_COOKIE = "ssc_league_season";

export interface SeasonRecord {
  id: string;
  name: string;
  status: "setup" | "active" | "archived";
}

export async function getActiveSeasonId(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase
    .from("Season")
    .select("id")
    .eq("status", "active")
    .maybeSingle();

  if (error || !data?.id) {
    throw new Error("There is no active league season.");
  }

  return data.id as string;
}

export async function getSelectedSeasonId(
  supabase: SupabaseClient,
  activeSeasonId: string,
  isAdmin: boolean,
): Promise<string> {
  if (!isAdmin) return activeSeasonId;

  const cookieStore = await cookies();
  const selectedSeasonId = cookieStore.get(SELECTED_SEASON_COOKIE)?.value;
  if (!selectedSeasonId) return activeSeasonId;

  const { data } = await supabase
    .from("Season")
    .select("id, status")
    .eq("id", selectedSeasonId)
    .maybeSingle();

  return data && (data.status === "active" || data.status === "archived")
    ? data.id as string
    : activeSeasonId;
}
