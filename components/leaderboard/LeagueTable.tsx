"use client";

import React, { useState } from "react";
import { ChevronUp, ChevronDown, Minus, ChevronsUp, ChevronsDown, Trophy, Medal, Crown, Zap, Shield } from "lucide-react";
import clsx from "clsx";

interface StudentData {
  id: string;
  student_id: string;
  full_name: string;
  preferred_name: string;
  avatar_url: string | null;
  current_xp: number;
  current_streak: number;
  rank: number;
  prevRank: number;
  group_id: string;
  current_level: number;
  isMe?: boolean;
}

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

  // Visual Styles per Rank
  const getRankStyle = (rank: number, isMe: boolean | undefined) => {
    if (isMe) return "bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.1)] z-10 scale-[1.01]";
    
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30 hover:border-yellow-500/50";
      case 2: return "bg-gradient-to-r from-slate-300/10 to-transparent border-slate-300/30 hover:border-slate-300/50";
      case 3: return "bg-gradient-to-r from-amber-700/10 to-transparent border-amber-700/30 hover:border-amber-700/50";
      default: return "bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/80 hover:border-slate-700";
    }
  };

  // Rank Badge (The number on the left)
  const renderRankBadge = (rank: number) => {
    if (rank === 1) return <div className="w-8 h-8 rounded-lg bg-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-yellow-500/20"><Trophy size={16} /></div>;
    if (rank === 2) return <div className="w-8 h-8 rounded-lg bg-slate-300 text-slate-900 flex items-center justify-center font-black shadow-lg shadow-slate-300/20"><Medal size={16} /></div>;
    if (rank === 3) return <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-black shadow-lg shadow-amber-600/20"><Medal size={16} /></div>;
    
    return <span className="text-lg font-mono font-bold text-slate-500">#{rank}</span>;
  };

  return (
    <div className="w-full space-y-3">
      
      {/* HEADER ROW */}
      <div className="grid grid-cols-12 px-6 pb-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold opacity-70 border-b border-slate-800/50 mb-2">
        <div className="col-span-2 md:col-span-1 text-center">Rank</div>
        <div className="col-span-7 md:col-span-8 pl-4">Operative</div>
        <div className="col-span-3 md:col-span-3 text-right">XP</div>
      </div>

      <div className="flex flex-col gap-2">
        {visibleRows.map((item, idx) => {
            if (item === "GAP") return <GapRow key={`gap-${idx}`} />;
            const student = item as StudentData;
            
            return (
            <div 
                key={student.id}
                className={clsx(
                    "grid grid-cols-12 items-center p-3 sm:p-4 rounded-xl border backdrop-blur-sm transition-all duration-200 group",
                    getRankStyle(student.rank, student.isMe)
                )}
            >
                {/* 1. RANK & TREND */}
                <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center gap-2">
                    {renderRankBadge(student.rank)}
                    
                    {/* Trend Pill */}
                    {(() => {
                        const diff = student.prevRank - student.rank;
                        if (diff > 0) return (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <ChevronUp size={10} strokeWidth={4} /> {diff}
                            </div>
                        );
                        if (diff < 0) return (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                                <ChevronDown size={10} strokeWidth={4} /> {Math.abs(diff)}
                            </div>
                        );
                        return <div className="text-slate-600 text-[10px]"><Minus size={12} /></div>;
                    })()}
                </div>

                {/* 2. PROFILE */}
                <div className="col-span-7 md:col-span-8 pl-2 sm:pl-6 flex items-center gap-4">
                    <div className="relative shrink-0">
                        <img 
                            src={student.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${student.preferred_name || 'Agent'}`} 
                            alt="Avatar"
                            className={clsx(
                                "w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 shadow-md bg-slate-800",
                                student.isMe ? "border-cyan-400" : "border-slate-700 group-hover:border-slate-600"
                            )}
                        />
                        {/* Crown for #1 */}
                        {student.rank === 1 && (
                            <div className="absolute -top-3 -right-1 text-yellow-400 drop-shadow-lg animate-bounce">
                                <Crown size={16} fill="currentColor" />
                            </div>
                        )}
                        {/* Level Badge (Tiny) */}
                        <div className="absolute -bottom-1 -right-1 bg-slate-900 text-[8px] font-bold text-slate-300 px-1.5 py-px rounded border border-slate-700 shadow-sm">
                            Level {student.current_level}
                        </div>
                    </div>

                    <div className="min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2">
                            <span className={clsx("font-bold text-sm sm:text-base truncate", student.isMe ? "text-cyan-400" : "text-slate-200")}>
                                {student.preferred_name}
                            </span>
                            {/* Group Tag */}
                            {student.group_id && (
                                <span className="hidden sm:inline-flex text-[9px] bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/50 font-mono tracking-wide">
                                    {student.group_id}
                                </span>
                            )}
                        </div>
                        {/* Sub Name (Arabic) */}
                        <div className="text-[10px] sm:text-xs text-slate-500 truncate font-medium">
                            {student.full_name}
                        </div>
                    </div>
                </div>

                {/* 3. XP & STATS */}
                <div className="col-span-3 md:col-span-3 text-right flex flex-col justify-center items-end">
                    <div className="font-mono text-lg sm:text-xl font-black text-white tabular-nums tracking-tight leading-none">
                        {student.current_xp.toLocaleString()}
                    </div>
                    
                    {/* Streak Indicator */}
                    <div className="flex items-center gap-2 mt-1.5">
                        {student.current_streak > 0 ? (
                            <div className={clsx(
                                "flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border",
                                student.current_streak >= 3 
                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                                    : "bg-slate-800 text-slate-500 border-slate-700"
                            )}>
                                <Zap size={8} fill="currentColor" /> 
                                <span className="hidden sm:inline">Streak</span> {student.current_streak}
                            </div>
                        ) : (
                            <div className="text-[9px] text-slate-600 font-medium">No Streak</div>
                        )}
                    </div>
                </div>

            </div>
            );
        })}
      </div>

      {/* FOOTER TOGGLE */}
      {students.length > 5 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/10 hover:bg-slate-900/30 text-[10px] font-bold text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest group mt-2"
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