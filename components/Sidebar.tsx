"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Trophy, BookOpen, User, Info,
  X, LogOut, Loader2, ChevronLeft, ChevronRight, Bell,
  Terminal, Users, FileText, ClipboardCheck
} from "lucide-react";
import clsx from "clsx";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { clearImpersonationCookie } from "@/app/actions/admin-actions";
import SidebarLogo from "./Logo";

const studentNavGroups = [
  {
    name: "Learning",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Modules", href: "/modules", icon: BookOpen },
      { name: "Playground", href: "/playground", icon: Terminal },
    ],
  },
  {
    name: "League",
    items: [
      { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
      { name: "Comms", href: "/comms", icon: Bell },
    ],
  },
  {
    name: "More",
    items: [
      { name: "Profile", href: "/profile", icon: User },
      { name: "About", href: "/about", icon: Info },
    ],
  },
];

const adminNavGroups = [
  {
    name: "Teaching",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Modules", href: "/modules", icon: BookOpen },
      { name: "Playground", href: "/playground", icon: Terminal },
    ],
  },
  {
    name: "League",
    items: [
      { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
      { name: "Comms", href: "/comms", icon: Bell },
    ],
  },
  {
    name: "Manage",
    items: [
      { name: "Students", href: "/admin/users", icon: Users },
      { name: "Question bank", href: "/admin/questions", icon: FileText },
      { name: "Operations", href: "/admin/operations", icon: ClipboardCheck },
    ],
  },
  {
    name: "More",
    items: [{ name: "About", href: "/about", icon: Info }],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isAdmin: boolean;
  isImpersonating: boolean;
}

export default function Sidebar({ isOpen = false, onClose, isCollapsed, toggleCollapse, isAdmin, isImpersonating }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const supabase = createSupabaseBrowserClient();
  const navGroups = isAdmin && !isImpersonating
    ? adminNavGroups
    : studentNavGroups;

  const handleSignOut = async () => {
    try {
        setIsSigningOut(true);
        
        // Clear any stale impersonation state without requiring admin access.
        try {
          await clearImpersonationCookie();
        } catch (error) {
          console.error("Error clearing impersonation state:", error);
        }

        // Then kill the Supabase session
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        router.replace("/login");
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
          isCollapsed ? "w-64 lg:w-20" : "w-64"
        )}
      >
        
        {/* 1. Header */}
        <div className="h-20 flex items-center justify-center relative border-b border-border">
            {isCollapsed ? (
               <SidebarLogo compact />
            ) : (
               <div className="px-6 w-full flex justify-between items-center">
                  <SidebarLogo />
                  <button onClick={onClose} className="lg:hidden text-muted hover:text-foreground"><X size={20} /></button>
               </div>
            )}
            <button
              onClick={toggleCollapse}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!isCollapsed}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="absolute -right-3 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-md transition hover:border-primary/40 hover:text-primary lg:flex"
            >
              {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
        </div>

        {/* 2. Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 scrollbar-none">
          {navGroups.map((group) => (
            <div key={group.name || "main"} className="mb-5 last:mb-0">
              {!isCollapsed && group.name && (
                <p className="mb-2 px-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{group.name}</p>
              )}
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const href = item.href;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      href={href}
                      onClick={onClose}
                      title={isCollapsed ? item.name : ""}
                      className={clsx(
                        "instrument-nav-link flex items-center rounded-xl transition-all duration-200 group font-medium text-sm relative overflow-hidden",
                        isActive
                          ? "text-primary bg-primary/10 border border-primary/20"
                          : "text-muted hover:bg-surface hover:text-foreground border border-transparent",
                        isCollapsed ? "justify-center p-3" : "px-4 py-3"
                      )}
                    >
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgb(var(--primary))]" />}
                      <Icon size={20} className={clsx("transition-colors", isActive ? "text-primary" : "text-muted group-hover:text-foreground", !isCollapsed && "mr-3")} />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* 3. Footer Area */}
        <div className="p-3 border-t border-border bg-surface/30 flex flex-col gap-2">
          
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
                 <span className="text-xs text-slate-600 font-mono uppercase">v1.0.0 Stable</span>
              </div>
          )}
        </div>

      </aside>
    </>
  );
}
