"use client";

import React, { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Users, Search, Shield, Trash2, Eye, ShieldOff, Plus, X, Lock, UserPlus, AlertCircle, CheckCircle, Upload, FileSpreadsheet, CheckSquare, Square, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSystemAdmin, startImpersonation, deleteStudents, bulkImportStudents } from "@/app/actions/admin-actions"; 
import ExportButton from "@/components/admin/ExportButton";
import EditUserModal from "@/components/admin/EditUserModal";
import clsx from "clsx";

export default function AdminUsersPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [admins, setAdmins] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // MODAL STATES
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [modalMode, setModalMode] = useState<"admin" | "import" | null>(null);
  const [formState, setFormState] = useState<{message?: string, error?: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importData, setImportData] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: students } = await supabase.from("Student").select("*").order("current_xp", { ascending: false });
    const { data: adminList } = await supabase.from("Admin").select("auth_id");
    const adminSet = new Set(adminList?.map(a => a.auth_id));
    setUsers(students || []);
    setAdmins(adminSet);
    setLoading(false);
    setSelectedIds(new Set());
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.student_id?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedIds.size === filteredUsers.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredUsers.map(u => u.id)));
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleImpersonate = async (userId: string) => {
    await startImpersonation(userId);
    router.push("/dashboard");
  };

  const handleDeleteSingle = async (student: any) => {
    if (admins.has(student.auth_id)) {
        if (!confirm(`WARNING: Admin user. Delete anyway?`)) return;
    }
    if (!confirm(`Delete ${student.full_name}?`)) return;
    
    // We use the bulk action for single delete to keep logic centralized
    const res = await deleteStudents([student.id]);
    if (res.success) fetchData();
    else alert(res.message);
  };

  const handleBulkDelete = async () => {
      if (!confirm(`DELETE ${selectedIds.size} agents?`)) return;
      setIsSubmitting(true);
      const result = await deleteStudents(Array.from(selectedIds));
      setIsSubmitting(false);
      if (result.success) {
          alert(`Deleted ${result.count} agents.`);
          fetchData();
      } else {
          alert(result.message);
      }
  };

  const handleCreateAdminSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);
      setFormState(null);
      const formData = new FormData(e.currentTarget);
      const result = await createSystemAdmin(null, formData);
      if (result.error) setFormState({ error: result.error });
      else {
          setFormState({ message: "Admin created." });
          e.currentTarget.reset();
          fetchData();
          setTimeout(() => { setModalMode(null); setFormState(null); }, 1000);
      }
      setIsSubmitting(false);
  };

  const handleBulkImportSubmit = async () => {
      setIsSubmitting(true);
      setFormState({ message: "Processing batch..." });
      try {
          const rows = importData.trim().split("\n");
          const payload = rows.map(row => {
              const [email, full_name, student_id, group_id] = row.split("|").map(s => s.trim());
              if (!email || !full_name) return null;
              return { email, full_name, student_id, group_id: group_id || "G1" };
          }).filter(Boolean) as any[];

          const result = await bulkImportStudents(payload);
          if (result.failed > 0) {
              setFormState({ error: `Imported ${result.success}. Failed ${result.failed}. Check console.` });
          } else {
              setFormState({ message: `Success! Imported ${result.success}.` });
              setImportData("");
              fetchData();
              setTimeout(() => { setModalMode(null); setFormState(null); }, 1500);
          }
      } catch (e: any) { setFormState({ error: e.message }); } 
      finally { setIsSubmitting(false); }
  };

  const handlePromote = async (student: any) => {
    if (!confirm(`Promote ${student.full_name}?`)) return;
    const { error } = await supabase.from("Admin").insert({ auth_id: student.auth_id, role: 'admin' });
    if (error) alert(error.message);
    else fetchData();
  }

  const handleDemote = async (student: any) => {
    if (!confirm(`Demote ${student.full_name}?`)) return;
    const { error } = await supabase.from("Admin").delete().eq("auth_id", student.auth_id);
    if (error) alert(error.message);
    else fetchData();
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
        <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <Users className="text-cyan-400" /> Agent Roster
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage personnel, clearance, and accounts.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input type="text" placeholder="Search..." className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:border-cyan-500 outline-none" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            
            <ExportButton data={users.map(u => ({...u}))} />
            <button onClick={() => setModalMode("import")} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all text-xs uppercase tracking-wider"><Upload size={16} /> Import</button>
            <button onClick={() => setModalMode("admin")} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-xs uppercase tracking-wider"><Shield size={16} /> Admin</button>
        </div>
      </div>

      {/* Bulk Delete Bar */}
      {selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 border border-rose-500/50 rounded-full shadow-2xl px-6 py-3 flex items-center gap-6 animate-in slide-in-from-bottom-10">
              <div className="text-sm font-bold text-white"><span className="text-rose-400">{selectedIds.size}</span> Selected</div>
              <div className="h-6 w-px bg-slate-800" />
              <button onClick={handleBulkDelete} disabled={isSubmitting} className="flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 uppercase tracking-wider"><Trash2 size={16} /> Delete Selected</button>
              <button onClick={() => setSelectedIds(new Set())} className="p-1 hover:bg-slate-800 rounded-full text-slate-500"><X size={14} /></button>
          </div>
      )}

      {/* Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/50 text-[10px] uppercase tracking-widest text-slate-500">
                        <th className="p-4 w-10"><button onClick={handleSelectAll} className="text-slate-500 hover:text-white">{selectedIds.size > 0 && selectedIds.size === filteredUsers.length ? <CheckSquare size={16} /> : <Square size={16} />}</button></th>
                        <th className="p-4 font-bold">Identity</th>
                        <th className="p-4 font-bold">Details</th>
                        <th className="p-4 font-bold text-right">Stats</th>
                        <th className="p-4 font-bold text-center">Role</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {loading ? (<tr><td colSpan={6} className="p-8 text-center text-slate-500">Scanning...</td></tr>) : filteredUsers.map(user => {
                        const isAdmin = admins.has(user.auth_id);
                        return (
                        <tr key={user.id} className={clsx("transition-colors group", selectedIds.has(user.id) ? "bg-rose-500/5" : "hover:bg-slate-800/30")}>
                            <td className="p-4"><button onClick={() => handleSelectOne(user.id)} className={clsx(selectedIds.has(user.id) ? "text-rose-500" : "text-slate-600 hover:text-slate-400")}>{selectedIds.has(user.id) ? <CheckSquare size={16} /> : <Square size={16} />}</button></td>
                            <td className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden"><img src={user.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.full_name}`} className="w-full h-full object-cover" /></div><div className="font-bold text-white">{user.full_name}</div></div></td>
                            <td className="p-4"><div className="flex flex-col"><span className="text-xs text-white font-mono">{user.student_id}</span><span className="text-[10px] text-slate-500">{user.group_id}</span></div></td>
                            <td className="p-4 text-right"><div className="font-mono font-bold text-cyan-400">{user.current_xp?.toLocaleString()}</div><div className="text-[10px] text-slate-500">Lvl {user.current_level}</div></td>
                            <td className="p-4 text-center">{isAdmin ? <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider"><Shield size={10} /> CMD</span> : <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider"><Users size={10} /> AGT</span>}</td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingUser(user)} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all" title="Edit"><Edit2 size={16} /></button>
                                    <button onClick={() => handleImpersonate(user.id)} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950 transition-all" title="Impersonate"><Eye size={16} /></button>
                                    {isAdmin ? (
                                        <button onClick={() => handleDemote(user)} className="p-2 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-600 hover:text-white transition-all"><ShieldOff size={16} /></button>
                                    ) : (
                                        <button onClick={() => handlePromote(user)} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-emerald-950 transition-all"><Shield size={16} /></button>
                                    )}
                                    <button onClick={() => handleDeleteSingle(user)} className="p-2 rounded-lg bg-slate-800 text-slate-500 hover:text-red-500 hover:bg-red-950/50 transition-all"><Trash2 size={16} /></button>
                                </div>
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
      </div>

      {modalMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
                  <button onClick={() => { setModalMode(null); setFormState(null); }} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
                  {modalMode === "admin" ? (
                      <form onSubmit={handleCreateAdminSubmit} className="p-6 space-y-4">
                          <div className="mb-6"><h3 className="text-xl font-bold text-white flex items-center gap-2"><Shield className="text-emerald-500" /> Recruit Admin</h3><p className="text-sm text-slate-400">Create system administrator.</p></div>
                          <input name="fullName" type="text" required placeholder="Name" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-sm text-white focus:border-emerald-500 outline-none" />
                          <input name="email" type="email" required placeholder="Email" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-sm text-white focus:border-emerald-500 outline-none" />
                          <input name="password" type="password" required placeholder="Password" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-sm text-white focus:border-emerald-500 outline-none" />
                          {formState?.error && <div className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded">{formState.error}</div>}
                          {formState?.message && <div className="text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded">{formState.message}</div>}
                          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all disabled:opacity-50">{isSubmitting ? "Processing..." : "Grant Access"}</button>
                      </form>
                  ) : (
                      <div className="p-6 space-y-4">
                          <div className="mb-4"><h3 className="text-xl font-bold text-white flex items-center gap-2"><FileSpreadsheet className="text-cyan-500" /> Bulk Import</h3><p className="text-sm text-slate-400">Format: Email | Name | ID | Group</p></div>
                          <textarea className="w-full h-48 bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-xs text-slate-300 focus:border-cyan-500 outline-none" placeholder="student@edu.eg | Name | ID | G1" value={importData} onChange={e => setImportData(e.target.value)} />
                          {formState?.error && <div className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded whitespace-pre-wrap">{formState.error}</div>}
                          {formState?.message && <div className="text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded">{formState.message}</div>}
                          <button onClick={handleBulkImportSubmit} disabled={isSubmitting || !importData} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all disabled:opacity-50">{isSubmitting ? "Importing..." : "Execute Import"}</button>
                      </div>
                  )}
              </div>
          </div>
      )}

      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onRefresh={fetchData} />}
    </div>
  );
}