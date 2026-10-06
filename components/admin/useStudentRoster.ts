"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { deleteStudents, updateAgentRole } from "@/app/actions/admin-student-roster";
import { startImpersonation } from "@/app/actions/admin-impersonation";
import type { SortDirection, SortKey, StudentRecord } from "@/components/admin/student-roster-types";

export function useStudentRoster(seasonId: string) {
  const [supabase] = useState(createSupabaseBrowserClient);
  const router = useRouter();
  const [users, setUsers] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [admins, setAdmins] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("stats");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    const { data: students } = await supabase.from("Student").select("*").eq("season_id", seasonId).order("current_xp", { ascending: false });
    const { data: adminList } = await supabase.from("Admin").select("auth_id");
    const adminSet = new Set(adminList?.map((admin) => admin.auth_id));
    setUsers((students || []) as StudentRecord[]);
    setAdmins(adminSet);
    setLoading(false);
    setSelectedIds(new Set());
  }, [seasonId, supabase]);

  useEffect(() => {
    let active = true;
    void Promise.all([
      supabase.from("Student").select("*").eq("season_id", seasonId).order("current_xp", { ascending: false }),
      supabase.from("Admin").select("auth_id"),
    ]).then(([{ data: students }, { data: adminList }]) => {
      if (!active) return;
      setUsers((students || []) as StudentRecord[]);
      setAdmins(new Set(adminList?.map((admin) => admin.auth_id)));
      setLoading(false);
    });
    return () => { active = false; };
  }, [seasonId, supabase]);

  const filteredUsers = users.filter((user) =>
    user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.student_id?.toLowerCase().includes(search.toLowerCase())
  );
  const sortedFilteredUsers = [...filteredUsers].sort((left, right) => {
    let comparison = 0;
    if (sortKey === "identity") {
      comparison = (left.full_name || "").localeCompare(right.full_name || "", undefined, { sensitivity: "base" });
    } else if (sortKey === "details") {
      comparison = (left.student_id || "").localeCompare(right.student_id || "", undefined, { numeric: true, sensitivity: "base" }) ||
        (left.group_id || "").localeCompare(right.group_id || "", undefined, { numeric: true, sensitivity: "base" });
    } else if (sortKey === "stats") {
      comparison = Number(left.current_xp || 0) - Number(right.current_xp || 0) ||
        Number(left.current_level || 0) - Number(right.current_level || 0);
    } else {
      comparison = Number(admins.has(left.auth_id)) - Number(admins.has(right.auth_id));
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const selectSortKey = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((direction) => direction === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(key);
    setSortDirection(key === "stats" ? "desc" : "asc");
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredUsers.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredUsers.map((user) => user.id)));
  };

  const handleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleImpersonate = async (userId: string) => {
    await startImpersonation(userId);
    router.push("/dashboard");
  };

  const handleDeleteSingle = async (student: StudentRecord) => {
    if (admins.has(student.auth_id) && !confirm("WARNING: Admin user. Delete anyway?")) return;
    if (!confirm(`Delete ${student.full_name}?`)) return;

    const result = await deleteStudents([student.id]);
    if (result.success) void fetchData();
    else alert(result.message);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`DELETE ${selectedIds.size} agents?`)) return;
    setIsSubmitting(true);
    const result = await deleteStudents(Array.from(selectedIds));
    setIsSubmitting(false);
    if (result.success) {
      alert(`Deleted ${result.count} agents.`);
      void fetchData();
    } else {
      alert(result.message);
    }
  };

  const handlePromote = async (student: StudentRecord) => {
    if (!confirm(`Promote ${student.full_name}?`)) return;
    const result = await updateAgentRole(student.id, "admin");
    if (!result.success) alert(result.message);
    else void fetchData();
  };

  const handleDemote = async (student: StudentRecord) => {
    if (!confirm(`Demote ${student.full_name}?`)) return;
    const result = await updateAgentRole(student.id, "student");
    if (!result.success) alert(result.message);
    else void fetchData();
  };

  return {
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
  };
}
