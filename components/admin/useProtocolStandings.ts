"use client";

import { useMemo } from "react";
import type { ProtocolActivity, ProtocolAnswer, ProtocolAttendance, ProtocolStudent } from "@/components/admin/protocol-standings-types";
import { buildProtocolStandingsCsv, buildProtocolStandingsRows, buildRecognitionLeaders } from "@/components/admin/protocol-standings-data";

export function useProtocolStandings({
  students,
  attendance,
  activity,
  answers,
}: {
  students: ProtocolStudent[];
  attendance: ProtocolAttendance[];
  activity: ProtocolActivity[];
  answers: ProtocolAnswer[];
}) {
  const rows = useMemo(() => buildProtocolStandingsRows(students, attendance, activity), [students, attendance, activity]);

  const recognitionLeaders = useMemo(() => buildRecognitionLeaders(students, answers, attendance), [students, answers, attendance]);

  const exportCsv = () => {
    const csv = buildProtocolStandingsCsv(rows, recognitionLeaders);
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `ssc-season-standings-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return { rows, recognitionLeaders, exportCsv };
}
