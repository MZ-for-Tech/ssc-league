"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Search, ChevronDown, X, UserPlus, Users } from "lucide-react";
import clsx from "clsx";

interface HistoryPoint {
  week: number;
  rank: number;
}

interface Student {
  id: string;
  full_name: string;
  preferred_name: string;
  history: HistoryPoint[];
}

interface StandingsGraphProps {
  students: Student[];
  myId?: string;
}

export default function StandingsGraph({ students, myId }: StandingsGraphProps) {
  const [rivalId, setRivalId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    const data = [];

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

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStudents = students.filter(s => 
    s.id !== myId && 
    (s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     s.preferred_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-0.5 bg-cyan-400"></span>
                    <span>You</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-0.5 bg-slate-600 border-dashed"></span>
                    <span>Avg</span>
                </div>
                {rivalId && (
                    <div className="flex items-center gap-2 animate-in fade-in">
                        <span className="w-2 h-0.5 bg-amber-400"></span>
                        <span className="text-amber-500">{selectedRivalName}</span>
                    </div>
                )}
            </div>

            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={clsx(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border shadow-sm",
                        rivalId 
                            ? "bg-amber-950/30 text-amber-400 border-amber-500/30 hover:border-amber-500/50" 
                            : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:border-slate-600"
                    )}
                >
                    {rivalId ? (
                        <>
                            <Users size={14} />
                            Vs. {selectedRivalName}
                            <div 
                                className="ml-1 p-0.5 rounded-full hover:bg-amber-500/20"
                                onClick={(e) => { e.stopPropagation(); setRivalId(null); }}
                            >
                                <X size={12} />
                            </div>
                        </>
                    ) : (
                        <>
                            <UserPlus size={14} /> Compare Agent
                            <ChevronDown size={12} />
                        </>
                    )}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-slate-800">
                        <div className="p-2 border-b border-slate-800">
                            <div className="relative">
                                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input 
                                    type="text" 
                                    placeholder="Search by name..." 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-8 pr-2 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                            {filteredStudents.map(student => (
                                <button
                                    key={student.id}
                                    onClick={() => { setRivalId(student.id); setIsDropdownOpen(false); }}
                                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex justify-between items-center transition-colors border-b border-slate-800/50 last:border-0"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-200">{student.preferred_name}</span>
                                        <span className="text-[10px] text-slate-500">{student.full_name}</span>
                                    </div>
                                </button>
                            ))}
                            {filteredStudents.length === 0 && (
                                <div className="p-4 text-center text-xs text-slate-500 italic">No agents found.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Chart Container */}
        <div 
            className="h-[400px] w-full bg-slate-900/20 border border-slate-800/50 rounded-xl p-4 relative"
            style={{ minHeight: "400px" }}
        >
           <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                
                <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickMargin={10}
                />
                
                <YAxis 
                    reversed 
                    stroke="#64748b" 
                    fontSize={10} 
                    width={40}
                    tickFormatter={(val) => `#${val}`}
                    tickLine={false} 
                    axisLine={false} 
                    domain={[1, maxRank]} 
                />
                
                <Tooltip 
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                                <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs min-w-[140px]">
                                    <p className="text-slate-400 font-bold mb-2 uppercase tracking-wider border-b border-slate-800 pb-1">{data.fullWeek}</p>
                                    
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-cyan-400 font-bold">You</span>
                                            <span className="text-white font-mono">#{data.myRank ?? "-"}</span>
                                        </div>
                                        {rivalId && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-amber-400 font-bold">{selectedRivalName}</span>
                                                <span className="text-white font-mono">#{data.rivalRank ?? "-"}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-slate-500">
                                            <span>Average</span>
                                            <span className="font-mono">#{data.average}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />

                <Line 
                    type="monotone" 
                    dataKey="average" 
                    stroke="#475569" 
                    strokeWidth={2} 
                    strokeDasharray="4 4" 
                    dot={false}
                    activeDot={false}
                />

                {rivalId && (
                    <Line 
                        type="monotone" 
                        dataKey="rivalRank" 
                        stroke="#fbbf24" 
                        strokeWidth={2} 
                        dot={{ r: 3, fill: "#fbbf24", strokeWidth: 0 }} 
                        activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }} 
                        animationDuration={1000} 
                    />
                )}

                <Line 
                    type="monotone" 
                    dataKey="myRank" 
                    stroke="#22d3ee" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: "#22d3ee", strokeWidth: 2, stroke: "#fff" }} 
                    activeDot={{ r: 6, stroke: "#fff", strokeWidth: 3 }} 
                    animationDuration={1500} 
                />
            </LineChart>
           </ResponsiveContainer>
        </div>
    </div>
  );
}