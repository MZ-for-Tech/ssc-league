"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Parser } from "json2csv";

interface ExportButtonProps {
  data: object[];
  filename?: string;
}

export default function ExportButton({ data, filename = "ssc_export.csv" }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      if (!data || data.length === 0) {
        alert("No data available to export.");
        return;
      }

      // 1. Convert JSON to CSV
      const parser = new Parser();
      const csv = parser.parse(data);

      // 2. Trigger Download
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SSC2_${new Date().toISOString().split('T')[0]}_${filename}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error(err);
      alert("Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={loading}
      className="app-touch-target inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-background/55 px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground transition hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50 sm:px-4 sm:text-sm"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      Export CSV
    </button>
  );
}
