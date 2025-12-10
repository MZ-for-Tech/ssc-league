"use client";

import React, { useState } from "react";
import { Radio, Send, Users, ShieldAlert, CheckCircle } from "lucide-react";
import { sendBroadcast } from "@/app/actions/admin-actions";
import clsx from "clsx";

export default function BroadcastWidget() {
  const [message, setMessage] = useState(""); // Note: Requires DB schema support for message text
  const [group, setGroup] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Confirm broadcast transmission?")) return;
    
    setLoading(true);
    // Passing 'info' as default type
    const res = await sendBroadcast(message, group, 'info'); 
    setLoading(false);

    if (res.success) {
        setStatus(`Signal sent to ${res.count} operatives.`);
        setMessage("");
        setTimeout(() => setStatus(null), 3000);
    } else {
        alert(res.message);
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold flex items-center gap-2 uppercase tracking-wider text-sm">
                <Radio className="text-rose-500" size={18} /> Comms Uplink
            </h3>
            <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[9px] text-rose-500 font-mono">LIVE</span>
            </div>
        </div>

        <form onSubmit={handleSend} className="flex-1 flex flex-col gap-4">
            <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Target Frequency</label>
                <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <select 
                        value={group} 
                        onChange={(e) => setGroup(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:border-rose-500 outline-none appearance-none"
                    >
                        <option value="ALL">Global Channel (All)</option>
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

            {/* Note: This visual input exists, but backend needs 'message' column in Ping table to work fully */}
            <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Transmission</label>
                <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter alert message..."
                    className="w-full h-24 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-rose-500 outline-none resize-none"
                />
            </div>

            {status && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                    <CheckCircle size={12} /> {status}
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {loading ? "Transmitting..." : <><Send size={14} /> Broadcast</>}
            </button>
        </form>
    </div>
  );
}