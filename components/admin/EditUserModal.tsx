"use client";

import React, { useState } from "react";
import { X, Save, User, Shield, Zap, Key, AlertCircle, CheckCircle, RotateCcw } from "lucide-react";
import { updateStudent, awardStudentXP, resetAgentPassword } from "@/app/actions/admin-actions";
import clsx from "clsx";

interface EditUserModalProps {
  user: any;
  onClose: () => void;
  onRefresh: () => void;
}

export default function EditUserModal({ user, onClose, onRefresh }: EditUserModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "xp" | "security">("profile");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // Profile State
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    student_id: user.student_id || "",
    group_id: user.group_id || "",
    current_xp: user.current_xp || 0
  });

  // XP State
  const [xpAmount, setXpAmount] = useState(10);
  const [xpReason, setXpReason] = useState("");

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const res = await updateStudent(user.id, formData);
    setLoading(false);
    if (res.success) {
      setStatus({ type: "success", msg: "Profile updated successfully." });
      onRefresh();
    } else {
      setStatus({ type: "error", msg: res.message || "Failed to update." });
    }
  };

  const handleXpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const res = await awardStudentXP(user.id, xpAmount, xpReason || "Admin Adjustment");
    setLoading(false);
    if (res.success) {
      setStatus({ type: "success", msg: `XP adjusted. New Total: ${res.newXP}` });
      setFormData(prev => ({ ...prev, current_xp: res.newXP })); // Update local state for immediate feedback
      setXpAmount(10);
      setXpReason("");
      onRefresh();
    } else {
      setStatus({ type: "error", msg: res.message || "Failed to award XP." });
    }
  };

  const handleResetPassword = async () => {
    if (!confirm(`CONFIRM: Reset password for ${user.full_name}?\n\nThis will set it to the default pattern: Agent[ID]!`)) return;
    
    setLoading(true);
    setStatus(null);
    
    const res = await resetAgentPassword(user.auth_id, user.student_id);
    setLoading(false);
    
    if (res.success) {
      setStatus({ type: "success", msg: res.message || "Password reset." });
    } else {
      setStatus({ type: "error", msg: res.message || "Reset failed." });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-white">{user.full_name}</h3>
                <p className="text-sm text-slate-400 font-mono flex items-center gap-2">
                    {user.student_id} 
                    <span className="w-1 h-1 bg-slate-600 rounded-full"/> 
                    {user.group_id}
                </p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50">
            {[
                { id: "profile", label: "Profile Data", icon: User },
                { id: "xp", label: "XP Logistics", icon: Zap },
                { id: "security", label: "Security", icon: Shield },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setStatus(null); }}
                    className={clsx(
                        "flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all relative",
                        activeTab === tab.id 
                            ? "text-white bg-slate-800" 
                            : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                    )}
                >
                    <tab.icon size={14} className={activeTab === tab.id ? "text-cyan-400" : ""} /> 
                    {tab.label}
                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400" />}
                </button>
            ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto">
            
            {status && (
                <div className={clsx("mb-6 p-3 rounded-xl flex items-center gap-3 text-xs font-bold border", status.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400")}>
                    {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {status.msg}
                </div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === "profile" && (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Full Name</label>
                        <input className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-cyan-500 outline-none transition-colors" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Student ID</label>
                            <input className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-cyan-500 outline-none transition-colors" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Group Sector</label>
                            <input className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-cyan-500 outline-none transition-colors" value={formData.group_id} onChange={e => setFormData({...formData, group_id: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Manual XP Override</label>
                        <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-cyan-500 outline-none transition-colors" value={formData.current_xp} onChange={e => setFormData({...formData, current_xp: parseInt(e.target.value)})} />
                        <p className="text-[10px] text-slate-600">Warning: Direct override. Use 'Logistics' tab for transactions.</p>
                    </div>
                    
                    <button disabled={loading} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-4 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50">
                        <Save size={16} /> Save Changes
                    </button>
                </form>
            )}

            {/* TAB: LOGISTICS (XP) */}
            {activeTab === "xp" && (
                <form onSubmit={handleXpSubmit} className="space-y-6">
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
                            <label className="text-[10px] uppercase font-bold text-slate-500">Adjustment Amount (+/-)</label>
                            <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-lg font-mono text-white focus:border-yellow-500 outline-none transition-colors" value={xpAmount} onChange={e => setXpAmount(parseInt(e.target.value))} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Transaction Reason</label>
                            <input type="text" placeholder="e.g. Correction, Bonus Mission, Penalty" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-yellow-500 outline-none transition-colors" value={xpReason} onChange={e => setXpReason(e.target.value)} />
                        </div>
                    </div>

                    <button disabled={loading} className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50">
                        <Zap size={16} /> Execute Transaction
                    </button>
                </form>
            )}

            {/* TAB: SECURITY */}
            {activeTab === "security" && (
                <div className="space-y-8 text-center py-4">
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 border border-rose-500/20">
                            <Key size={32} className="text-rose-500" />
                        </div>
                        <h4 className="text-white font-bold text-lg">Credential Reset Protocol</h4>
                        <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
                            This action will reset the operative's password to the system default format:
                        </p>
                        <code className="mt-4 block bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg text-cyan-400 font-mono text-sm">
                            Agent{user.student_id}!
                        </code>
                    </div>
                    
                    <div className="space-y-3 border-t border-slate-800 pt-6">
                        <button 
                            onClick={handleResetPassword}
                            disabled={loading}
                            className="w-full py-3 bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700 hover:border-transparent group"
                        >
                            <RotateCcw size={16} className="group-hover:-rotate-180 transition-transform duration-500" /> 
                            Reset Password
                        </button>
                        <p className="text-[10px] text-slate-500">
                            Action logged in Admin Audit Trail.
                        </p>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}