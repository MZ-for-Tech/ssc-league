"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar"; 
import SidebarLogo from "@/components/Logo"; 
import ImpersonationBanner from "@/components/ImpersonationBanner"; // <--- The missing piece
import { Menu } from "lucide-react";

interface MainLayoutShellProps {
  children: React.ReactNode;
  isImpersonating: boolean; // Received from the server
}

export default function MainLayoutShell({ children, isImpersonating }: MainLayoutShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen relative font-sans text-foreground selection:bg-primary/30 bg-background">
       
       {/* 1. Living Background */}
       <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div 
            className="absolute inset-0 opacity-[0.15]" 
            style={{
                backgroundImage: `radial-gradient(rgb(var(--muted)) 1px, transparent 1px)`, 
                backgroundSize: '32px 32px'
            }} 
          />
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
       />

       {/* 4. Main Content */}
       <main 
          className={`flex-1 relative z-10 transition-all duration-300 mt-16 lg:mt-0 flex flex-col ${
              isCollapsed ? "lg:ml-20" : "lg:ml-64"
          }`}
       >
          {/* --- HERE ARE THE BUTTONS --- */}
          <ImpersonationBanner isImpersonating={isImpersonating} />
          
          <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
             {children}
          </div>
       </main>
    </div>
  );
}