import type { RecognitionStanding } from "@/components/admin/protocol-standings-types";

type RecognitionLeadersProps = {
  title: string;
  rows: RecognitionStanding[];
  metric: (row: RecognitionStanding) => string;
};

export default function RecognitionLeaders({ title, rows, metric }: RecognitionLeadersProps) {
  return (
    <div className="border border-border/70 bg-background/25 p-3">
      <div className="mb-2"><h3 className="text-sm font-semibold text-foreground">{title}</h3></div>
      <ol className="space-y-2">
        {rows.map((row, index) => (
          <li key={`${row.studentId}-${index}`} className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-foreground"><span className="mr-2 font-mono text-primary">{index + 1}</span>{row.name}<span className="ml-1 text-muted">· {row.group}</span></span>
            <span className="shrink-0 font-mono text-muted">{metric(row)}</span>
          </li>
        ))}
        {!rows.length && <li className="py-2 text-muted">No qualifying activity yet.</li>}
      </ol>
    </div>
  );
}
