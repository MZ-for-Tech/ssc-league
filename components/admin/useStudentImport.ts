import { useState, type ChangeEvent } from "react";
import { bulkImportStudents } from "@/app/actions/admin-student-import";
import { csvToPipeRows, parseStudentImport } from "@/components/admin/student-import-utils";

type ImportFormState = { message?: string; error?: string } | null;
type ImportCredential = { student_id: string; password: string };
type UseStudentImportOptions = {
  readOnly: boolean;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  onImportComplete: () => Promise<void>;
};

export function useStudentImport({ readOnly, isSubmitting, setIsSubmitting, onImportComplete }: UseStudentImportOptions) {
  const [formState, setFormState] = useState<ImportFormState>(null);
  const [importData, setImportData] = useState("");
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [credentialsCopied, setCredentialsCopied] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<ImportCredential[]>([]);
  const [completedImportCount, setCompletedImportCount] = useState<number | null>(null);
  const [importAttempted, setImportAttempted] = useState(false);

  const parsedImportRows = parseStudentImport(importData);
  const validImportRows = parsedImportRows.filter((row) => row.errors.length === 0);
  const invalidImportRows = parsedImportRows.filter((row) => row.errors.length > 0);

  const resetForOpen = () => {
    setFormState(null);
    setGeneratedCredentials([]);
    setCompletedImportCount(null);
    setImportAttempted(false);
    setCredentialsCopied(false);
  };

  const handleImportDataChange = (value: string) => {
    setImportData(value);
    setImportFileName(null);
    setFormState(null);
    setCompletedImportCount(null);
    setImportAttempted(false);
    setCredentialsCopied(false);
  };

  const handleImport = async () => {
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
        void onImportComplete();
      }
    } catch (error: unknown) {
      setFormState({ error: error instanceof Error ? error.message : "The import failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCsvSelection = async (event: ChangeEvent<HTMLInputElement>) => {
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

  return {
    readOnly,
    formState,
    importData,
    importFileName,
    credentialsCopied,
    generatedCredentials,
    completedImportCount,
    importAttempted,
    parsedImportRows,
    validImportRows,
    invalidImportRows,
    isSubmitting,
    resetForOpen,
    onImportDataChange: handleImportDataChange,
    onCsvSelection: handleCsvSelection,
    onImport: handleImport,
    onCopyCredentials: copyCredentials,
    onDownloadCredentials: downloadCredentials,
  };
}
