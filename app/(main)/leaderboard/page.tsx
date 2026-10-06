import React from "react";
import StandingsGraph from "@/components/leaderboard/StandingsGraph";
import LeagueTable from "@/components/leaderboard/LeagueTable";
import WeekSelector from "@/components/leaderboard/WeekSelector"; 
import { Trophy, Activity } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getImpersonatedStudentId } from "@/lib/auth/impersonation";
import { getActiveSeasonId, getSelectedSeasonId } from "@/lib/seasons";
import PageHeader from "@/components/PageHeader";
import { createPageMetadata } from "@/lib/site-metadata";

export const revalidate = 0;
export const dynamic = "force-dynamic";
export const metadata = createPageMetadata("Global Rankings", "View student standings and weekly progress across the SSC2 League.");

type RankEntry = { student_id: string; week_number: number; rank: number; total_xp: number };
type LeaderboardStudent = {
  id: string; full_name: string; preferred_name: string; student_id: string; avatar_url: string | null;
  current_xp: number; current_streak: number; group_id: string; current_level: number;
  WeeklyRankHistory: RankEntry[];
};
type RankedStudent = LeaderboardStudent & { rank: number; prevRank: number; isMe: boolean };

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createSupabaseServerClient();
  const activeSeasonId = await getActiveSeasonId(supabase);
  const impersonateId = await getImpersonatedStudentId();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: adminProfile } = user
    ? await supabase.from("Admin").select("id").eq("auth_id", user.id).maybeSingle()
    : { data: null };
  const isAdmin = Boolean(adminProfile);
  const seasonId = await getSelectedSeasonId(supabase, activeSeasonId, isAdmin);
  let myStudentId = null;

  if (user) {
      if (impersonateId && isAdmin) {
          myStudentId = impersonateId;
      } 
      if (!myStudentId && !isAdmin) {
          const { data: student } = await supabase.from("Student").select("id").eq("auth_id", user.id).eq("season_id", seasonId).single();
          myStudentId = student?.id;
      }
  }

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

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4">
      
      {/* --- HEADER (MATCHING MODULES PAGE) --- */}
      <div className="mb-8">
      <PageHeader
        title="Global Rankings"
        icon={<Trophy size={28} />}
        actions={<div className="flex flex-wrap items-center gap-4">
             {/* Archive Indicator */}
             {selectedWeek ? (
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                    <Activity size={14} /> Archive Mode
                 </div>
             ) : null}

             {/* Trend & Selector */}
             <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                <div className="hidden md:block text-xs text-slate-500 font-mono text-right">
                    <div>COMPARED TO</div>
                    <div>WEEK {displayWeekPrev}</div>
                </div>
                <WeekSelector maxWeek={globalMaxWeek} />
             </div>
        </div>}
      />
      </div>

      {/* 1. Leaderboard Table */}
      <div className="space-y-4 mb-12">
        {leaderboard && leaderboard.length > 0 ? (
          <LeagueTable students={leaderboard} />
        ) : (
          <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl">
             <div className="text-slate-500 mb-2">No ranking data available for this period.</div>
             {selectedWeek && <div className="text-xs text-slate-600">Try selecting a different week.</div>}
          </div>
        )}
      </div>

      {/* 2. Graph Area */}
      <div className="space-y-6 pt-8 border-t border-slate-800/50">
         <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity size={20} className="text-slate-500" /> Performance History
            </h2>
         </div>
         
         {globalMaxWeek > 0 ? (
             <StandingsGraph 
                students={graphStudents} 
                myId={myStudentId || undefined} 
             />
         ) : (
             <div className="p-6 border border-slate-800 rounded-xl bg-slate-900/50 text-slate-500 text-sm text-center">
                Not enough history data to generate graph.
             </div>
         )}
      </div>
    </div>
  );
}
