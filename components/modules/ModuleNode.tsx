import React from "react";
import Link from "next/link";
import { CheckCircle, Lock, Play, FileText, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface Resource {
  title: string;
  type: string;
  url: string;
}

interface ModuleNodeProps {
  moduleId: number; // Used for Link
  missionId: number; // Used for Display
  title: string;
  description: string;
  status: "active" | "completed" | "locked";
  resources: Resource[];
  isLast?: boolean;
}

export default function ModuleNode({ 
  moduleId, 
  missionId, 
  title, 
  description, 
  status, 
  resources,
  isLast 
}: ModuleNodeProps) {
  
  // FIX: Completed items should NOT be locked. Only "locked" is locked.
  const isLocked = status === "locked";
  
  return (
    <div className="relative pl-8 pb-8 group">
      {/* Vertical Connecting Line */}
      {!isLast && (
        <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-slate-800 group-hover:bg-slate-700 transition-colors" />
      )}
      
      {/* Status Icon */}
      <div className={clsx(
        "absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 bg-slate-950 transition-all duration-300",
        status === "completed" ? "border-emerald-500 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" :
        status === "active" ? "border-cyan-500 text-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" :
        "border-slate-700 text-slate-700"
      )}>
        {status === "completed" ? <CheckCircle size={14} /> : 
         status === "active" ? <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" /> : 
         <Lock size={12} />}
      </div>

      {/* Card Content */}
      <div className={clsx(
        "border rounded-xl p-5 transition-all duration-300 relative overflow-hidden",
        status === "completed" ? "bg-emerald-950/10 border-emerald-500/20 hover:border-emerald-500/40" :
        status === "active" ? "bg-slate-900/50 border-cyan-500/30 hover:border-cyan-400" :
        "bg-slate-900/20 border-slate-800 opacity-60"
      )}>
         
         <div className="flex justify-between items-start gap-4">
             <div className="flex-1">
                 <div className="flex items-center gap-2 mb-2">
                    <span className={clsx(
                        "text-xs font-bold uppercase tracking-widest",
                        status === "completed" ? "text-emerald-400" : 
                        status === "active" ? "text-cyan-400" : "text-slate-500"
                    )}>
                        Mission {missionId}
                    </span>
                    {status === "completed" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                            COMPLETE
                        </span>
                    )}
                 </div>
                 
                 <h3 className={clsx("text-lg font-bold mb-2", isLocked ? "text-slate-500" : "text-white")}>
                    {title}
                 </h3>
                 <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
                    {description || "Classified module content."}
                 </p>

                 {/* Quick Resource Links (Only if unlocked) */}
                 {!isLocked && resources && resources.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {resources.slice(0, 3).map((res, idx) => (
                            <a 
                                key={idx} 
                                href={res.url} 
                                target="_blank"
                                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                            >
                                <FileText size={10} /> {res.type}
                            </a>
                        ))}
                    </div>
                 )}
             </div>

             {/* Action Button - Only show if UNLOCKED */}
             {!isLocked && (
                 <Link 
                    href={`/modules/${moduleId}`}
                    className={clsx(
                        "flex items-center justify-center w-10 h-10 rounded-full border transition-all flex-shrink-0 group-hover:scale-110",
                        status === "completed" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" :
                        "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                    )}
                 >
                    {status === "completed" ? <ChevronRight size={20} /> : <Play size={18} fill="currentColor" />}
                 </Link>
             )}
         </div>
      </div>
    </div>
  );
}