"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Trophy, BookOpen, User, Info, 
  X, LogOut, Loader2, ChevronLeft, ChevronRight, Bell,
  Terminal
} from "lucide-react";
import clsx from "clsx";
import { createBrowserClient } from "@supabase/ssr";
import { stopImpersonation } from "@/app/actions/admin-actions";
import SidebarLogo from "./Logo";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Modules", href: "/modules", icon: BookOpen },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Playground", href: "/playground", icon: Terminal },
  { name: "Comms", href: "/comms", icon: Bell },
  { name: "Profile", href: "/profile", icon: User },
  { name: "About", href: "/about", icon: Info }
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export default function Sidebar({ isOpen = false, onClose, isCollapsed, toggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignOut = async () => {
    try {
        setIsSigningOut(true);
        
        // Kill the "God Mode" cookie first
        await stopImpersonation(); 

        // Then kill the Supabase session
        await supabase.auth.signOut();
        
        router.push("/login");
        router.refresh();
    } catch (error) {
        console.error("Error signing out:", error);
        setIsSigningOut(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={clsx(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside 
        className={clsx(
          // THEME: 'bg-background', 'border-border'
          "fixed top-0 left-0 h-full bg-background border-r border-border z-50 transition-all duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        
        {/* 1. Header */}
        <div className="h-20 flex items-center justify-center relative border-b border-border">
            {isCollapsed ? (
               <div className="scale-75 font-bold text-primary text-xl">SSC2</div>
            ) : (
               <div className="px-6 w-full flex justify-between items-center">
                  <SidebarLogo />
                  <button onClick={onClose} className="lg:hidden text-muted hover:text-foreground"><X size={20} /></button>
               </div>
            )}
        </div>

        {/* 2. Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto scrollbar-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                title={isCollapsed ? item.name : ""}
                className={clsx(
                  "flex items-center rounded-xl transition-all duration-200 group font-medium text-sm relative overflow-hidden",
                  isActive
                    // THEME: 'text-primary', 'bg-primary/10', 'border-primary/20'
                    ? "text-primary bg-primary/10 border border-primary/20"
                    // THEME: 'text-muted', 'hover:bg-surface', 'hover:text-foreground'
                    : "text-muted hover:bg-surface hover:text-foreground border border-transparent",
                  isCollapsed ? "justify-center p-3" : "px-4 py-3.5"
                )}
              >
                {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgb(var(--primary))]" />
                )}
                
                <Icon size={20} className={clsx("transition-colors", isActive ? "text-primary" : "text-muted group-hover:text-foreground", !isCollapsed && "mr-3")} />
                
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* 3. Footer Area */}
        <div className="p-3 border-t border-border bg-surface/30 flex flex-col gap-2">
          
          {/* Toggle Button */}
          <button 
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center w-full p-2 text-muted hover:text-foreground hover:bg-surface rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Logout Button */}
          <button 
            onClick={handleSignOut}
            disabled={isSigningOut}
            title="Disconnect"
            className={clsx(
                // THEME: 'hover:border-danger/20', 'hover:text-danger', 'hover:bg-danger/10'
                "flex items-center rounded-xl transition-all group border border-transparent hover:border-danger/20 text-muted hover:text-danger hover:bg-danger/10",
                isCollapsed ? "justify-center p-3" : "w-full px-4 py-3"
            )}
          >
            {isSigningOut ? (
                <Loader2 size={18} className="animate-spin" />
            ) : (
                <LogOut size={18} className={clsx(!isCollapsed && "mr-3")} />
            )}
            {!isCollapsed && <span className="text-sm font-medium">{isSigningOut ? "..." : "Disconnect"}</span>}
          </button>

          {/* Status Footer */}
          {!isCollapsed && (
              <div className="mt-2 flex items-center justify-between px-2 animate-in fade-in slide-in-from-bottom-2">
                 <span className="text-[10px] text-slate-600 font-mono uppercase">v1.0.0 Stable</span>
                 <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      {/* THEME: 'bg-success' */}
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                    </span>
                    <span className="text-[10px] text-success font-bold">SYS_ONLINE</span>
                 </div>
              </div>
          )}
        </div>

      </aside>
    </>
  );
}