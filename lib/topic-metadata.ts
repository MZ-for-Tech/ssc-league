import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSeasonId } from "@/lib/seasons";

export async function getTopicNameForMetadata(topicId: string) {
  const supabase = await createSupabaseServerClient();
  const seasonId = await getActiveSeasonId(supabase);
  const { data } = await supabase
    .from("Topic")
    .select("name")
    .eq("id", topicId)
    .eq("season_id", seasonId)
    .maybeSingle();

  return data?.name || "Lesson";
}
