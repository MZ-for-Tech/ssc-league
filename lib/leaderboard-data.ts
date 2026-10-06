import type { createSupabaseServerClient } from "@/lib/supabase/server";

type RankEntry = { student_id: string; week_number: number; rank: number; total_xp: number };
type LeaderboardStudent = {
  id: string; full_name: string; preferred_name: string; student_id: string; avatar_url: string | null;
  current_xp: number; current_streak: number; group_id: string; current_level: number;
  WeeklyRankHistory: RankEntry[];
};
type RankedStudent = LeaderboardStudent & { rank: number; prevRank: number; isMe: boolean };


export async function loadLeaderboardData({
  supabase,
  seasonId,
  myStudentId,
  searchParams,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  seasonId: string;
  myStudentId: string | null;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 3. FETCH DATA
  const [{ data: studentRows }, { data: rankHistory }] = await Promise.all([
    supabase.from("Student").select("*").eq("season_id", seasonId).order("current_xp", { ascending: false }),
    supabase.from("WeeklyRankHistory").select("student_id, week_number, rank, total_xp").eq("season_id", seasonId).order("week_number"),
  ]);
  const historyByStudent = new Map<string, RankEntry[]>();
  for (const entry of (rankHistory || []) as RankEntry[]) {
    const history = historyByStudent.get(entry.student_id) || [];
    history.push(entry);
    historyByStudent.set(entry.student_id, history);
  }
  const students: LeaderboardStudent[] = ((studentRows || []) as Omit<LeaderboardStudent, "WeeklyRankHistory">[]).map((student) => ({
    ...student,
    preferred_name: student.preferred_name || "",
    current_xp: student.current_xp || 0,
    current_streak: student.current_streak || 0,
    current_level: student.current_level || 1,
    group_id: student.group_id || "",
    student_id: student.student_id || "",
    avatar_url: student.avatar_url || null,
    WeeklyRankHistory: historyByStudent.get(student.id) || [],
  }));

  // 4. DETERMINE CONTEXT
  const params = await searchParams;
  const selectedWeekParam = params?.week;
  let selectedWeek = selectedWeekParam ? parseInt(selectedWeekParam as string) : null;

  let globalMaxWeek = 0;
  students?.forEach(s => {
      s.WeeklyRankHistory.forEach((h) => {
          if (h.week_number > globalMaxWeek) globalMaxWeek = h.week_number;
      });
  });

  if (selectedWeek && selectedWeek > globalMaxWeek) selectedWeek = globalMaxWeek;

  // 5. PROCESS LEADERBOARD DATA
  let leaderboard: RankedStudent[] = [];
  let displayWeekPrev = globalMaxWeek > 1 ? globalMaxWeek - 1 : 1;

  if (selectedWeek) {
      // --- TIME TRAVEL MODE ---
      displayWeekPrev = selectedWeek > 1 ? selectedWeek - 1 : 1;

      leaderboard = (students || []).flatMap((student): RankedStudent[] => {
            const currentEntry = student.WeeklyRankHistory.find((h) => h.week_number === selectedWeek);
            const prevEntry = student.WeeklyRankHistory.find((h) => h.week_number === displayWeekPrev);

            if (!currentEntry) return [];

            return [{
                ...student,
                current_xp: currentEntry.total_xp,
                rank: currentEntry.rank,
                prevRank: prevEntry ? prevEntry.rank : currentEntry.rank,
                isMe: student.id === myStudentId
            }];
        }).sort((a, b) => a.rank - b.rank);

  } else {
      // --- LIVE MODE (With Tie Logic) ---
      let currentRank = 1;
      leaderboard = (students || []).map((student, index, array) => {
          if (index > 0 && student.current_xp === array[index - 1].current_xp) {
              // Same rank as previous
          } else {
              currentRank = index + 1;
          }
          
          const liveRank = currentRank;
          const prevEntry = student.WeeklyRankHistory.find((h) => h.week_number === globalMaxWeek);
          
          return {
              ...student,
              rank: liveRank,
              prevRank: prevEntry ? prevEntry.rank : liveRank,
              isMe: student.id === myStudentId
          };
      });
  }

  // 6. GRAPH DATA
  const graphStudents = (students || []).map(s => ({
      id: s.id,
      full_name: s.full_name,
      preferred_name: s.preferred_name,
      history: s.WeeklyRankHistory.map((h) => ({
          week: h.week_number,
          rank: h.rank
      })).sort((a, b) => a.week - b.week)
  }));

  return { globalMaxWeek, selectedWeek, displayWeekPrev, leaderboard, graphStudents };
}
