"use client";

import React, { useState } from "react";
import { EyeOff, ShieldAlert, LogOut, Users } from "lucide-react";
import { stopImpersonation } from "@/app/actions/admin-actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ImpersonationBanner({ isImpersonating }: { isImpersonating: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  if (!isImpersonating) return null;

  const handleExit = async () => {
    setLoading(true);
    await stopImpersonation();
    // Force redirect back to the Agent Roster for rapid switching
    window.location.href = "/admin/users"; 
  };

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-3 shadow-2xl sticky top-0 z-[100] flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top-full duration-500">
        
        {/* Left: Status Indicator */}
        <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-900/10 rounded-full animate-pulse">
                <EyeOff size={20} />
            </div>
            <div>
                <p className="font-black text-sm uppercase tracking-wider leading-none">GOD MODE ACTIVE</p>
                <p className="text-xs font-medium opacity-80">You are viewing this interface as a Student.</p>
            </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
            
            {/* 1. Jump to Admin (Keep session alive) */}
            <Link 
                href="/admin"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
            >
                <ShieldAlert size={14} />
                Command Center
            </Link>

            {/* 2. Kill Session & Return to Roster (Switch Student) */}
            <button 
                onClick={handleExit}
                disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-amber-950 text-amber-500 hover:bg-amber-900 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
            >
                {loading ? "Terminating..." : (
                    <>
                        <Users size={14} />
                        Return to Roster
                    </>
                )}
            </button>
        </div>
    </div>
  );
}