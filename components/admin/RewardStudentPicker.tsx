"use client";

import { Search } from "lucide-react";
import DropdownSelect from "@/components/ui/DropdownSelect";
import type { RewardCategory } from "@/lib/reward-protocol";

export type RewardStudent = { id: string; full_name: string; student_id: string; group_id: string | null };

type RewardStudentPickerProps = {
  visibleStudents: RewardStudent[];
  eligibleCount: number;
  selectedCount: number;
  groups: string[];
  selectedGroup: string;
  query: string;
  selectedIds: Set<string>;
  category: RewardCategory;
  alreadyAwarded: Set<string>;
  attendedSessionCounts: Record<string, number>;
  readOnly: boolean;
  allVisibleSelected: boolean;
  onQueryChange: (query: string) => void;
  onGroupChange: (group: string) => void;
  onToggleVisible: () => void;
  onToggleStudent: (studentId: string) => void;
};

export default function RewardStudentPicker({
  visibleStudents,
  eligibleCount,
  selectedCount,
  groups,
  selectedGroup,
  query,
  selectedIds,
  category,
  alreadyAwarded,
  attendedSessionCounts,
  readOnly,
  allVisibleSelected,
  onQueryChange,
  onGroupChange,
  onToggleVisible,
  onToggleStudent,
}: RewardStudentPickerProps) {
  return (
    <div className="min-w-0 max-w-full border border-border/70 bg-background/20">
      <div className="flex min-w-0 flex-col gap-3 border-b border-border/60 p-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1 text-xs">
          <span className="sr-only">Search students</span>
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="search" value={query} disabled={readOnly} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search name or student ID" className="console-control min-h-9 w-full border border-border bg-background/60 py-2 pl-9 pr-3 text-foreground outline-none placeholder:text-muted/70 focus:border-primary/70 disabled:opacity-50 text-sm" />
        </label>
        <label className="block w-full min-w-0 text-xs sm:w-auto sm:shrink-0">
          <span className="sr-only">Filter students by group</span>
          <DropdownSelect value={selectedGroup} options={[{ value: "ALL", label: "All groups" }, ...groups.map((group) => ({ value: group, label: group }))]} disabled={readOnly} onChange={onGroupChange} ariaLabel="Filter students by group" />
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border/60 px-3 py-2">
        <span className="min-w-0 font-mono text-xs uppercase tracking-wider text-muted">{eligibleCount} available · {selectedCount} selected</span>
        <button type="button" disabled={readOnly || eligibleCount === 0} onClick={onToggleVisible} className="shrink-0 font-semibold text-primary hover:text-foreground disabled:opacity-40">{allVisibleSelected ? "Clear visible" : "Select visible"}</button>
      </div>
      <div className="max-h-64 divide-y divide-border/50 overflow-y-auto">
        {visibleStudents.map((student) => {
          const alreadyReceived = category === "attendance" && alreadyAwarded.has(student.id);
          return (
            <label key={student.id} className={`flex items-center gap-3 px-3 py-2.5 ${alreadyReceived ? "cursor-not-allowed opacity-55" : "cursor-pointer hover:bg-primary/[.035]"}`}>
              <input type="checkbox" checked={selectedIds.has(student.id)} disabled={readOnly || alreadyReceived} onChange={() => onToggleStudent(student.id)} className="h-4 w-4 accent-cyan-400" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-foreground">{student.full_name}</span>
                <span className="block truncate font-mono text-xs text-muted">{student.student_id} · {student.group_id || "No group"}{category === "attendance" ? ` · ${attendedSessionCounts[student.id] ?? 0} sessions attended` : ""}</span>
              </span>
              {alreadyReceived && <span className="shrink-0 font-mono text-xs uppercase text-emerald-300">Awarded</span>}
            </label>
          );
        })}
        {!visibleStudents.length && <div className="px-3 py-8 text-center text-muted">No students match this search.</div>}
      </div>
    </div>
  );
}
