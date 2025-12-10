"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Parser } from "json2csv";

interface ExportButtonProps {
  data: any[];
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
      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all text-xs uppercase tracking-wider disabled:opacity-50"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      Export CSV
    </button>
  );
}