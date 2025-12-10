import React from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import StandingsGraph from "@/components/leaderboard/StandingsGraph";
import LeagueTable from "@/components/leaderboard/LeagueTable";
import WeekSelector from "@/components/leaderboard/WeekSelector"; 
import SkeletonCard from "@/components/SkeletonCard";
import { Trophy, Activity } from "lucide-react";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
     {
       cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: any) {
          cookiesToSet.forEach(({ name, value, options }: any) => {
            cookieStore.set(name, value, options);
          });
        },
       },
     }
  );

  const { data: { user } } = await supabase.auth.getUser();
  let myStudentId = null;

  if (user) {
      const impersonateId = cookieStore.get("impersonate_id")?.value;
      if (impersonateId) {
          const { data: adminCheck } = await supabase.from("Admin").select("id").eq("auth_id", user.id).single();
          if (adminCheck) myStudentId = impersonateId;
      } 
      if (!myStudentId) {
          const { data: student } = await supabase.from("Student").select("id").eq("auth_id", user.id).single();
          myStudentId = student?.id;
      }
  }

  // 3. FETCH DATA
  const { data: students } = await supabase
    .from("Student")
    .select("*, WeeklyRankHistory(week_number, rank, total_xp)")
    .order("current_xp", { ascending: false });

  // 4. DETERMINE CONTEXT
  const params = await searchParams;
  const selectedWeekParam = params?.week;
  let selectedWeek = selectedWeekParam ? parseInt(selectedWeekParam as string) : null;

  let globalMaxWeek = 0;
  students?.forEach(s => {
      s.WeeklyRankHistory?.forEach((h: any) => {
          if (h.week_number > globalMaxWeek) globalMaxWeek = h.week_number;
      });
  });

  if (selectedWeek && selectedWeek > globalMaxWeek) selectedWeek = globalMaxWeek;

  // 5. PROCESS LEADERBOARD DATA
  let leaderboard = [];
  let displayWeekCurrent = globalMaxWeek;
  let displayWeekPrev = globalMaxWeek > 1 ? globalMaxWeek - 1 : 1;

  if (selectedWeek) {
      // --- TIME TRAVEL MODE ---
      displayWeekCurrent = selectedWeek;
      displayWeekPrev = selectedWeek > 1 ? selectedWeek - 1 : 1;

      leaderboard = (students || [])
        .map(student => {
            const currentEntry = student.WeeklyRankHistory?.find((h: any) => h.week_number === selectedWeek);
            const prevEntry = student.WeeklyRankHistory?.find((h: any) => h.week_number === displayWeekPrev);

            if (!currentEntry) return null;

            return {
                ...student,
                current_xp: currentEntry.total_xp,
                rank: currentEntry.rank,
                prevRank: prevEntry ? prevEntry.rank : currentEntry.rank,
                isMe: student.id === myStudentId
            };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => a.rank - b.rank); 

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
          const prevEntry = student.WeeklyRankHistory?.find((h: any) => h.week_number === globalMaxWeek);
          
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
      history: s.WeeklyRankHistory?.map((h: any) => ({
          week: h.week_number,
          rank: h.rank
      })).sort((a: any, b: any) => a.week - b.week) || []
  }));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-4">
      
      {/* --- HEADER (MATCHING MODULES PAGE) --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-slate-800 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Trophy className="text-yellow-400" size={32} />
                Global Rankings
            </h1>
            <p className="text-slate-400 text-sm mt-1">
               Live operative performance and tactical standings.
            </p>
        </div>
        
        <div className="flex items-center gap-4">
             {/* Archive Indicator */}
             {selectedWeek ? (
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                    <Activity size={14} /> Archive Mode
                 </div>
             ) : (
                 <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <Activity size={14} /> Live Feed
                 </div>
             )}

             {/* Trend & Selector */}
             <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                <div className="hidden md:block text-[10px] text-slate-500 font-mono text-right">
                    <div>COMPARED TO</div>
                    <div>WEEK {displayWeekPrev}</div>
                </div>
                <WeekSelector maxWeek={globalMaxWeek} />
             </div>
        </div>
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