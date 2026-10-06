"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLeagueSeason } from "@/app/actions/season-actions";
import type { SeasonRecord } from "@/lib/seasons";

export default function AdminSeasonToolbar({
  seasons,
  seasonId,
}: {
  seasons: SeasonRecord[];
  seasonId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  function selectSeason(nextSeasonId: string) {
    startTransition(async () => {
      try {
        await setLeagueSeason(nextSeasonId);
        router.refresh();
      } catch (error) {
        alert(error instanceof Error ? error.message : "Could not change league season.");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
      <label className="sr-only" htmlFor="admin-season">League season</label>
      <select
        id="admin-season"
        value={seasonId}
        disabled={isPending}
        onChange={(event) => selectSeason(event.target.value)}
        className="min-w-48 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-semibold text-foreground outline-none transition focus:border-cyan-400 disabled:opacity-60"
      >
        {seasons.filter((season) => season.status !== "setup").map((season) => (
          <option key={season.id} value={season.id}>{season.name}{season.status === "active" ? " · Active" : " · Archive"}</option>
        ))}
      </select>
    </div>
  );
}
