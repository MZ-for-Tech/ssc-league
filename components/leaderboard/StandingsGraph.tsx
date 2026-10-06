"use client";

import { useMemo, useState } from "react";
import RankHistoryChart, { type RankChartPoint } from "@/components/leaderboard/RankHistoryChart";
import RivalSelector from "@/components/leaderboard/RivalSelector";
import type { StandingsStudent as Student } from "@/components/leaderboard/standings-graph-types";

interface StandingsGraphProps {
  students: Student[];
  myId?: string;
}

export default function StandingsGraph({ students, myId }: StandingsGraphProps) {
  const [rivalId, setRivalId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // --- 1. Prepare Chart Data ---
  const chartData = useMemo(() => {
    const me = students.find(s => s.id === myId);
    const rival = students.find(s => s.id === rivalId);

    // Calculate "Class Average Rank" per week
    const weekRanks: Record<number, number[]> = {};
    students.forEach(s => {
        s.history.forEach(h => {
            if (!weekRanks[h.week]) weekRanks[h.week] = [];
            weekRanks[h.week].push(h.rank);
        });
    });

    const maxWeek = Math.max(...Object.keys(weekRanks).map(Number));
    const data: RankChartPoint[] = [];

    for (let w = 1; w <= maxWeek; w++) {
        const ranks = weekRanks[w] || [];
        const avg = ranks.length > 0 ? ranks.reduce((a, b) => a + b, 0) / ranks.length : 0;

        data.push({
            name: `W${w}`,
            fullWeek: `Week ${w}`,
            average: Math.round(avg),
            myRank: me?.history.find(h => h.week === w)?.rank || null,
            rivalRank: rival?.history.find(h => h.week === w)?.rank || null,
        });
    }
    return data;
  }, [students, myId, rivalId]);

  const maxRank = students.length || 50;
  const selectedRivalName = students.find(s => s.id === rivalId)?.preferred_name || "Rival";

  const filteredStudents = students.filter(s =>
    s.id !== myId &&
    (s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     s.preferred_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full space-y-4">
        <RivalSelector
          students={filteredStudents}
          rivalId={rivalId}
          selectedRivalName={selectedRivalName}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRivalChange={setRivalId}
        />

        <RankHistoryChart
          chartData={chartData}
          maxRank={maxRank}
          rivalId={rivalId}
          selectedRivalName={selectedRivalName}
        />
    </div>
  );
}
