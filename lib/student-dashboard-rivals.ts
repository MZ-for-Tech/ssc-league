import type { DashboardRankHistory, DashboardRival, DashboardStudent } from "@/components/dashboard/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RankedStudent = DashboardStudent & { WeeklyRankHistory: DashboardRankHistory[] };
type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export async function loadStudentDashboardRivals({
  supabase,
  seasonId,
  student,
}: {
  supabase: SupabaseServerClient;
  seasonId: string;
  student: RankedStudent;
}) {
  const getRankForXp = async (xp: number) => {
    const { count } = await supabase.from("Student").select("id", { count: "exact", head: true }).eq("season_id", seasonId).gt("current_xp", xp);
    return (count || 0) + 1;
  };

  const currentRank = await getRankForXp(student.current_xp);
  const { data: rivalsAboveData } = await supabase.from("Student")
    .select("id, full_name, preferred_name, current_xp, avatar_url, WeeklyRankHistory!WeeklyRankHistory_season_student_fkey(week_number, rank)")
    .eq("season_id", seasonId).gt("current_xp", student.current_xp).order("current_xp", { ascending: true }).limit(1);
  const { data: rivalsBelowData } = await supabase.from("Student")
    .select("id, full_name, preferred_name, current_xp, avatar_url, WeeklyRankHistory!WeeklyRankHistory_season_student_fkey(week_number, rank)")
    .eq("season_id", seasonId).lt("current_xp", student.current_xp).order("current_xp", { ascending: false }).limit(1);

  const rivalsAbove = rivalsAboveData as unknown as RankedStudent[] | null;
  const rivalsBelow = rivalsBelowData as unknown as RankedStudent[] | null;
  const allHistory: DashboardRankHistory[] = [
    ...(student.WeeklyRankHistory || []),
    ...(rivalsAbove?.[0]?.WeeklyRankHistory || []),
    ...(rivalsBelow?.[0]?.WeeklyRankHistory || []),
  ];
  const globalMaxWeek = allHistory.reduce((maxWeek, history) => Math.max(maxWeek, history.week_number), 0);
  const comparisonWeek = globalMaxWeek > 1 ? globalMaxWeek - 1 : 1;

  const formatRival = async (person: RankedStudent, isMe: boolean, liveRank: number): Promise<DashboardRival> => {
    const historyEntry = person.WeeklyRankHistory?.find((history) => history.week_number === comparisonWeek);
    const previousRank = historyEntry ? historyEntry.rank : liveRank;
    return {
      id: person.id,
      rank: liveRank,
      name: person.preferred_name || person.full_name,
      xp: person.current_xp,
      avatar_url: person.avatar_url,
      trend: previousRank - liveRank,
      isMe,
    };
  };

  const rivals: DashboardRival[] = [];
  if (rivalsAbove?.[0]) {
    rivals.push(await formatRival(rivalsAbove[0], false, await getRankForXp(rivalsAbove[0].current_xp)));
  }
  rivals.push(await formatRival(student, true, currentRank));
  if (rivalsBelow?.[0]) {
    rivals.push(await formatRival(rivalsBelow[0], false, await getRankForXp(rivalsBelow[0].current_xp)));
  }

  return { currentRank, rivals };
}
