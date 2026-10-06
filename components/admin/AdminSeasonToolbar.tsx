"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { setLeagueSeason } from "@/app/actions/season-actions";
import type { SeasonRecord } from "@/lib/seasons";
import Dropdown from "@/components/ui/Dropdown";

export default function AdminSeasonToolbar({
  seasons,
  seasonId,
}: {
  seasons: SeasonRecord[];
  seasonId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  function selectSeason(nextSeasonId: string, close: () => void) {
    close();
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
      <Dropdown
        panelRole="menu"
        panelClassName="instrument-panel min-w-56 border-primary/25 bg-slate-950/95 p-1 text-sm"
        portal
        trigger={({ open, toggle, panelId }) => (
          <button
            type="button"
            disabled={isPending}
            onClick={toggle}
            aria-label="Select league season"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={panelId}
            className="console-control flex min-h-11 min-w-48 items-center justify-between gap-3 border border-primary/20 bg-background/55 px-3 py-2.5 font-semibold text-foreground outline-none transition hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-wait disabled:opacity-60"
          >
            <span className="truncate">{seasons.find((season) => season.id === seasonId)?.name || "Select season"}</span>
            <ChevronDown size={15} className="shrink-0 text-muted" />
          </button>
        )}
      >
        {({ close }) => seasons.filter((season) => season.status !== "setup").map((season) => (
          <button
            key={season.id}
            type="button"
            role="menuitemradio"
            aria-checked={season.id === seasonId}
            disabled={isPending}
            onClick={() => selectSeason(season.id, close)}
            className="console-control flex w-full items-center justify-between gap-4 px-3 py-2.5 text-left text-sm font-semibold text-slate-300 transition hover:bg-primary/10 hover:text-foreground disabled:opacity-60 aria-checked:bg-primary/10 aria-checked:text-primary"
          >
            <span>{season.name}{season.status === "active" ? " · Active" : " · Archive"}</span>
            {season.id === seasonId && <Check size={15} className="shrink-0" />}
          </button>
        ))}
      </Dropdown>
    </div>
  );
}
