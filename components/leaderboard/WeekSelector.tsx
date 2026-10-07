"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Activity, Calendar } from "lucide-react";
import DropdownSelect from "@/components/ui/DropdownSelect";

interface WeekSelectorProps {
  maxWeek: number;
}

export default function WeekSelector({ maxWeek }: WeekSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentWeek = searchParams.get("week");
  const isLive = !currentWeek;
  const options = [
    { value: "live", label: "Live Ranking" },
    ...Array.from({ length: maxWeek }, (_, index) => maxWeek - index).map((week) => ({
      value: String(week),
      label: `Week ${week}`,
    })),
  ];

  return (
    <div className="w-full sm:w-auto sm:min-w-48">
      <DropdownSelect
        value={currentWeek ?? "live"}
        options={options}
        onChange={(value) => router.push(value === "live" ? "/leaderboard" : `/leaderboard?week=${value}`)}
        ariaLabel="Ranking period"
        leadingIcon={isLive ? <Activity size={16} /> : <Calendar size={16} />}
      />
    </div>
  );
}
