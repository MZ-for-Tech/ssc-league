"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type RankChartPoint = {
  name: string;
  fullWeek: string;
  average: number;
  myRank: number | null;
  rivalRank: number | null;
};

type RankHistoryChartProps = {
  chartData: RankChartPoint[];
  maxRank: number;
  rivalId: string | null;
  selectedRivalName: string;
};

export default function RankHistoryChart({ chartData, maxRank, rivalId, selectedRivalName }: RankHistoryChartProps) {
  return (
    <div
      className="h-[400px] w-full bg-slate-900/20 border border-slate-800/50 rounded-xl p-4 relative"
      style={{ minHeight: "400px" }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--surface))" vertical={false} />
          <XAxis dataKey="name" stroke="rgb(var(--slate-500))" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis reversed stroke="rgb(var(--slate-500))" fontSize={10} width={40} tickFormatter={(val) => `#${val}`} tickLine={false} axisLine={false} domain={[1, maxRank]} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as RankChartPoint;
                return (
                  <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs min-w-[140px]">
                    <p className="text-slate-400 font-bold mb-2 uppercase tracking-wider border-b border-slate-800 pb-1">{data.fullWeek}</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-cyan-400 font-bold">You</span>
                        <span className="text-white font-mono">#{data.myRank ?? "-"}</span>
                      </div>
                      {rivalId && (
                        <div className="flex justify-between items-center">
                          <span className="text-amber-400 font-bold">{selectedRivalName}</span>
                          <span className="text-white font-mono">#{data.rivalRank ?? "-"}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Average</span>
                        <span className="font-mono">#{data.average}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line type="monotone" dataKey="average" stroke="rgb(var(--slate-600))" strokeWidth={2} strokeDasharray="4 4" dot={false} activeDot={false} />
          {rivalId && (
            <Line type="monotone" dataKey="rivalRank" stroke="rgb(var(--amber-400))" strokeWidth={2} dot={{ r: 3, fill: "rgb(var(--amber-400))", strokeWidth: 0 }} activeDot={{ r: 5, stroke: "rgb(var(--foreground))", strokeWidth: 2 }} animationDuration={1000} />
          )}
          <Line type="monotone" dataKey="myRank" stroke="rgb(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "rgb(var(--primary))", strokeWidth: 2, stroke: "rgb(var(--foreground))" }} activeDot={{ r: 6, stroke: "rgb(var(--foreground))", strokeWidth: 3 }} animationDuration={1500} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
