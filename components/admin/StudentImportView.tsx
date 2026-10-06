"use client";

import { AlertCircle, ArrowLeft, Check, CheckCircle, Copy, Download, FileSpreadsheet, Upload } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import type { useStudentImport } from "@/components/admin/useStudentImport";

type StudentImportViewProps = {
  importFlow: ReturnType<typeof useStudentImport>;
  onBack: () => void;
};

export function StudentImportView({ importFlow, onBack }: StudentImportViewProps) {
  const {
    readOnly, formState, importFileName, importData, parsedImportRows, validImportRows, invalidImportRows,
    completedImportCount, importAttempted, isSubmitting, generatedCredentials, credentialsCopied,
    onCsvSelection, onImportDataChange, onImport, onCopyCredentials, onDownloadCredentials,
  } = importFlow;

  return (
      <div className="w-full space-y-6 animate-in fade-in pb-16">
        <PageHeader
          title="Import students"
          icon={<FileSpreadsheet size={28} />}
          actions={<button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-muted transition hover:text-foreground"><ArrowLeft size={16} /> Back to roster</button>}
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
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Required for every student</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">Email · Full name · Student ID</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-background/50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">Optional</p>
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
              <input type="file" accept=".csv,text/csv" className="sr-only" onChange={onCsvSelection} />
            </label>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-muted"><span className="h-px flex-1 bg-border" />or paste rows<span className="h-px flex-1 bg-border" /></div>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Paste student rows</span>
              <textarea
                value={importData}
                onChange={(event) => onImportDataChange(event.target.value)}
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
            <button type="button" onClick={onImport} disabled={isSubmitting || !validImportRows.length || readOnly || importAttempted} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-background transition hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-50">
              <Upload size={17} /> {isSubmitting ? "Importing students…" : completedImportCount !== null ? "Import finished" : importAttempted ? "Edit rows to retry" : `Import ${validImportRows.length} student${validImportRows.length === 1 ? "" : "s"}`}
            </button>
            {generatedCredentials.length ? <div className="space-y-3 border-t border-border pt-5">
              <div className="flex items-start justify-between gap-3">
                <div><h3 className="font-semibold text-foreground">Temporary credentials</h3><p className="mt-1 text-xs leading-5 text-muted">Save these now. They are only shown here after import.</p></div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button type="button" onClick={onCopyCredentials} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/40">
                    {credentialsCopied ? <Check size={14} /> : <Copy size={14} />}{credentialsCopied ? "Copied" : "Copy"}
                  </button>
                  <button type="button" onClick={onDownloadCredentials} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/40">
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
