"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar"; 
import SidebarLogo from "@/components/Logo"; 
import ImpersonationBanner from "@/components/ImpersonationBanner"; // <--- The missing piece
import { Archive, Menu } from "lucide-react";
import { LeagueSeasonProvider } from "@/components/LeagueSeasonContext";

interface MainLayoutShellProps {
  children: React.ReactNode;
  isAdmin: boolean;
  isImpersonating: boolean; // Received from the server
  selectedSeasonId: string;
  isArchivedSeason: boolean;
  selectedSeasonName: string;
}

export default function MainLayoutShell({ children, isAdmin, isImpersonating, selectedSeasonId, isArchivedSeason, selectedSeasonName }: MainLayoutShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <LeagueSeasonProvider seasonId={selectedSeasonId}>
    <div className="flex min-h-screen relative font-sans text-foreground selection:bg-primary/30 bg-background">
       
       {/* Shared SSC2 training-arena environment */}
       <div className="ssc-arena-backdrop fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="ssc-arena-atmosphere absolute inset-0" />
          <div className="ssc-arena-grid absolute inset-0" />
          <svg className="ssc-arena-map absolute -right-[22rem] -top-[17rem] h-[min(1120px,115vh)] w-[min(1120px,115vh)]" viewBox="0 0 1000 1000" fill="none" aria-hidden="true">
             <defs>
                <linearGradient id="arena-triangle" x1="500" y1="95" x2="500" y2="865" gradientUnits="userSpaceOnUse">
                   <stop stopColor="rgb(var(--primary))" />
                   <stop offset="1" stopColor="rgb(var(--retro-pink))" />
                </linearGradient>
                <radialGradient id="arena-beacon">
                   <stop stopColor="rgb(var(--primary))" stopOpacity=".14" />
                   <stop offset="1" stopColor="rgb(var(--primary))" stopOpacity="0" />
                </radialGradient>
             </defs>
             <circle cx="690" cy="320" r="350" fill="url(#arena-beacon)" />
             <g className="ssc-arena-orbits" stroke="rgb(var(--cyan-200))" strokeOpacity=".12">
                <circle cx="690" cy="320" r="150" />
                <circle cx="690" cy="320" r="225" strokeDasharray="2 12" />
                <circle cx="690" cy="320" r="300" strokeDasharray="1 18" />
             </g>
             <g stroke="url(#arena-triangle)" strokeOpacity=".17" strokeWidth="1.4">
                <path d="M500 95 930 850H70L500 95Z" />
                <path d="m500 205 335 585H165l335-585Z" strokeOpacity=".11" />
                <path d="m500 315 240 420H260l240-420Z" strokeOpacity=".09" />
                <path d="M70 850 500 535 930 850M165 790l335-255 335 255M260 735l240-200 240 200" strokeOpacity=".09" />
             </g>
             <g stroke="rgb(var(--cyan-200))" strokeOpacity=".12" strokeWidth="1">
                <path d="M500 95v755M70 850h860M285 472h430M392 284h216M178 660h644" strokeDasharray="3 11" />
                <path d="m500 95 430 755M500 95 70 850" strokeDasharray="1 15" />
             </g>
             <g fill="rgb(var(--primary))" fillOpacity=".55">
                <circle cx="500" cy="95" r="3" />
                <circle cx="70" cy="850" r="3" />
                <circle cx="930" cy="850" r="3" />
                <circle cx="690" cy="320" r="4" />
             </g>
          </svg>
          <div className="ssc-arena-vignette absolute inset-0" />
       </div>

       {/* 2. Mobile Header */}
       <header className="lg:hidden fixed top-0 left-0 right-0 h-16 px-4 bg-surface/80 backdrop-blur-md border-b border-border z-40 flex items-center justify-between">
          <button 
            onClick={() => {
              setIsCollapsed(false);
              setIsMobileOpen(true);
            }}
            aria-label="Open navigation"
            aria-expanded={isMobileOpen}
            className="p-2 -ml-2 text-muted hover:text-primary transition-colors"
          >
             <Menu size={24} />
          </button>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-75">
             <SidebarLogo />
          </div>
          <div className="w-8" />
       </header>

       {/* 3. Sidebar */}
       <Sidebar
          isOpen={isMobileOpen}
          onClose={() => setIsMobileOpen(false)}
          isCollapsed={isCollapsed}
          toggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isAdmin={isAdmin}
          isImpersonating={isImpersonating}
       />

       {/* 4. Main Content */}
       <main 
          className={`flex-1 relative z-10 transition-all duration-300 mt-16 lg:mt-0 flex flex-col ${
              isCollapsed ? "lg:ml-20" : "lg:ml-64"
          }`}
       >
          <div className="sticky top-0 z-[100]">
            {isArchivedSeason && <SeasonArchiveBanner seasonName={selectedSeasonName} />}
            <ImpersonationBanner isImpersonating={isImpersonating} />
          </div>
          
          <div className="app-content">
             {children}
          </div>
       </main>
    </div>
    </LeagueSeasonProvider>
  );
}

function SeasonArchiveBanner({ seasonName }: { seasonName: string }) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 bg-amber-400 px-4 py-3 text-amber-950 shadow-2xl sm:flex-row">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-amber-900/10 p-2"><Archive size={20} /></div>
        <div>
          <p className="text-sm font-black uppercase leading-none tracking-wider">{seasonName} archive active</p>
          <p className="mt-1 text-xs font-medium opacity-80">You are viewing preserved season data. Changes are disabled.</p>
        </div>
      </div>
    </div>
  );
}
