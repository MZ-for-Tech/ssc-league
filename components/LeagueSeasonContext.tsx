"use client";

import { createContext, useContext, type ReactNode } from "react";

const LeagueSeasonContext = createContext<string | null>(null);

export function LeagueSeasonProvider({
  seasonId,
  children,
}: {
  seasonId: string;
  children: ReactNode;
}) {
  return <LeagueSeasonContext.Provider value={seasonId}>{children}</LeagueSeasonContext.Provider>;
}

export function useLeagueSeasonId() {
  return useContext(LeagueSeasonContext);
}
