"use client";

import React, { useState } from "react";
import { X, User, Shield, Zap, AlertCircle, CheckCircle } from "lucide-react";
import { updateStudent, awardStudentXP, resetAgentPassword } from "@/app/actions/admin-student-profile";
import clsx from "clsx";
import { EditUserProfileTab } from "@/components/admin/EditUserProfileTab";
import { EditUserXpTab } from "@/components/admin/EditUserXpTab";
import { EditUserSecurityTab } from "@/components/admin/EditUserSecurityTab";

interface EditUserModalProps {
  user: { id: string; full_name: string; student_id: string; group_id: string; current_xp: number | null };
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
    if (!confirm(`CONFIRM: Reset password for ${user.full_name}?\n\nA random temporary password will be generated.`)) return;
    
    setLoading(true);
    setStatus(null);
    
    const res = await resetAgentPassword(user.id);
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
                    onClick={() => { setActiveTab(tab.id as "profile" | "xp" | "security"); setStatus(null); }}
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
            {activeTab === "profile" && <EditUserProfileTab formData={formData} setFormData={setFormData} loading={loading} onSubmit={handleProfileSubmit} />}

            {/* TAB: LOGISTICS (XP) */}
            {activeTab === "xp" && <EditUserXpTab formData={formData} xpAmount={xpAmount} setXpAmount={setXpAmount} xpReason={xpReason} setXpReason={setXpReason} loading={loading} onSubmit={handleXpSubmit} />}

            {/* TAB: SECURITY */}
            {activeTab === "security" && <EditUserSecurityTab status={status} loading={loading} onResetPassword={handleResetPassword} />}

        </div>
      </div>
    </div>
  );
}
