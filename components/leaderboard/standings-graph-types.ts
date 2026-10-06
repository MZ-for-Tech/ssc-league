export interface HistoryPoint {
  week: number;
  rank: number;
}

export interface StandingsStudent {
  id: string;
  full_name: string;
  preferred_name: string;
  history: HistoryPoint[];
}
