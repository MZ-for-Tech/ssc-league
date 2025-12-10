"use client"; // Needed for useId
import React, { useId } from "react";

export default function Logo() {
  // Generate a unique ID for this specific instance of the logo
  const gradientId = useId(); 

  return (
    <div className="flex items-center justify-center py-5 px-4 cursor-default group">
      
      {/* 1. THE SYMBOL */}
      <div className="relative w-10 h-10 mr-3 flex-shrink-0 transition-transform duration-500 group-hover:rotate-180">
        <div className="absolute inset-0 bg-primary/40 blur-md rounded-full" />
        
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="w-full h-full relative z-10 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
        >
          <path 
            d="M12 2L2 22H22L12 2Z" 
            stroke={`url(#${gradientId})`} // Reference the unique ID
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M12 6L7 16H17L12 6Z" 
            fill={`url(#${gradientId})`} // Reference the unique ID
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
          
          <defs>
            {/* Assign the unique ID here */}
            <linearGradient id={gradientId} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22d3ee" />
              <stop offset="1" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 2. THE WORDMARK */}
      <div className="flex flex-col">
        <h1 
          className="font-['Road_Rage'] text-3xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-slate-200 leading-none mt-1"
          style={{ filter: "drop-shadow(0 0 5px rgba(34, 211, 238, 0.2))" }}
        >
          SSC2
        </h1>
        <span className="text-[0.6rem] font-sans font-bold text-primary/80 tracking-[0.3em] uppercase ml-1">
          League
        </span>
      </div>
    </div>
  );
}