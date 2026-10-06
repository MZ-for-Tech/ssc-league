import type { RewardCategory, RewardProtocolData } from "@/lib/reward-protocol";

export type RewardProtocolHistoryEntry = {
  id: string;
  category: string;
  reward_key: string;
  reward_label: string;
  event_label: string;
  award_date: string;
  week_number: number;
  base_amount: number;
  boost_multiplier: number;
  amount: number;
  created_at: string;
  recipient_count: number;
};

type RewardProtocolHistoryProps = {
  history: RewardProtocolHistoryEntry[];
  protocol: RewardProtocolData;
};

export default function RewardProtocolHistory({ history, protocol }: RewardProtocolHistoryProps) {
  return (
    <div className="mt-6 border-t border-border/70 pt-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-[.13em] text-foreground">Recent protocol awards</h3>
        <span className="font-mono text-xs uppercase tracking-wider text-muted">Latest {history.length}</span>
      </div>
      {history.length ? (
        <div className="divide-y divide-border/60 border-y border-border/60">
          {history.map((entry) => (
            <div key={entry.id} className="flex flex-col justify-between gap-1.5 py-3 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <div className="truncate font-semibold text-foreground">{entry.reward_label}<span className="font-normal text-muted"> · {entry.event_label}</span></div>
                <div className="font-mono uppercase tracking-wider text-muted">{protocol[entry.category as RewardCategory]?.label || entry.category} · {entry.recipient_count} students · {entry.base_amount} × {entry.boost_multiplier} = {entry.amount} XP · week {entry.week_number}</div>
              </div>
              <time dateTime={entry.award_date} className="shrink-0 font-mono text-muted">{entry.award_date}</time>
            </div>
          ))}
        </div>
      ) : <div className="border border-dashed border-border/70 px-4 py-6 text-center text-muted">No protocol rewards issued this season yet.</div>}
    </div>
  );
}
