"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, LayoutDashboard, Trophy, BookOpen, User, LogOut, Terminal, Moon, Sun } from "lucide-react";
import clsx from "clsx";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Define your actions
  const actions = [
    { id: "dash", name: "Go to Dashboard", icon: LayoutDashboard, shortcut: "D", perform: () => router.push("/") },
    { id: "rank", name: "Check Leaderboard", icon: Trophy, shortcut: "L", perform: () => router.push("/leaderboard") },
    { id: "mod", name: "Open Modules", icon: BookOpen, shortcut: "M", perform: () => router.push("/modules") },
    { id: "prof", name: "View Profile", icon: User, shortcut: "P", perform: () => router.push("/profile") },
    { id: "theme", name: "Toggle Stealth Mode", icon: Moon, shortcut: "T", perform: () => console.log("Theme Toggled") },
    { id: "logout", name: "Disconnect System", icon: LogOut, perform: () => router.push("/login") },
  ];

  // Filter based on search
  const filteredActions = actions.filter((action) =>
    action.name.toLowerCase().includes(query.toLowerCase())
  );

  // 1. Listen for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 2. Keyboard Navigation (Up/Down/Enter)
  useEffect(() => {
    const handleNav = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        filteredActions[selectedIndex]?.perform();
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleNav);
    return () => window.removeEventListener("keydown", handleNav);
  }, [isOpen, filteredActions, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      />

      {/* The Palette */}
      <div className="w-full max-w-lg relative bg-surface border border-surface-light rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header / Input */}
        <div className="flex items-center px-4 py-4 border-b border-border">
          <Search className="w-5 h-5 text-muted mr-3" />
          <input
                autoFocus
                placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-none text-foreground placeholder-muted focus:outline-none text-lg font-sans"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                }}
            />
            <div className="hidden md:flex gap-1">
            <kbd className="px-2 py-1 bg-surface-light rounded text-[10px] font-mono text-muted">ESC</kbd>
            </div>
        </div>

        {/* Results List */}
        <div className="py-2 max-h-[60vh] overflow-y-auto">
            {filteredActions.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted text-sm">
                    No commands found.
                </div>
            ) : (
                <>
              <div className="px-4 py-2 text-xs font-bold text-muted uppercase tracking-wider">Suggestions</div>
                    {filteredActions.map((action, index) => (
                        <button
                            key={action.id}
                            onClick={() => {
                                action.perform();
                                setIsOpen(false);
                            }}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={clsx(
                                "w-full flex items-center px-4 py-3 text-left transition-colors",
                                index === selectedIndex ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-muted border-l-2 border-transparent hover:bg-surface-light/50"
                            )}
                        >
                            <action.icon size={18} className="mr-3" />
                            <span className="flex-1">{action.name}</span>
                            {action.shortcut && (
                                <span className="text-xs font-mono text-muted bg-surface-light px-1.5 py-0.5 rounded border border-surface-light">
                                    {action.shortcut}
                                </span>
                            )}
                        </button>
                    ))}
                </>
            )}
        </div>

        {/* Footer */}
                    <div className="bg-background/50 px-4 py-2 border-t border-border flex items-center justify-between text-[10px] text-muted font-mono">
            <div className="flex items-center gap-2">
                <Terminal size={12} />
                <span>SSC2 SYSTEM CONSOLE v2.4</span>
            </div>
            <div className="flex gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
            </div>
        </div>

      </div>
    </div>
  );
}