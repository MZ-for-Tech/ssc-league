"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { adminNavGroups, studentNavGroups } from "@/components/sidebar/navigation-groups";

type SidebarNavigationProps = {
  isCollapsed: boolean;
  isAdmin: boolean;
  isImpersonating: boolean;
  onClose?: () => void;
};

export default function SidebarNavigation({ isCollapsed, isAdmin, isImpersonating, onClose }: SidebarNavigationProps) {
  const pathname = usePathname();
  const navGroups = isAdmin && !isImpersonating ? adminNavGroups : studentNavGroups;

  return (
    <nav className="flex-1 overflow-y-auto px-2.5 py-4 scrollbar-none sm:px-3 lg:py-5">
      {navGroups.map((group) => (
        <div key={group.name || "main"} className="mb-4 last:mb-0 lg:mb-5">
          {!isCollapsed && group.name && (
            <p className="mb-2 px-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{group.name}</p>
          )}
          <div className="space-y-1.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  title={isCollapsed ? item.name : ""}
                  className={clsx(
                    "app-touch-target instrument-nav-link flex items-center rounded-xl transition-all duration-200 group font-medium text-sm relative overflow-hidden",
                    isActive
                      ? "text-primary bg-primary/10 border border-primary/20"
                      : "text-muted hover:bg-surface hover:text-foreground border border-transparent",
                    isCollapsed ? "justify-center p-3" : "px-3 py-2.5 lg:px-4 lg:py-3",
                  )}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgb(var(--primary))]" />}
                  <Icon size={18} className={clsx("shrink-0 transition-colors lg:h-5 lg:w-5", isActive ? "text-primary" : "text-muted group-hover:text-foreground", !isCollapsed && "mr-2.5 lg:mr-3")} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
