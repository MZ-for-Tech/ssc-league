"use client";

import React, { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Users, Search, Shield, Trash2, Eye, ShieldOff, X, AlertCircle, CheckCircle, Upload, FileSpreadsheet, CheckSquare, Square, Edit2, ArrowDown, ArrowUp, ArrowUpDown, ArrowLeft, Copy, Check, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSystemAdmin, startImpersonation, deleteStudents, bulkImportStudents, updateAgentRole } from "@/app/actions/admin-actions";
import ExportButton from "@/components/admin/ExportButton";
import EditUserModal from "@/components/admin/EditUserModal";
import AdminSeasonToolbar from "@/components/admin/AdminSeasonToolbar";
import PageHeader from "@/components/PageHeader";
import type { SeasonRecord } from "@/lib/seasons";
import clsx from "clsx";

type SortKey = "identity" | "details" | "stats" | "role";
type SortDirection = "asc" | "desc";
type StudentRecord = {
  id: string; auth_id: string; full_name: string; student_id: string; group_id: string;
  current_xp: number | null; current_level: number | null; avatar_url: string | null;
  preferred_name?: string | null; email?: string | null;
};
type ParsedImportRow = {
  line: number;
  email: string;
  full_name: string;
  student_id: string;
  group_id: string;
  errors: string[];
};

function parseDelimitedRows(input: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
    } else if (character === '"' && cell.length === 0) {
      quoted = true;
    } else if (character === delimiter) {
      row.push(cell);
      cell = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && input[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (quoted) throw new Error("The CSV contains an unfinished quoted field.");
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function serializePipeValue(value: string) {
  const normalized = value.replace(/\r?\n/g, " ").trim();
  return /[|\"]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized;
}

function parseStudentImport(data: string): ParsedImportRow[] {
  let rows: { values: string[]; line: number }[];
  try {
    rows = parseDelimitedRows(data, "|").map((values, index) => ({ values, line: index + 1 }));
  } catch (error) {
    return [{
      line: 1,
      email: "",
      full_name: "",
      student_id: "",
      group_id: "G1",
      errors: [error instanceof Error ? error.message : "Check the quoted fields in this row."],
    }];
  }
  const emailCounts = new Map<string, number>();
  const parsed = rows.map(({ values, line }) => {
    const [email = "", full_name = "", student_id = "", group_id = ""] = values.map((value) => value.trim());
    const errors: string[] = [];
    if (!email || !full_name || !student_id) errors.push("Email, name, and student ID are required.");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Enter a valid email address.");
    if (email) emailCounts.set(email.toLocaleLowerCase(), (emailCounts.get(email.toLocaleLowerCase()) || 0) + 1);
    return { line, email, full_name, student_id, group_id: group_id || "G1", errors };
  });
  return parsed.map((row) => {
    if ((emailCounts.get(row.email.toLocaleLowerCase()) || 0) > 1) row.errors.push("Email appears more than once in this import.");
    return row;
  });
}

function csvToPipeRows(csv: string) {
  const rows = parseDelimitedRows(csv, ",");
  if (!rows.length) throw new Error("The selected CSV does not contain any student rows.");

  const normalizeHeader = (value: string) => value.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
  const headers = rows[0].map(normalizeHeader);
  const aliases = {
    email: ["email", "emailaddress"],
    full_name: ["fullname", "name", "studentname"],
    student_id: ["studentid", "id", "studentnumber"],
    group_id: ["group", "groupid", "class", "section"],
  };
  const columns = Object.fromEntries(Object.entries(aliases).map(([key, names]) => [key, headers.findIndex((header) => names.includes(header))])) as Record<keyof typeof aliases, number>;
  const hasHeader = columns.email >= 0 && columns.full_name >= 0 && columns.student_id >= 0;
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const valuesFor = (row: string[], column: number, fallback: number) => row[column >= 0 ? column : fallback] || "";

  if (!dataRows.length) throw new Error("The CSV contains headers but no student rows.");
  return dataRows.map((row) => [
    valuesFor(row, columns.email, 0),
    valuesFor(row, columns.full_name, 1),
    valuesFor(row, columns.student_id, 2),
    valuesFor(row, columns.group_id, hasHeader ? -1 : 3),
  ].map(serializePipeValue).join(" | ")).join("\n");
}

export default function AdminUsersView({ seasonId, activeSeasonId, seasons }: { seasonId: string; activeSeasonId: string; seasons: SeasonRecord[] }) {
  const [supabase] = useState(createSupabaseBrowserClient);
  const router = useRouter();
  const readOnly = seasonId !== activeSeasonId;

  const [users, setUsers] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [admins, setAdmins] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("stats");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Admin creation remains a modal; student import has its own full page view.
  const [editingUser, setEditingUser] = useState<StudentRecord | null>(null);
  const [modalMode, setModalMode] = useState<"admin" | null>(null);
  const [showImportView, setShowImportView] = useState(false);
  const [formState, setFormState] = useState<{
    message?: string;
    error?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importData, setImportData] = useState("");
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [credentialsCopied, setCredentialsCopied] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ student_id: string; password: string }[]>([]);
  const [completedImportCount, setCompletedImportCount] = useState<number | null>(null);
  const [importAttempted, setImportAttempted] = useState(false);

  const fetchData = useCallback(async () => {
    const { data: students } = await supabase.from("Student").select("*").eq("season_id", seasonId).order("current_xp", { ascending: false });
    const { data: adminList } = await supabase.from("Admin").select("auth_id");
    const adminSet = new Set(adminList?.map(a => a.auth_id));
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

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.student_id?.toLowerCase().includes(search.toLowerCase())
  );
  const parsedImportRows = parseStudentImport(importData);
  const validImportRows = parsedImportRows.filter((row) => row.errors.length === 0);
  const invalidImportRows = parsedImportRows.filter((row) => row.errors.length > 0);

  const sortedFilteredUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0;
    if (sortKey === "identity") {
      comparison = (a.full_name || "").localeCompare(b.full_name || "", undefined, { sensitivity: "base" });
    } else if (sortKey === "details") {
      comparison = (a.student_id || "").localeCompare(b.student_id || "", undefined, { numeric: true, sensitivity: "base" }) ||
        (a.group_id || "").localeCompare(b.group_id || "", undefined, { numeric: true, sensitivity: "base" });
    } else if (sortKey === "stats") {
      comparison = Number(a.current_xp || 0) - Number(b.current_xp || 0) ||
        Number(a.current_level || 0) - Number(b.current_level || 0);
    } else {
      comparison = Number(admins.has(a.auth_id)) - Number(admins.has(b.auth_id));
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

  const sortHeader = (label: string, key: SortKey) => (
    <button
      type="button"
      onClick={() => selectSortKey(key)}
      aria-label={`Sort by ${label}${sortKey === key ? `, ${sortDirection}ending` : ""}`}
      className="inline-flex items-center gap-1.5 font-bold transition-colors hover:text-cyan-300"
    >
      {label}
      {sortKey === key
        ? sortDirection === "asc" ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" />
        : <ArrowUpDown size={13} className="opacity-40" aria-hidden="true" />}
    </button>
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

  const handleDeleteSingle = async (student: StudentRecord) => {
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
      if (!validImportRows.length || readOnly) return;
      setIsSubmitting(true);
      setCompletedImportCount(null);
      setImportAttempted(true);
      setFormState({ message: `Importing ${validImportRows.length} student${validImportRows.length === 1 ? "" : "s"}…` });
      try {
          const payload = validImportRows.map(({ email, full_name, student_id, group_id }) => ({ email, full_name, student_id, group_id }));
          const result = await bulkImportStudents(payload);
          setGeneratedCredentials((current) => [...current, ...result.credentials]);
          const importIssues = [
            ...invalidImportRows.map((row) => `Line ${row.line}: ${row.errors.join(" ")}`),
            ...result.errors,
          ];
          if (result.failed > 0 || invalidImportRows.length > 0) {
              const failedStudentIds = new Set(result.errors.map((error) => error.split(":", 1)[0].trim()));
              const originalLines = importData.split(/\r?\n/);
              const rowsToRetry = parsedImportRows.filter((row) => row.errors.length > 0 || failedStudentIds.has(row.student_id));
              setImportData(rowsToRetry.map((row) => originalLines[row.line - 1]).join("\n"));
              setImportAttempted(false);
              setFormState({
                error: `Imported ${result.success}. Failed ${result.failed + invalidImportRows.length}. ${importIssues.join(" ")}`,
              });
          } else {
              setCompletedImportCount(result.success);
              setFormState({ message: `Success! Imported ${result.success}.` });
              setImportData("");
              setImportFileName(null);
              fetchData();
          }
      } catch (error: unknown) { setFormState({ error: error instanceof Error ? error.message : "The import failed." }); }
      finally { setIsSubmitting(false); }
  };

  const handleCsvSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const normalizedRows = csvToPipeRows(await file.text());
      setImportData(normalizedRows);
      setImportFileName(file.name);
      setFormState(null);
      setCompletedImportCount(null);
      setImportAttempted(false);
      setCredentialsCopied(false);
    } catch (error) {
      setFormState({ error: error instanceof Error ? error.message : "The CSV could not be read." });
    }
  };

  const copyCredentials = async () => {
    if (!generatedCredentials.length) return;
    const credentialText = generatedCredentials.map((item) => `${item.student_id} | ${item.password}`).join("\n");
    await navigator.clipboard.writeText(credentialText);
    setCredentialsCopied(true);
    window.setTimeout(() => setCredentialsCopied(false), 1800);
  };

  const downloadCredentials = () => {
    if (!generatedCredentials.length) return;
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [
      ["Student ID", "Temporary password"],
      ...generatedCredentials.map((item) => [item.student_id, item.password]),
    ].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "ssc-student-credentials.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  };

  const handlePromote = async (student: StudentRecord) => {
    if (!confirm(`Promote ${student.full_name}?`)) return;
    const result = await updateAgentRole(student.id, "admin");
    if (!result.success) alert(result.message);
    else fetchData();
  }

  const handleDemote = async (student: StudentRecord) => {
    if (!confirm(`Demote ${student.full_name}?`)) return;
    const result = await updateAgentRole(student.id, "student");
    if (!result.success) alert(result.message);
    else fetchData();
  }

  if (showImportView) {
    return (
      <div className="w-full space-y-6 animate-in fade-in pb-16">
        <PageHeader
          title="Import students"
          description="Add student accounts to the selected season."
          icon={<FileSpreadsheet size={28} />}
          actions={<button type="button" onClick={() => setShowImportView(false)} className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-muted transition hover:text-foreground"><ArrowLeft size={16} /> Back to roster</button>}
        />

        {formState?.message && <div role="status" className="flex items-start gap-3 rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success"><CheckCircle size={18} className="mt-0.5 shrink-0" /><p>{formState.message}</p></div>}
        {formState?.error && <div role="alert" className="flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3 text-sm text-warning"><AlertCircle size={18} className="mt-0.5 shrink-0" /><p className="whitespace-pre-wrap">{formState.error}</p></div>}

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.8fr)]">
          <section className="space-y-5 rounded-2xl border border-border bg-surface/60 p-5 sm:p-7">
            <div>
              <h2 className="text-lg font-bold text-foreground">Roster data</h2>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
              <h3 className="text-sm font-bold text-foreground">Before you import</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border/70 bg-background/50 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Required for every student</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">Email · Full name · Student ID</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-background/50 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Optional</p>
                  <p className="mt-1 text-sm text-foreground">Group defaults to <span className="font-semibold">G1</span> when omitted.</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-muted">CSV headers can be Email, Full Name, Student ID, and Group. Without headers, use that same column order.</p>
            </div>
            <label className="flex cursor-pointer flex-wrap items-center gap-3 rounded-xl border border-dashed border-border bg-background/40 p-4 transition hover:border-primary/50 hover:bg-primary/5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary"><Upload size={18} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">Choose a CSV file</span>
                <span className="mt-1 block truncate text-xs text-muted">{importFileName || "Select a .csv file to load its rows into the preview."}</span>
              </span>
              <span className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground">Browse files</span>
              <input type="file" accept=".csv,text/csv" className="sr-only" onChange={handleCsvSelection} />
            </label>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-muted"><span className="h-px flex-1 bg-border" />or paste rows<span className="h-px flex-1 bg-border" /></div>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Paste student rows</span>
              <textarea
                value={importData}
                onChange={(event) => { setImportData(event.target.value); setImportFileName(null); setFormState(null); setCompletedImportCount(null); setImportAttempted(false); setCredentialsCopied(false); }}
                rows={12}
                spellCheck={false}
                className="w-full resize-y rounded-xl border border-border bg-background p-4 font-mono text-sm leading-6 text-foreground outline-none transition placeholder:text-muted/60 focus:border-primary"
                placeholder="student@school.edu | Alex Morgan | SSC001 | G1"
              />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted">Passwords are generated during import. Copy or download the credentials before leaving this view.</p>
            </div>

            {parsedImportRows.length > 0 && <section className="overflow-hidden rounded-xl border border-border" aria-label="Import preview">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background/60 px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">Preview</h3>
                <span className="text-xs text-muted">Showing {Math.min(parsedImportRows.length, 8)} of {parsedImportRows.length} rows</span>
              </div>
              <div className="max-h-80 overflow-auto">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead className="sticky top-0 bg-background text-muted">
                    <tr><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Student</th><th className="px-4 py-3 font-semibold">ID / Group</th><th className="px-4 py-3 font-semibold">Validation</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {parsedImportRows.slice(0, 8).map((row) => (
                      <tr key={row.line} className={row.errors.length ? "bg-danger/5" : ""}>
                        <td className="px-4 py-3">{row.errors.length ? <span className="font-semibold text-danger">Fix row</span> : <span className="font-semibold text-success">Ready</span>}</td>
                        <td className="max-w-64 px-4 py-3"><span className="block truncate font-medium text-foreground">{row.full_name || "Name missing"}</span><span className="block truncate text-muted">{row.email || "Email missing"}</span></td>
                        <td className="px-4 py-3 font-mono text-muted">{row.student_id || "—"} / {row.group_id}</td>
                        <td className="max-w-64 px-4 py-3 text-danger">{row.errors.join(" ") || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>}
          </section>

          <aside className="space-y-5 rounded-2xl border border-border bg-surface/60 p-5 sm:p-6 xl:sticky xl:top-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Import summary</p>
              <h2 className="mt-2 text-xl font-bold text-foreground">{completedImportCount !== null ? "Import complete" : importAttempted ? "Review import results" : `${parsedImportRows.length} row${parsedImportRows.length === 1 ? "" : "s"} detected`}</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-success/20 bg-success/5 p-4"><p className="text-xs text-muted">{completedImportCount !== null ? "Imported" : "Ready"}</p><p className="mt-1 text-2xl font-bold text-success">{completedImportCount ?? validImportRows.length}</p></div>
              <div className="rounded-xl border border-danger/20 bg-danger/5 p-4"><p className="text-xs text-muted">Needs fixes</p><p className="mt-1 text-2xl font-bold text-danger">{invalidImportRows.length}</p></div>
            </div>
            <div className="rounded-xl border border-border bg-background/50 p-4 text-sm leading-6 text-muted">
              Valid rows can be imported while rows with validation issues are skipped. Review each row before starting.
            </div>
            <button type="button" onClick={handleBulkImportSubmit} disabled={isSubmitting || !validImportRows.length || readOnly || importAttempted} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-background transition hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-50">
              <Upload size={17} /> {isSubmitting ? "Importing students…" : completedImportCount !== null ? "Import finished" : importAttempted ? "Edit rows to retry" : `Import ${validImportRows.length} student${validImportRows.length === 1 ? "" : "s"}`}
            </button>
            {generatedCredentials.length ? <div className="space-y-3 border-t border-border pt-5">
              <div className="flex items-start justify-between gap-3">
                <div><h3 className="font-semibold text-foreground">Temporary credentials</h3><p className="mt-1 text-xs leading-5 text-muted">Save these now. They are only shown here after import.</p></div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button type="button" onClick={copyCredentials} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/40">
                    {credentialsCopied ? <Check size={14} /> : <Copy size={14} />}{credentialsCopied ? "Copied" : "Copy"}
                  </button>
                  <button type="button" onClick={downloadCredentials} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/40">
                    <Download size={14} /> Download CSV
                  </button>
                </div>
              </div>
              <textarea readOnly rows={Math.min(8, Math.max(3, generatedCredentials.length))} className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-xs leading-5 text-foreground outline-none" value={generatedCredentials.map((item) => `${item.student_id} | ${item.password}`).join("\n")} />
            </div> : null}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      {/* Header */}
      <PageHeader
        title="Agent Roster"
        description="Manage personnel, clearance, and accounts."
        icon={<Users size={28} />}
        actions={<div className="flex w-full flex-col gap-3 md:w-auto">
            <AdminSeasonToolbar seasons={seasons} seasonId={seasonId} />
            <div className="flex gap-3">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input type="text" placeholder="Search..." className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:border-cyan-500 outline-none" value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <ExportButton data={users.map(u => ({...u}))} />
            {!readOnly && <button onClick={() => { setFormState(null); setGeneratedCredentials([]); setCompletedImportCount(null); setImportAttempted(false); setCredentialsCopied(false); setShowImportView(true); }} className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground transition hover:border-primary/40"><Upload size={16} /> Import students</button>}
            {!readOnly && <button onClick={() => setModalMode("admin")} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-xs uppercase tracking-wider"><Shield size={16} /> Admin</button>}
            </div>
        </div>}
      />

      {/* Bulk Delete Bar */}
      {!readOnly && selectedIds.size > 0 && (
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
                    <tr className="border-b border-slate-800 bg-slate-950/50 text-xs uppercase tracking-wider text-slate-400">
                        <th className="p-4 w-10">{!readOnly && <button onClick={handleSelectAll} className="text-slate-500 hover:text-white">{selectedIds.size > 0 && selectedIds.size === filteredUsers.length ? <CheckSquare size={16} /> : <Square size={16} />}</button>}</th>
                        <th aria-sort={sortKey === "identity" ? sortDirection === "asc" ? "ascending" : "descending" : "none"} className="p-4">{sortHeader("Identity", "identity")}</th>
                        <th aria-sort={sortKey === "details" ? sortDirection === "asc" ? "ascending" : "descending" : "none"} className="p-4">{sortHeader("Details", "details")}</th>
                        <th aria-sort={sortKey === "stats" ? sortDirection === "asc" ? "ascending" : "descending" : "none"} className="p-4 text-right">{sortHeader("Stats", "stats")}</th>
                        <th aria-sort={sortKey === "role" ? sortDirection === "asc" ? "ascending" : "descending" : "none"} className="p-4 text-center">{sortHeader("Role", "role")}</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {loading ? (<tr><td colSpan={6} className="p-8 text-center text-slate-500">Scanning...</td></tr>) : sortedFilteredUsers.map(user => {
                        const isAdmin = admins.has(user.auth_id);
                        return (
                        <tr key={user.id} className={clsx("transition-colors group", selectedIds.has(user.id) ? "bg-rose-500/5" : "hover:bg-slate-800/30")}>
                            <td className="p-4">{!readOnly && <button onClick={() => handleSelectOne(user.id)} className={clsx(selectedIds.has(user.id) ? "text-rose-500" : "text-slate-600 hover:text-slate-400")}>{selectedIds.has(user.id) ? <CheckSquare size={16} /> : <Square size={16} />}</button>}</td>
                            <td className="p-4"><div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden"><Image unoptimized width={40} height={40} src={user.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.full_name}`} alt="" className="h-full w-full object-cover" /></div><div className="font-bold text-white">{user.full_name}</div></td>
                            <td className="p-4"><div className="flex flex-col"><span className="text-xs text-white font-mono">{user.student_id}</span><span className="text-[10px] text-slate-500">{user.group_id}</span></div></td>
                            <td className="p-4 text-right"><div className="font-mono font-bold text-cyan-400">{user.current_xp?.toLocaleString()}</div><div className="text-[10px] text-slate-500">Lvl {user.current_level}</div></td>
                            <td className="p-4 text-center">{isAdmin ? <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider"><Shield size={10} /> CMD</span> : <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider"><Users size={10} /> AGT</span>}</td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                    {!readOnly && <button onClick={() => setEditingUser(user)} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all" title="Edit"><Edit2 size={16} /></button>}
                                    {!readOnly && <button onClick={() => handleImpersonate(user.id)} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950 transition-all" title="Impersonate"><Eye size={16} /></button>}
                                    {!readOnly && <>
                                    {isAdmin ? (
                                        <button onClick={() => handleDemote(user)} className="p-2 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-600 hover:text-white transition-all"><ShieldOff size={16} /></button>
                                    ) : (
                                        <button onClick={() => handlePromote(user)} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-emerald-950 transition-all"><Shield size={16} /></button>
                                    )}
                                    <button onClick={() => handleDeleteSingle(user)} className="p-2 rounded-lg bg-slate-800 text-slate-500 hover:text-red-500 hover:bg-red-950/50 transition-all"><Trash2 size={16} /></button>
                                    </>}
                                </div>
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
      </div>

      {!readOnly && modalMode === "admin" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
                  <button onClick={() => { setModalMode(null); setFormState(null); }} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
                      <form onSubmit={handleCreateAdminSubmit} className="p-6 space-y-4">
                          <div className="mb-6"><h3 className="text-xl font-bold text-white flex items-center gap-2"><Shield className="text-emerald-500" /> Recruit Admin</h3><p className="text-sm text-slate-400">Create system administrator.</p></div>
                          <input name="fullName" type="text" required placeholder="Name" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-sm text-white focus:border-emerald-500 outline-none" />
                          <input name="email" type="email" required placeholder="Email" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-sm text-white focus:border-emerald-500 outline-none" />
                          <input name="password" type="password" required placeholder="Password" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-sm text-white focus:border-emerald-500 outline-none" />
                          {formState?.error && <div className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded">{formState.error}</div>}
                          {formState?.message && <div className="text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded">{formState.message}</div>}
                          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all disabled:opacity-50">{isSubmitting ? "Processing..." : "Grant Access"}</button>
                      </form>
              </div>
          </div>
      )}

      {!readOnly && editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onRefresh={fetchData} />}
    </div>
  );
}
