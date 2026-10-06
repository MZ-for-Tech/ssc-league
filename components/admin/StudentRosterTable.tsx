"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ArrowUpDown, CheckSquare, Edit2, Eye, Shield, ShieldOff, Square, Trash2, Users } from "lucide-react";
import clsx from "clsx";
import type { SortDirection, SortKey, StudentRecord } from "@/components/admin/student-roster-types";

type StudentRosterTableProps = {
  readOnly: boolean;
  loading: boolean;
  admins: Set<string>;
  selectedIds: Set<string>;
  sortedFilteredUsers: StudentRecord[];
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
  onSelectAll: () => void;
  onSelectOne: (id: string) => void;
  onEditUser: (user: StudentRecord) => void;
  onImpersonate: (id: string) => void;
  onPromote: (user: StudentRecord) => void;
  onDemote: (user: StudentRecord) => void;
  onDeleteUser: (user: StudentRecord) => void;
};

export function StudentRosterTable({
  readOnly, loading, admins, selectedIds, sortedFilteredUsers, sortKey, sortDirection, onSort,
  onSelectAll, onSelectOne, onEditUser, onImpersonate, onPromote, onDemote, onDeleteUser,
}: StudentRosterTableProps) {
  const sortHeader = (label: string, key: SortKey): ReactNode => (
    <button
      type="button"
      onClick={() => onSort(key)}
      aria-label={`Sort by ${label}${sortKey === key ? `, ${sortDirection}ending` : ""}`}
      className="inline-flex items-center gap-1.5 font-bold transition-colors hover:text-cyan-300"
    >
      {label}
      {sortKey === key
        ? sortDirection === "asc" ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" />
        : <ArrowUpDown size={13} className="opacity-40" aria-hidden="true" />}
    </button>
  );

  return (
      <div className="instrument-panel relative isolate overflow-hidden rounded-2xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] shadow-xl shadow-black/25">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <p className="px-4 pt-3 text-xs text-muted md:hidden">Swipe the roster to see student details and actions.</p>
        <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                    <tr className="border-b border-border bg-background/55 font-mono text-xs uppercase tracking-wider text-muted">
                        <th className="w-10 p-4">{!readOnly && <button onClick={onSelectAll} className="text-muted transition hover:text-primary">{selectedIds.size > 0 && selectedIds.size === sortedFilteredUsers.length ? <CheckSquare size={16} /> : <Square size={16} />}</button>}</th>
                        <th aria-sort={sortKey === "identity" ? sortDirection === "asc" ? "ascending" : "descending" : "none"} className="p-4">{sortHeader("Identity", "identity")}</th>
                        <th aria-sort={sortKey === "details" ? sortDirection === "asc" ? "ascending" : "descending" : "none"} className="p-4">{sortHeader("Details", "details")}</th>
                        <th aria-sort={sortKey === "stats" ? sortDirection === "asc" ? "ascending" : "descending" : "none"} className="p-4 text-right">{sortHeader("Stats", "stats")}</th>
                        <th aria-sort={sortKey === "role" ? sortDirection === "asc" ? "ascending" : "descending" : "none"} className="p-4 text-center">{sortHeader("Role", "role")}</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody aria-busy={loading} className="divide-y divide-border/70">
                    {loading ? Array.from({ length: 8 }, (_, index) => (
                        <tr key={`loading-${index}`} aria-hidden="true" className="animate-pulse">
                            <td className="p-4"><div className="h-4 w-4 rounded bg-surface-light/20" /></td>
                            <td className="p-4"><div className="flex min-w-52 items-center gap-3"><div className="h-10 w-10 shrink-0 rounded-full border border-border bg-surface-light/25" /><div className="h-4 w-36 max-w-full rounded bg-surface-light/30" /></div></td>
                            <td className="p-4"><div className="space-y-2"><div className="h-3 w-20 rounded bg-surface-light/30" /><div className="h-3 w-10 rounded bg-surface-light/20" /></div></td>
                            <td className="p-4"><div className="ml-auto space-y-2 text-right"><div className="ml-auto h-4 w-16 rounded bg-primary/20" /><div className="ml-auto h-3 w-10 rounded bg-surface-light/20" /></div></td>
                            <td className="p-4"><div className="mx-auto h-6 w-14 rounded border border-success/15 bg-success/10" /></td>
                            <td className="p-4"><div className="flex justify-end gap-2"><div className="h-9 w-9 rounded-lg border border-border bg-surface-light/15" /><div className="h-9 w-9 rounded-lg border border-border bg-surface-light/15" /><div className="h-9 w-9 rounded-lg border border-border bg-surface-light/15" /></div></td>
                        </tr>
                    )) : sortedFilteredUsers.map(user => {
                        const isAdmin = admins.has(user.auth_id);
                        return (
                        <tr key={user.id} className={clsx("group transition-colors", selectedIds.has(user.id) ? "bg-danger/10" : "hover:bg-primary/[0.035]")}>
                            <td className="p-4">{!readOnly && <button onClick={() => onSelectOne(user.id)} className={clsx("transition-colors", selectedIds.has(user.id) ? "text-danger" : "text-muted/60 hover:text-primary")}>{selectedIds.has(user.id) ? <CheckSquare size={16} /> : <Square size={16} />}</button>}</td>
                            <td className="p-4"><div className="flex min-w-52 items-center gap-3"><div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-surface shadow-[0_0_16px_rgb(var(--primary)/0.08)] transition group-hover:border-primary/40"><Image unoptimized width={40} height={40} src={user.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.full_name}`} alt="" className="h-full w-full object-cover" /></div><div className="min-w-0 truncate font-semibold text-foreground">{user.full_name}</div></div></td>
                            <td className="p-4"><div className="flex flex-col"><span className="font-mono text-xs text-foreground">{user.student_id}</span><span className="text-xs text-muted">{user.group_id}</span></div></td>
                            <td className="p-4 text-right"><div className="font-mono font-bold text-primary">{user.current_xp?.toLocaleString()}</div><div className="text-xs text-muted">Lvl {user.current_level}</div></td>
                            <td className="p-4 text-center">{isAdmin ? <span className="inline-flex items-center gap-1 rounded border border-danger/20 bg-danger/10 px-2 py-1 text-xs font-bold uppercase tracking-wider text-danger"><Shield size={12} /> CMD</span> : <span className="inline-flex items-center gap-1 rounded border border-success/20 bg-success/10 px-2 py-1 text-xs font-bold uppercase tracking-wider text-success"><Users size={12} /> AGT</span>}</td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-80 transition-opacity sm:opacity-60 sm:group-hover:opacity-100">
                                    {!readOnly && <button onClick={() => onEditUser(user)} className="rounded-lg border border-border bg-background/60 p-2 text-muted transition-all hover:border-primary/40 hover:text-foreground" title="Edit"><Edit2 size={16} /></button>}
                                    {!readOnly && <button onClick={() => onImpersonate(user.id)} className="rounded-lg border border-border bg-background/60 p-2 text-muted transition-all hover:border-primary/40 hover:text-primary" title="Impersonate"><Eye size={16} /></button>}
                                    {!readOnly && <>
                                    {isAdmin ? (
                                        <button onClick={() => onDemote(user)} className="rounded-lg border border-border bg-background/60 p-2 text-danger transition-all hover:border-danger/40 hover:bg-danger/10"><ShieldOff size={16} /></button>
                                    ) : (
                                        <button onClick={() => onPromote(user)} className="rounded-lg border border-border bg-background/60 p-2 text-muted transition-all hover:border-success/40 hover:bg-success/10 hover:text-success"><Shield size={16} /></button>
                                    )}
                                    <button onClick={() => onDeleteUser(user)} className="rounded-lg border border-border bg-background/60 p-2 text-muted transition-all hover:border-danger/40 hover:bg-danger/10 hover:text-danger"><Trash2 size={16} /></button>
                                    </>}
                                </div>
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
      </div>
  );
}
