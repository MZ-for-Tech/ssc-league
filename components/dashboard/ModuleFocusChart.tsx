"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardCurriculumModule } from "./types";

const moduleColors = ["#22d3ee", "#818cf8", "#34d399", "#fbbf24", "#fb7185"];

interface ModuleActivity {
  name: string;
  attempts: number;
}

export default function ModuleFocusChart({ modules }: { modules: DashboardCurriculumModule[] }) {
  const data: ModuleActivity[] = modules.map((module) => ({ name: module.name, attempts: module.recentAttempts }));
  const totalAttempts = data.reduce((total, module) => total + module.attempts, 0);
  const chartHeight = Math.max(170, data.length * 64 + 34);

  return (
    <section className="instrument-panel overflow-hidden rounded-2xl border border-border bg-surface/45 p-5 sm:p-6">
      <header className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Your learning, lately</p>
          <h2 className="mt-1 text-lg font-bold text-foreground">Where you’ve been practising</h2>
          <p className="mt-1 text-xs text-muted">Question attempts by module · past 30 days</p>
        </div>
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2 text-right">
          <p className="font-mono text-xl font-bold leading-none tabular-nums text-primary">{totalAttempts}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">attempts</p>
        </div>
      </header>

      {data.length === 0 ? (
        <div className="mt-4 grid h-44 place-items-center rounded-xl border border-dashed border-border bg-background/20 px-4 text-center text-sm text-muted">
          Course modules will appear here when they’re available.
        </div>
      ) : totalAttempts === 0 ? (
        <div className="mt-4 grid h-44 place-items-center rounded-xl border border-dashed border-border bg-background/20 px-4 text-center">
          <div>
            <span className="mx-auto mb-3 block h-2 w-16 rounded-full bg-primary/35" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">Your recent practice will show here.</p>
            <p className="mt-1 text-xs text-muted">This view groups activity by module over 30 days.</p>
          </div>
        </div>
      ) : (
        <div className="mt-4" role="img" aria-label={`Horizontal bar chart of question attempts by module over the past 30 days`}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 25, bottom: 2, left: 4 }}
              barCategoryGap="34%"
            >
              <CartesianGrid horizontal={false} stroke="rgba(148, 163, 184, 0.13)" />
              <XAxis
                type="number"
                dataKey="attempts"
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8292a8", fontFamily: "monospace" }}
                tickMargin={10}
                domain={[0, (max: number) => Math.max(max, 1)]}
                label={{ value: "Question attempts", position: "insideBottom", offset: -1, fill: "#8292a8" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={155}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#c5d1e0", fontWeight: 600 }}
                tickMargin={10}
              />
              <Tooltip
                cursor={{ fill: "rgba(148, 163, 184, 0.06)" }}
                contentStyle={{ background: "#111b2b", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: 12, color: "#e5edf7", padding: "10px 12px" }}
                labelStyle={{ color: "#e5edf7", fontWeight: 700, marginBottom: 5 }}
                formatter={(value) => [`${value} question attempts`, "Practice"]}
              />
              <Bar dataKey="attempts" name="Practice" maxBarSize={28} radius={[0, 7, 7, 0]}>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={moduleColors[index % moduleColors.length]} fillOpacity={0.9} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
