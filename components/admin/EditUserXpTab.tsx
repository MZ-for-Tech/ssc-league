"use client";

import { Zap } from "lucide-react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { EditUserProfileData } from "@/components/admin/EditUserProfileTab";

export function EditUserXpTab({
  formData,
  xpAmount,
  setXpAmount,
  xpReason,
  setXpReason,
  loading,
  onSubmit,
}: {
  formData: EditUserProfileData;
  xpAmount: number;
  setXpAmount: Dispatch<SetStateAction<number>>;
  xpReason: string;
  setXpReason: Dispatch<SetStateAction<string>>;
  loading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-500">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-white">{formData.current_xp.toLocaleString()} XP</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wide">Current Balance</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs uppercase font-bold text-slate-500">Adjustment Amount (+/-)</label>
                            <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-lg font-mono text-white focus:border-yellow-500 outline-none transition-colors" value={xpAmount} onChange={e => setXpAmount(parseInt(e.target.value))} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs uppercase font-bold text-slate-500">Transaction Reason</label>
                            <input type="text" placeholder="e.g. Correction, Bonus Mission, Penalty" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none transition-colors" value={xpReason} onChange={e => setXpReason(e.target.value)} />
                        </div>
                    </div>

                    <button disabled={loading} className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50">
                        <Zap size={16} /> Execute Transaction
                    </button>
                </form>
  );
}
