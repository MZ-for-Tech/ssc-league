"use client";

import { ChevronDown, Search, UserPlus, Users, X } from "lucide-react";
import clsx from "clsx";
import Dropdown from "@/components/ui/Dropdown";
import type { StandingsStudent } from "@/components/leaderboard/standings-graph-types";

type RivalSelectorProps = {
  students: StandingsStudent[];
  rivalId: string | null;
  selectedRivalName: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRivalChange: (studentId: string | null) => void;
};

export default function RivalSelector({ students, rivalId, selectedRivalName, searchQuery, onSearchChange, onRivalChange }: RivalSelectorProps) {
  return (
    <>
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

            <Dropdown
                panelRole="dialog"
                panelClassName="w-64 ring-1 ring-slate-800"
                trigger={({ open, toggle, panelId }) => (
                    <button
                        type="button"
                        onClick={toggle}
                        aria-haspopup="dialog"
                        aria-expanded={open}
                        aria-controls={panelId}
                        className={clsx(
                            "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold shadow-sm transition-colors",
                            rivalId
                                ? "border-amber-500/30 bg-amber-950/30 text-amber-400 hover:border-amber-500/50"
                                : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:text-white",
                        )}
                    >
                        {rivalId ? (
                            <>
                                <Users size={14} />
                                Vs. {selectedRivalName}
                                <span
                                    className="ml-1 rounded-full p-0.5 hover:bg-amber-500/20"
                                    onClick={(event) => { event.stopPropagation(); onRivalChange(null); }}
                                >
                                    <X size={12} />
                                </span>
                            </>
                        ) : (
                            <>
                                <UserPlus size={14} /> Compare Agent
                                <ChevronDown size={12} className={clsx("transition-transform", open && "rotate-180")} />
                            </>
                        )}
                    </button>
                )}
            >
                {({ close }) => (
                    <>
                        <div className="p-2 border-b border-slate-800">
                            <div className="relative">
                                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-8 pr-2 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                            {students.map(student => (
                                <button
                                    key={student.id}
                                    onClick={() => { onRivalChange(student.id); close(); }}
                                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex justify-between items-center transition-colors border-b border-slate-800/50 last:border-0"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-200">{student.preferred_name}</span>
                                        <span className="text-xs text-slate-500">{student.full_name}</span>
                                    </div>
                                </button>
                            ))}
                            {students.length === 0 && (
                                <div className="p-4 text-center text-xs text-slate-500 italic">No agents found.</div>
                            )}
                        </div>
                    </>
                )}
            </Dropdown>
        </div>
    </>
  );
}
