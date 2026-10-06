"use client";

import { useState, type ReactNode } from "react";
import { Award, CalendarDays, ClipboardCheck, HeartHandshake, MoreHorizontal, SlidersHorizontal, Trophy } from "lucide-react";

const tabs = [
  { id: "rewards", label: "Rewards", icon: Award },
  { id: "settings", label: "XP values", icon: SlidersHorizontal },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck },
  { id: "schedule", label: "Schedule", icon: CalendarDays },
  { id: "recognition", label: "Recognition", icon: HeartHandshake },
  { id: "reports", label: "Reports", icon: Trophy },
  { id: "tools", label: "More", icon: MoreHorizontal },
] as const;

export type LeagueOperationsTab = { id: (typeof tabs)[number]["id"]; content: ReactNode };

export default function LeagueOperationsWorkspace({ content }: { content: LeagueOperationsTab[] }) {
  const [activeTab, setActiveTab] = useState<LeagueOperationsTab["id"]>("rewards");
  const visibleTabs = tabs.filter(({ id }) => content.some((tab) => tab.id === id));
  const currentTab = visibleTabs.find((tab) => tab.id === activeTab) ?? visibleTabs[0];

  return (
    <div className="space-y-5">
      <nav aria-label="League operations" className="overflow-x-auto border-b border-border">
        <div className="flex min-w-max gap-1" role="tablist" aria-label="Operations sections">
          {visibleTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={currentTab.id === id}
              aria-controls={`operations-panel-${id}`}
              id={`operations-tab-${id}`}
              onClick={() => setActiveTab(id)}
              className={`console-control inline-flex min-h-12 items-center gap-2 border-b-2 px-4 py-3 font-semibold transition ${currentTab.id === id ? "border-primary bg-primary/5 text-primary" : "border-transparent text-muted hover:border-border hover:text-foreground"}`}
            >
              <Icon aria-hidden="true" size={17} className={currentTab.id === id ? "text-primary" : "text-muted"} />{label}
            </button>
          ))}
        </div>
      </nav>
      {content.filter((tab) => visibleTabs.some((visibleTab) => visibleTab.id === tab.id)).map((tab) => (
        <section
          key={tab.id}
          id={`operations-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`operations-tab-${tab.id}`}
          hidden={currentTab.id !== tab.id}
          className="space-y-5"
        >
          {tab.content}
        </section>
      ))}
    </div>
  );
}
