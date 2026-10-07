"use client";

import React, { useState } from "react";
import { Users, Search, Shield, Trash2, X, Upload } from "lucide-react";
import { createSystemAdmin } from "@/app/actions/admin-account";
import ExportButton from "@/components/admin/ExportButton";
import EditUserModal from "@/components/admin/EditUserModal";
import AdminSeasonToolbar from "@/components/admin/AdminSeasonToolbar";
import PageHeader from "@/components/PageHeader";
import type { SeasonRecord } from "@/lib/seasons";
import { StudentRosterTable } from "@/components/admin/StudentRosterTable";
import type { StudentRecord } from "@/components/admin/student-roster-types";
import { useStudentRoster } from "@/components/admin/useStudentRoster";
import { StudentImportView } from "@/components/admin/StudentImportView";
import { useStudentImport } from "@/components/admin/useStudentImport";


export default function AdminUsersView({ seasonId, activeSeasonId, seasons }: { seasonId: string; activeSeasonId: string; seasons: SeasonRecord[] }) {
  const readOnly = seasonId !== activeSeasonId;
  const {
    users,
    loading,
    search,
    setSearch,
    admins,
    selectedIds,
    setSelectedIds,
    sortKey,
    sortDirection,
    sortedFilteredUsers,
    isSubmitting,
    setIsSubmitting,
    fetchData,
    selectSortKey,
    handleSelectAll,
    handleSelectOne,
    handleImpersonate,
    handleDeleteSingle,
    handleBulkDelete,
    handlePromote,
    handleDemote,
  } = useStudentRoster(seasonId);

  // Admin creation remains a modal; student import has its own full page view.
  const [editingUser, setEditingUser] = useState<StudentRecord | null>(null);
  const [modalMode, setModalMode] = useState<"admin" | null>(null);
  const [showImportView, setShowImportView] = useState(false);
  const [formState, setFormState] = useState<{
    message?: string;
    error?: string;
  } | null>(null);

  const importFlow = useStudentImport({ readOnly, isSubmitting, setIsSubmitting, onImportComplete: fetchData });

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

  return showImportView ? (
    <StudentImportView
      importFlow={importFlow}
      onBack={() => setShowImportView(false)}
    />
  ) : (
    <div className="app-page-stack animate-in fade-in pb-20">
      {/* Header */}
      <PageHeader
        title="Agent Roster"
        icon={<Users size={28} />}
        actions={<div className="flex w-full flex-col gap-3 xl:w-auto xl:items-end">
          <AdminSeasonToolbar seasons={seasons} seasonId={seasonId} />
            <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="relative min-w-0 flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input type="text" placeholder="Search..." className="app-touch-target w-full rounded-xl border border-border bg-background/70 py-2 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted/65 focus:border-primary/60 focus:ring-2 focus:ring-primary/10" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <ExportButton data={users.map(u => ({...u}))} />
            {!readOnly && <button onClick={() => { setFormState(null); importFlow.resetForOpen(); setShowImportView(true); }} className="app-touch-target inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-background/55 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-foreground transition hover:border-primary/50 hover:bg-primary/5 sm:gap-2 sm:px-4 sm:text-xs"><Upload size={15} /> Import students</button>}
            {!readOnly && <button onClick={() => setModalMode("admin")} className="app-touch-target inline-flex items-center gap-1.5 rounded-xl border border-success/25 bg-success/10 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-success shadow-[0_0_18px_rgb(var(--success)/0.08)] transition hover:border-success/50 hover:bg-success/15 sm:gap-2 sm:px-4 sm:text-xs"><Shield size={15} /> Admin</button>}
          </div>
        </div>}
      />

      {/* Bulk Delete Bar */}
      {!readOnly && selectedIds.size > 0 && (
          <div className="fixed inset-x-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-max flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl border border-danger/40 bg-background/95 px-4 py-3 shadow-2xl shadow-black/50 backdrop-blur-md animate-in slide-in-from-bottom-10 sm:inset-x-auto sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:flex-nowrap sm:gap-6 sm:rounded-full sm:px-6">
              <div className="text-sm font-bold text-foreground"><span className="text-danger">{selectedIds.size}</span> Selected</div>
              <div className="h-6 w-px bg-border" />
              <button onClick={handleBulkDelete} disabled={isSubmitting} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-danger hover:text-danger/80"><Trash2 size={16} /> Delete Selected</button>
              <button onClick={() => setSelectedIds(new Set())} className="rounded-full p-1 text-muted transition hover:bg-surface hover:text-foreground"><X size={14} /></button>
          </div>
      )}

      <StudentRosterTable
        readOnly={readOnly}
        loading={loading}
        admins={admins}
        selectedIds={selectedIds}
        sortedFilteredUsers={sortedFilteredUsers}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={selectSortKey}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onEditUser={setEditingUser}
        onImpersonate={handleImpersonate}
        onPromote={handlePromote}
        onDemote={handleDemote}
        onDeleteUser={handleDeleteSingle}
      />

      {!readOnly && modalMode === "admin" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="instrument-panel relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] shadow-2xl">
                  <button onClick={() => { setModalMode(null); setFormState(null); }} className="absolute right-4 top-4 text-muted transition hover:text-foreground"><X size={20} /></button>
                      <form onSubmit={handleCreateAdminSubmit} className="p-6 space-y-4">
                          <div className="mb-6"><h3 className="flex items-center gap-2 text-xl font-bold text-foreground"><Shield className="text-primary" /> Recruit Admin</h3><p className="text-sm text-muted">Create system administrator.</p></div>
                          <input name="fullName" type="text" required placeholder="Name" className="w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-primary" />
                          <input name="email" type="email" required placeholder="Email" className="w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-primary" />
                          <input name="password" type="password" required placeholder="Password" className="w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-primary" />
                          {formState?.error && <div className="rounded border border-danger/20 bg-danger/10 p-3 text-xs text-danger">{formState.error}</div>}
                          {formState?.message && <div className="rounded border border-success/20 bg-success/10 p-3 text-xs text-success">{formState.message}</div>}
                          <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-primary py-3 font-bold text-background transition hover:bg-primary-dim disabled:opacity-50">{isSubmitting ? "Processing..." : "Grant Access"}</button>
                      </form>
              </div>
          </div>
      )}

      {!readOnly && editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onRefresh={fetchData} />}
    </div>
  );
}
