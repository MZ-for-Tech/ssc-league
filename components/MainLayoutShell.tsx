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
       
       {/* 1. Living Background */}
       <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute inset-0 opacity-[0.15] bg-dot-grid" />
          <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-dim/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" style={{ animationDelay: "4s" }} />
          <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
       </div>

       {/* 2. Mobile Header */}
       <header className="lg:hidden fixed top-0 left-0 right-0 h-16 px-4 bg-surface/80 backdrop-blur-md border-b border-border z-40 flex items-center justify-between">
          <button 
            onClick={() => setIsMobileOpen(true)} 
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
