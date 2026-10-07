"use client"; // Needed for useId
import React, { useId } from "react";

export default function Logo({ compact = false }: { compact?: boolean }) {
  // Generate a unique ID for this specific instance of the logo
  const gradientId = useId(); 

  return (
    <div className={`flex items-center justify-center py-1 ${compact ? "px-2" : "px-2 sm:px-4"} cursor-default group`}>
      
      {/* 1. THE SYMBOL */}
      <div className={`app-brand-symbol relative ${compact ? "" : "mr-2 sm:mr-3"} flex-shrink-0 transition-transform duration-500 group-hover:rotate-180`}>
        <div className="absolute inset-0 bg-primary/40 blur-md rounded-full" />
        
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="w-full h-full relative z-10 drop-shadow-logo-symbol"
        >
          <path
            d="M12 2 22 22H2L12 2Z"
            stroke={`url(#${gradientId})`} // Reference the unique ID
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path
            d="M12 6 18 18H6L12 6Z"
            stroke={`url(#${gradientId})`}
            strokeOpacity=".48"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path
            d="M12 9 15.5 16H8.5L12 9Z"
            fill={`url(#${gradientId})`} // Reference the unique ID
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
          
          <defs>
            {/* Assign the unique ID here */}
            <linearGradient id={gradientId} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="rgb(var(--primary))" />
              <stop offset="1" stopColor="rgb(var(--logo-secondary))" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 2. THE WORDMARK */}
      {!compact && <div className="flex flex-col">
        <h1 
          className="app-brand-title whitespace-nowrap font-['Road_Rage'] tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-slate-200 leading-none mt-1 drop-shadow-logo-wordmark"
        >
          SSC2
        </h1>
        <span className="ml-1 whitespace-nowrap font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80 sm:text-xs">
          League
        </span>
        <span className="ml-1 mt-1 whitespace-nowrap font-sans text-[10px] font-semibold leading-none tracking-[0.16em] text-amber-400/80 uppercase sm:text-xs sm:tracking-[0.2em]">
          Season One
        </span>
      </div>}
    </div>
  );
}
