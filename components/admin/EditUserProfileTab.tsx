"use client";

import { Save } from "lucide-react";
import type { Dispatch, FormEvent, SetStateAction } from "react";

export type EditUserProfileData = {
  full_name: string;
  student_id: string;
  group_id: string;
  current_xp: number;
};

export function EditUserProfileTab({
  formData,
  setFormData,
  loading,
  onSubmit,
}: {
  formData: EditUserProfileData;
  setFormData: Dispatch<SetStateAction<EditUserProfileData>>;
  loading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs uppercase font-bold text-slate-500">Full Name</label>
                        <input className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-cyan-500 outline-none transition-colors" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs uppercase font-bold text-slate-500">Student ID</label>
                            <input className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-cyan-500 outline-none transition-colors" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs uppercase font-bold text-slate-500">Group Sector</label>
                            <input className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-cyan-500 outline-none transition-colors" value={formData.group_id} onChange={e => setFormData({...formData, group_id: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs uppercase font-bold text-slate-500">Manual XP Override</label>
                        <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-cyan-500 outline-none transition-colors" value={formData.current_xp} onChange={e => setFormData({...formData, current_xp: parseInt(e.target.value)})} />
                        <p className="text-xs text-slate-600">Warning: Direct override. Use &apos;Logistics&apos; tab for transactions.</p>
                    </div>
                    
                    <button disabled={loading} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-4 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50">
                        <Save size={16} /> Save Changes
                    </button>
                </form>
  );
}
