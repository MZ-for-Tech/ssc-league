"use client";

import React, { useState } from "react";
import { ClipboardCheck, CheckCircle2, XCircle, Clock } from "lucide-react";
import { markGroupAttendance } from "@/app/actions/admin-actions";
import clsx from "clsx";

export default function AttendanceWidget() {
  const [group, setGroup] = useState("G1");
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleMark = async (status: 'PRESENT' | 'ABSENT') => {
    if (!confirm(`Mark entire ${group} as ${status} for today?`)) return;
    
    setLoading(true);
    const res = await markGroupAttendance(group, status);
    setLoading(false);

    if (res.success) {
        setLastAction(`${status} logged for ${res.count} agents in ${group}.`);
        setTimeout(() => setLastAction(null), 4000);
    } else {
        alert(res.message);
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold flex items-center gap-2 uppercase tracking-wider text-sm">
                <ClipboardCheck className="text-emerald-400" size={18} /> Quick Muster
            </h3>
            <span className="text-[9px] text-slate-500 font-mono border border-slate-800 px-1.5 py-0.5 rounded">
                {new Date().toLocaleDateString()}
            </span>
        </div>

        <div className="flex-1 space-y-4">
            <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Select Sector</label>
                <div className="grid grid-cols-4 gap-2">
                    {['G1','G2','G3','G4','G5','G6','G7'].map(g => (
                        <button
                            key={g}
                            onClick={() => setGroup(g)}
                            className={clsx(
                                "py-2 rounded-lg text-xs font-bold font-mono border transition-all",
                                group === g 
                                    ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                                    : "bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500"
                            )}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                    onClick={() => handleMark('PRESENT')}
                    disabled={loading}
                    className="flex flex-col items-center justify-center gap-2 py-4 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all disabled:opacity-50"
                >
                    <CheckCircle2 size={20} />
                    <span className="text-xs font-bold uppercase">Mark Present</span>
                </button>
                <button 
                    onClick={() => handleMark('ABSENT')}
                    disabled={loading}
                    className="flex flex-col items-center justify-center gap-2 py-4 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all disabled:opacity-50"
                >
                    <XCircle size={20} />
                    <span className="text-xs font-bold uppercase">Mark Absent</span>
                </button>
            </div>

            {lastAction && (
                <div className="text-[10px] text-center text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
                    {lastAction}
                </div>
            )}
        </div>
    </div>
  );
}