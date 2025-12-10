"use client";

import React from "react";
import { ScrollText } from "lucide-react";

const RULES = [
  { item: "Quiz: Correct Answer", xp: 2 },
  { item: "Quiz: Attempt (Wrong)", xp: 1 },
  { item: "Attend first 2 weeks", xp: 10 },
  { item: "Submit an assignment", xp: 20 },
  { item: "Practice Exam", xp: 10 },
  { item: "Punctuality", xp: 10 },
  { item: "Extra Effort", xp: 20 },
  { item: "Office Hours", xp: 10 },
  { item: "Group Participation", xp: 15 },
  { item: "Submit a project", xp: 40 },
  { item: "Pass a Midterm Exam", xp: 40 },
  { item: "Knowledge Sharing", xp: 20 },
  { item: "Attendance (Sessions 1-2)", xp: 10 },
  { item: "Attendance (Sessions 3-4)", xp: 15 },
  { item: "Attendance (Sessions 5-6)", xp: 20 },
  { item: "Attendance (7+)", xp: 25 },
];

export default function RulesCard() {
  return (
    <div className="bg-surface/50 border border-border rounded-2xl p-6 backdrop-blur-sm h-full flex flex-col">
      <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
        <ScrollText size={18} className="text-primary" />
        Combat Manual
      </h3>
      
      <div className="flex-1 overflow-y-auto pr-2 max-h-[240px] space-y-2 scrollbar-thin scrollbar-thumb-surface-light scrollbar-track-transparent">
        {RULES.map((rule, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-surface-light/30 border border-surface-light/30 hover:bg-surface-light/60 transition-colors group">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-surface-light group-hover:bg-primary transition-colors" />
                <span className="text-xs text-muted group-hover:text-foreground transition-colors">{rule.item}</span>
            </div>
            <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                +{rule.xp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}