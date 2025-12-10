import React from "react";
import { LucideIcon } from "lucide-react";

interface BadgeProps {
  icon: LucideIcon;
  name: string;
  description: string;
  unlocked: boolean;
  color?: string; // Tailwind color class (e.g. "cyan-400")
}

export default function Badge({ icon: Icon, name, description, unlocked, color = "text-primary" }: BadgeProps) {
  return (
    <div className={`group relative p-4 rounded-xl border transition-all duration-300 ${
        unlocked 
        ? "bg-surface/80 border-surface-light hover:border-primary/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
        : "bg-surface/30 border-border opacity-50 grayscale"
    }`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-surface-light ${unlocked ? color : "text-muted"}`}>
          <Icon size={24} />
        </div>
        <div>
          <h4 className={`font-bold text-sm ${unlocked ? "text-foreground" : "text-muted"}`}>{name}</h4>
          <p className="text-xs text-muted mt-0.5">{description}</p>
        </div>
      </div>
      
      {/* Locked Overlay */}
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl backdrop-blur-[1px]">
            <span className="text-xs font-mono uppercase tracking-widest text-muted">Locked</span>
        </div>
      )}
    </div>
  );
}