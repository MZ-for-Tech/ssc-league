"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, FileText, Settings, 
  LogOut, ChevronLeft, ChevronRight, Menu, ShieldAlert,
  Terminal, Database, Activity
} from "lucide-react";
import clsx from "clsx";

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Command Center", icon: LayoutDashboard },
    { href: "/admin/users", label: "Agent Roster", icon: Users },
    { href: "/admin/questions", label: "Question Bank", icon: FileText },
    // { href: "/admin/settings", label: "System Config", icon: Settings }, // Future
  ];

  return (
    <>
      {/* Mobile Trigger */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 bg-slate-900 border border-slate-800 text-white rounded-lg shadow-xl"
        >
            <Menu size={20} />
        </button>
      </div>

      {/* Sidebar Backdrop (Mobile) */}
      {isMobileOpen && (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={clsx(
            "fixed top-0 left-0 h-full bg-slate-950 border-r border-slate-800 transition-all duration-300 z-50 flex flex-col",
            isCollapsed ? "w-20" : "w-64",
            isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className={clsx("h-20 flex items-center border-b border-slate-800/50", isCollapsed ? "justify-center" : "px-6 gap-3")}>
            <div className="w-8 h-8 rounded bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                <ShieldAlert size={18} />
            </div>
            {!isCollapsed && (
                <div>
                    <h1 className="font-black text-white tracking-tight leading-none">SSC2 CMD</h1>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Admin Access L5</span>
                </div>
            )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link 
                        key={item.href} 
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={clsx(
                            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                            isActive 
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                                : "text-slate-400 hover:text-white hover:bg-slate-900"
                        )}
                    >
                        <item.icon size={20} className={clsx("shrink-0 transition-colors", isActive ? "text-rose-400" : "group-hover:text-cyan-400")} />
                        
                        {!isCollapsed && (
                            <span className="font-medium text-sm">{item.label}</span>
                        )}
                        
                        {/* Active Indicator Line */}
                        {isActive && !isCollapsed && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-rose-500 rounded-l-full" />
                        )}
                    </Link>
                );
            })}
        </nav>

        {/* System Status (Footer) */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            {!isCollapsed ? (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] uppercase text-slate-500 font-bold">
                            <span>Database</span>
                            <span className="text-emerald-400">Connected</span>
                        </div>
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-emerald-500/50 animate-pulse" />
                        </div>
                    </div>
                    <Link 
                        href="/dashboard" 
                        className="flex items-center justify-center w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-white transition-colors"
                    >
                        Exit to App
                    </Link>
                </div>
            ) : (
                <div className="flex justify-center">
                    <Activity size={16} className="text-emerald-500 animate-pulse" />
                </div>
            )}
        </div>

        {/* Collapse Toggle (Desktop Only) */}
        <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-24 w-6 h-6 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hidden md:flex hover:scale-110 transition-transform"
        >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
    </>
  );
}