"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronUp, ChevronDown, Minus, MoreHorizontal, Swords, Crosshair, Check } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import clsx from "clsx";
import type { DashboardRival } from "./types";

interface RivalsWidgetProps {
  rivals: DashboardRival[];
  myId?: string;
  seasonId: string;
}

export default function RivalsWidget({ rivals, myId, seasonId }: RivalsWidgetProps) {
  // Use the modern Supabase client
  const supabase = createSupabaseBrowserClient();

  const [pingedIds, setPingedIds] = useState<string[]>([]);

  const handlePing = async (receiverId: string) => {
    if (!myId || pingedIds.includes(receiverId)) return;

    // 1. Optimistic UI Update
    setPingedIds((prev) => [...prev, receiverId]);

    // 2. Send to DB
    await supabase.from("Ping").insert({
        season_id: seasonId,
        sender_id: myId,
        receiver_id: receiverId
    });
  };

  return (
    <div className="p-4 rounded-2xl border border-border bg-surface/50 backdrop-blur-sm flex flex-col h-fit">

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-foreground flex items-center gap-2 text-sm">
          <Swords size={16} className="text-danger" />
            Direct Rivals
        </h3>
        <span className="text-[10px] font-mono text-muted uppercase tracking-wider bg-background px-2 py-0.5 rounded border border-border">
            Active Zone
        </span>
      </div>

      <div className="flex-col space-y-2">
      <div className="flex justify-center -my-1"><MoreHorizontal size={12} /></div>

        {rivals.map((student) => {
          const isPinged = pingedIds.includes(student.id);
          const trend = student.trend || 0;
          const avatarUrl = student.avatar_url?.trim();
          const avatarInitial = student.name.trim().charAt(0).toUpperCase() || "?";

                    return (
            <div
                key={student.id}
                className={clsx(
                    "flex items-center justify-between p-2.5 rounded-xl border transition-all group relative",
                    student.isMe
                      ? "bg-primary/10 border-primary/30 shadow-[0_0_15px_rgb(var(--primary)/0.1)] z-10"
                      : "bg-background/30 border-border/50 hover:border-surface-light"
                )}
            >
                    <div className="flex items-center gap-3 overflow-hidden">
                    {/* Rank */}
                    <div className={clsx("font-mono text-xs font-bold w-5 text-center shrink-0", student.isMe ? "text-primary" : "text-muted")}>
                        #{student.rank}
                    </div>

                    {/* Avatar */}
                    {avatarUrl ? (
                      <Image unoptimized width={48} height={48}
                        src={avatarUrl}
                        alt=""
                        className={clsx("w-8 h-8 rounded-full bg-surface object-cover shrink-0", student.isMe && "ring-1 ring-primary")}
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className={clsx("w-8 h-8 rounded-full bg-surface text-muted flex items-center justify-center text-xs font-bold shrink-0", student.isMe && "ring-1 ring-primary")}
                      >
                        {avatarInitial}
                      </div>
                    )}

                    {/* Name & Stats Block */}
                    <div className="min-w-0">
                        <span className={clsx("text-xs md:text-sm font-bold block truncate", student.isMe ? "text-foreground" : "text-muted")}>
                            {student.name} {student.isMe && "(You)"}
                        </span>

                        {/* Meta Row: Trend + XP */}
                        <div className="flex items-center gap-2 mt-0.5">
                            {/* Trend */}
                            <div className="flex items-center text-[9px] font-bold">
                                {trend > 0 && <ChevronUp size={10} className="text-success mr-0.5" />}
                                {trend < 0 && <ChevronDown size={10} className="text-danger mr-0.5" />}
                                {trend === 0 && <Minus size={10} className="text-muted mr-0.5" />}

                                <span className={clsx(
                                  trend > 0 ? "text-success" :
                                  trend < 0 ? "text-danger" : "text-muted"
                                )}>
                                    {trend === 0 ? "Stable" : Math.abs(trend)}
                                </span>
                            </div>

                            <span className="text-muted text-[8px]">•</span>

                            {/* XP */}
                            <span className={clsx("text-[9px] font-mono", student.isMe ? "text-warning" : "text-muted")}>
                                {student.xp.toLocaleString()} XP
                            </span>
                        </div>
                    </div>
                </div>

                {/* ACTION: Ping Button (Only for others) */}
                {!student.isMe && (
                    <button
                        onClick={() => handlePing(student.id)}
                        disabled={isPinged}
                        title="Ping Rival"
                        className={clsx(
                            "p-2 rounded-lg transition-all duration-300 shrink-0 ml-2",
                            isPinged
                  ? "text-success bg-success/10"
                  : "text-muted hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100"
                        )}
                    >
                        {isPinged ? <Check size={14} /> : <Crosshair size={14} />}
                    </button>
                )}
            </div>
          );
        })}

        <div className="flex justify-center text-slate-800 -my-1"><MoreHorizontal size={12} /></div>
      </div>
    </div>
  );
}
