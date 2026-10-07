"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ArrowUpDown, CheckSquare, Edit2, Eye, Shield, ShieldOff, Square, Trash2, Users } from "lucide-react";
import clsx from "clsx";
import DropdownSelect from "@/components/ui/DropdownSelect";
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
        <div className="space-y-3 p-3 md:hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <span className="text-xs font-semibold text-muted">{loading ? "Loading agents…" : `${sortedFilteredUsers.length} agents`}</span>
                <div className="flex items-center gap-2">
                    {!readOnly && <button type="button" onClick={onSelectAll} className="app-touch-target rounded-lg border border-border bg-background/60 px-3 text-xs font-semibold text-foreground">
                        {selectedIds.size > 0 && selectedIds.size === sortedFilteredUsers.length ? "Clear" : "Select all"}
                    </button>}
                    <div className="w-24">
                        <DropdownSelect
                            value={sortKey}
                            onChange={value => onSort(value as SortKey)}
                            ariaLabel="Sort agents by"
                            options={[
                                { value: "stats", label: "Stats" },
                                { value: "identity", label: "Name" },
                                { value: "details", label: "Student ID" },
                                { value: "role", label: "Role" },
                            ]}
                        />
                    </div>
                    <button type="button" onClick={() => onSort(sortKey)} aria-label={`Sort ${sortDirection === "desc" ? "ascending" : "descending"}`} className="app-touch-target flex min-w-11 items-center justify-center rounded-lg border border-border bg-background/70 text-foreground">
                        {sortDirection === "desc" ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
                    </button>
                </div>
            </div>
            {loading ? Array.from({ length: 5 }, (_, index) => (
                <div key={`mobile-loading-${index}`} aria-hidden="true" className="flex animate-pulse gap-3 rounded-xl border border-border/70 bg-background/35 p-4">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-surface-light/25" />
                    <div className="flex-1 space-y-2 py-1"><div className="h-4 w-2/3 rounded bg-surface-light/30" /><div className="h-3 w-1/2 rounded bg-surface-light/20" /></div>
                </div>
            )) : sortedFilteredUsers.map(user => {
                const isAdmin = admins.has(user.auth_id);
                const selected = selectedIds.has(user.id);
                return (
                    <article key={`mobile-${user.id}`} className={clsx("rounded-xl border p-3 transition-colors", selected ? "border-danger/40 bg-danger/5" : "border-border/70 bg-background/35")}>
                        <div className="flex min-w-0 items-start gap-3">
                            {!readOnly && <button type="button" onClick={() => onSelectOne(user.id)} aria-label={`${selected ? "Deselect" : "Select"} ${user.full_name}`} aria-pressed={selected} className={clsx("app-touch-target mt-1 flex min-w-11 shrink-0 items-center justify-center", selected ? "text-danger" : "text-muted/70")}>
                                {selected ? <CheckSquare size={20} /> : <Square size={20} />}
                            </button>}
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border bg-surface">
                                    <Image unoptimized width={44} height={44} src={user.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.full_name}`} alt="" className="h-full w-full object-cover" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="break-words font-semibold leading-snug text-foreground">{user.full_name}</div>
                                    <div title={user.student_id} className="mt-1 truncate font-mono text-xs text-muted">{user.student_id}{user.group_id ? ` · ${user.group_id}` : ""}</div>
                                </div>
                                <div className="shrink-0 text-right">
                                    <div className="font-mono text-sm font-bold text-primary">{user.current_xp?.toLocaleString() ?? 0} XP</div>
                                    <div className="text-xs text-muted">Level {user.current_level ?? 0}</div>
                                    <span className={clsx("mt-1 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide", isAdmin ? "border-danger/20 bg-danger/10 text-danger" : "border-success/20 bg-success/10 text-success")}>
                                        {isAdmin ? <><Shield size={11} /> Admin</> : <><Users size={11} /> Agent</>}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {!readOnly && <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/70 pt-3">
                            <button type="button" onClick={() => onEditUser(user)} className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background/60 px-2 text-xs font-semibold text-foreground"><Edit2 size={15} /> Edit</button>
                            <button type="button" onClick={() => onImpersonate(user.id)} className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background/60 px-2 text-xs font-semibold text-primary"><Eye size={15} /> View as</button>
                            {isAdmin ? <button type="button" onClick={() => onDemote(user)} className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-danger/20 bg-danger/5 px-2 text-xs font-semibold text-danger"><ShieldOff size={15} /> Demote</button> : <button type="button" onClick={() => onPromote(user)} className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-success/20 bg-success/5 px-2 text-xs font-semibold text-success"><Shield size={15} /> Promote</button>}
                            <button type="button" onClick={() => onDeleteUser(user)} className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-danger/20 bg-background/60 px-2 text-xs font-semibold text-danger"><Trash2 size={15} /> Delete</button>
                        </div>}
                    </article>
                );
            })}
            {!loading && sortedFilteredUsers.length === 0 && <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">No agents found.</p>}
        </div>
        <div className="hidden overflow-x-auto md:block">
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
