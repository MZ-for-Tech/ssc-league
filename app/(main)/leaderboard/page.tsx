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
import { loadLeaderboardData } from "@/lib/leaderboard-data";

export const revalidate = 0;
export const dynamic = "force-dynamic";
export const metadata = createPageMetadata("Global Rankings", "View student standings and weekly progress across the SSC2 League.");


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

  const { globalMaxWeek, selectedWeek, displayWeekPrev, leaderboard, graphStudents } = await loadLeaderboardData({
    supabase,
    seasonId,
    myStudentId,
    searchParams,
  });

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
