"use client";

import * as React from "react";
import clsx from "clsx";

// 1. Context to manage state
const TooltipContext = React.createContext<{
  isVisible: boolean;
  setIsVisible: (v: boolean) => void;
} | null>(null);

// 2. Provider (Simple Wrapper)
export const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// 3. Root Component
export const Tooltip = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  return (
    <TooltipContext.Provider value={{ isVisible, setIsVisible }}>
      <div className="relative flex items-center justify-center" onMouseLeave={() => setIsVisible(false)}>
        {children}
      </div>
    </TooltipContext.Provider>
  );
};

// 4. Trigger (The thing you hover over)
export const TooltipTrigger = ({ children, asChild }: any) => {
  const ctx = React.useContext(TooltipContext);
  if (!ctx) throw new Error("TooltipTrigger must be used within a Tooltip");

  return (
    <div 
        onMouseEnter={() => ctx.setIsVisible(true)} 
        onFocus={() => ctx.setIsVisible(true)}
        className="cursor-pointer"
    >
      {children}
    </div>
  );
};

// 5. Content (The Bubble)
export const TooltipContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const ctx = React.useContext(TooltipContext);
  if (!ctx || !ctx.isVisible) return null;

  return (
    <div className={clsx(
        "absolute bottom-full mb-2 px-3 py-1.5 text-xs rounded-md bg-surface border border-surface-light text-foreground shadow-xl whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-200",
        className
    )}>
      {children}
      {/* Tiny arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-surface-light" />
    </div>
  );
};