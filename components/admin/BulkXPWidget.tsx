"use client";

import React, { useState } from "react";
import { Zap, Send, Users, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { awardBulkXP } from "@/app/actions/admin-actions";
import clsx from "clsx";

export default function BulkXPWidget() {
  const [amount, setAmount] = useState(10);
  const [group, setGroup] = useState("ALL");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    if (!confirm(`CONFIRM: Award ${amount} XP to ${group}?`)) return;
    
    setIsSubmitting(true);
    setStatus(null);

    // FIX: Only pass 3 arguments. The server action handles auth internally.
    const result = await awardBulkXP(group, amount, reason);

    if (result.success) {
      setStatus({ type: 'success', msg: `Awarded ${amount} XP to ${result.count} agents.` });
      setReason("");
    } else {
      setStatus({ type: 'error', msg: result.message || "Operation failed." });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" /> Logistics
        </h3>
        <span className="text-[10px] text-slate-500 font-mono">XP_INJECTION</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Target</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <select 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:border-yellow-500 outline-none appearance-none"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              >
                <option value="ALL">All Agents</option>
                <option value="G1">Sector G1</option>
                <option value="G2">Sector G2</option>
                <option value="G3">Sector G3</option>
                <option value="G4">Sector G4</option>
                <option value="G5">Sector G5</option>
                <option value="G6">Sector G6</option>
                <option value="G7">Sector G7</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 text-xs font-bold">+</span>
              <input 
                type="number" 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-7 pr-3 text-xs text-white focus:border-yellow-500 outline-none font-mono"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Justification</label>
            <input 
              type="text" 
              placeholder="e.g. In-Class Bonus"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:border-yellow-500 outline-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
        </div>

        {status && (
          <div className={clsx("p-3 rounded-lg flex items-center gap-2 text-xs", 
            status.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          )}>
            {status.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {status.msg}
          </div>
        )}

        <div className="pt-2 mt-auto">
            <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-lg shadow-yellow-500/20 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
            >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> Distribute</>}
            </button>
        </div>

      </form>
    </div>
  );
}