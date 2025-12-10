"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";

export default function WelcomeScreen({ name }: { name: string }) {
  const [show, setShow] = useState(false);
  const [decryptedName, setDecryptedName] = useState("");
  const [mounted, setMounted] = useState(false);

  // 1. Handle Mounting
  useEffect(() => {
    setMounted(true);
    const hasSeenWelcome = sessionStorage.getItem("has_seen_welcome");
    if (!hasSeenWelcome) {
      setShow(true);
      sessionStorage.setItem("has_seen_welcome", "true");
    }
  }, []);

  // 2. Decryption & Timer Logic
  useEffect(() => {
    if (!show) return;

    // --- DECRYPTION (2x Faster) ---
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%";
    let iteration = 0;
    
    const interval = setInterval(() => {
      setDecryptedName(
        name
          .split("")
          .map((char, index) => {
            if (index < iteration) return name[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= name.length) {
        clearInterval(interval);
      }
      iteration += 1 / 2; // Increased from 1/4 to 1/2 for faster reveal
    }, 30);

    // --- TIMER (Reduced to 1.5s) ---
    const timer = setTimeout(() => {
      setShow(false);
    }, 1500); // Reduced from 2500ms

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [show, name]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          key="welcome-screen"
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-background/95 backdrop-blur-2xl cursor-wait"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)" }}
          transition={{ duration: 0.5, ease: "easeInOut" }} // Faster fade in/out
        >
          <div className="text-center space-y-6 scale-110">
            
            {/* Icon Pulse */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center"
            >
                <div className="p-5 rounded-full bg-primary/10 border border-primary/20 shadow-[0_0_40px_rgba(34,211,238,0.2)] animate-pulse">
                  <Terminal size={40} className="text-primary" />
                </div>
            </motion.div>

            {/* Text */}
            <div className="space-y-3">
                <p className="text-muted text-xs font-bold tracking-[0.3em] uppercase animate-pulse">
                    Identifying Agent...
                </p>
                <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight drop-shadow-2xl">
                    WELCOME, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        {decryptedName}
                    </span>
                </h1>
            </div>

            {/* Loading Bar (Synced to 1.5s) */}
            <div className="w-64 h-1.5 bg-surface rounded-full mx-auto overflow-hidden mt-10 border border-border">
                <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "linear" }} // Matches timeout
                className="h-full bg-primary-dim shadow-[0_0_15px_#22d3ee]" 
                />
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}