"use client";

import React, { useState } from "react";
import { ChevronsUp, ChevronsDown } from "lucide-react";
import LeagueTableRow from "@/components/leaderboard/LeagueTableRow";
import type { StudentData } from "@/components/leaderboard/league-types";

// "Gap" Row visual - A subtle tactical break
const GapRow = () => (
    <div className="flex justify-center py-2">
        <div className="h-1 w-16 bg-slate-800/50 rounded-full" />
    </div>
);

export default function LeagueTable({ students }: { students: StudentData[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // --- FILTER LOGIC (Top 3 + Context) ---
  let visibleRows: (StudentData | "GAP")[] = [];

  if (isExpanded) {
      visibleRows = students;
  } else {
      const top3 = students.slice(0, 3);
      visibleRows = [...top3];

      const myIndex = students.findIndex(s => s.isMe);
      
      if (myIndex !== -1) {
          if (myIndex < 3) {
              if (students[3]) visibleRows.push(students[3]);
              if (students[4]) visibleRows.push(students[4]);
          } else if (myIndex <= 4) {
              for (let i = 3; i <= myIndex + 1 && i < students.length; i++) {
                  if (!visibleRows.includes(students[i])) visibleRows.push(students[i]);
              }
          } else {
              visibleRows.push("GAP");
              const neighborStart = myIndex - 1;
              const neighborEnd = Math.min(students.length, myIndex + 2);
              const neighbors = students.slice(neighborStart, neighborEnd);
              visibleRows.push(...neighbors);
          }
      } else {
          if (students[3]) visibleRows.push(students[3]);
          if (students[4]) visibleRows.push(students[4]);
      }
  }

  return (
    <div className="w-full space-y-3">
      
      {/* HEADER ROW */}
      <div className="grid grid-cols-12 px-6 pb-2 text-xs uppercase tracking-widest text-slate-500 font-bold opacity-70 border-b border-slate-800/50 mb-2">
        <div className="col-span-2 md:col-span-1 text-center">Rank</div>
        <div className="col-span-7 md:col-span-8 pl-4">Operative</div>
        <div className="col-span-3 md:col-span-3 text-right">XP</div>
      </div>

      <div className="flex flex-col gap-2">
        {visibleRows.map((item, idx) => item === "GAP"
          ? <GapRow key={`gap-${idx}`} />
          : <LeagueTableRow key={item.id} student={item} />)}
      </div>

      {/* FOOTER TOGGLE */}
      {students.length > 5 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/10 hover:bg-slate-900/30 text-xs font-bold text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest group mt-2"
          >
             {isExpanded ? (
                <><ChevronsUp size={14} className="group-hover:-translate-y-0.5 transition-transform" /> Collapse Roster</>
             ) : (
                <><ChevronsDown size={14} className="group-hover:translate-y-0.5 transition-transform" /> Show All {students.length} Operatives</>
             )}
          </button>
      )}
    </div>
  );
}
