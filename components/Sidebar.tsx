"use client";

import React from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import SidebarLogo from "./Logo";
import SidebarNavigation from "@/components/sidebar/SidebarNavigation";
import SidebarFooter from "@/components/sidebar/SidebarFooter";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isAdmin: boolean;
  isImpersonating: boolean;
}

export default function Sidebar({ isOpen = false, onClose, isCollapsed, toggleCollapse, isAdmin, isImpersonating }: SidebarProps) {
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
          isCollapsed ? "w-[min(15rem,72vw)] lg:w-20" : "w-[min(15rem,72vw)] lg:w-64"
        )}
      >
        
        {/* 1. Header */}
        <div className="relative flex h-16 items-center justify-center border-b border-border lg:h-20">
            {isCollapsed ? (
               <SidebarLogo compact />
            ) : (
               <div className="flex w-full items-center justify-between px-3 sm:px-5 lg:px-6">
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

        <SidebarNavigation
          isCollapsed={isCollapsed}
          isAdmin={isAdmin}
          isImpersonating={isImpersonating}
          onClose={onClose}
        />

        <SidebarFooter isCollapsed={isCollapsed} />

      </aside>
    </>
  );
}
