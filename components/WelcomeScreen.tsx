"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";

export default function WelcomeScreen({ name, storageKey = "has_seen_welcome" }: { name: string; storageKey?: string }) {
  const [show, setShow] = useState(false);
  const [decryptedName, setDecryptedName] = useState("");
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  // 1. Handle Mounting
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loginWelcome = sessionStorage.getItem("ssc_show_welcome_after_login") === "true";
      if (loginWelcome) sessionStorage.removeItem("ssc_show_welcome_after_login");

      if (loginWelcome || !sessionStorage.getItem(storageKey)) {
        sessionStorage.setItem(storageKey, "true");
        setShow(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageKey]);

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
          className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-background/95 px-4 py-8 backdrop-blur-md sm:backdrop-blur-2xl cursor-wait"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)" }}
          transition={{ duration: 0.5, ease: "easeInOut" }} // Faster fade in/out
        >
          <div className="w-full max-w-4xl space-y-5 text-center sm:space-y-6">

            {/* Icon Pulse */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center"
            >
                <div className="rounded-full border border-primary/20 bg-primary/10 p-4 shadow-glow-primary-soft animate-pulse sm:p-5">
                  <Terminal size={32} className="text-primary sm:h-10 sm:w-10" />
                </div>
            </motion.div>

            {/* Text */}
            <div className="space-y-3">
                <p className="text-muted text-[0.65rem] font-bold tracking-[0.2em] uppercase animate-pulse sm:text-xs sm:tracking-[0.3em]">
                    Identifying Agent...
                </p>
                <h1 className="break-words text-[clamp(2.25rem,10vw,3.5rem)] font-black leading-tight tracking-tight text-foreground drop-shadow-2xl sm:text-5xl md:text-7xl">
                    WELCOME, <br />
                    <span className="break-words text-transparent [overflow-wrap:anywhere] bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        {decryptedName}
                    </span>
                </h1>
            </div>

            {/* Loading Bar (Synced to 1.5s) */}
            <div className="mx-auto mt-8 h-1.5 w-48 overflow-hidden rounded-full border border-border bg-surface sm:mt-10 sm:w-64">
                <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "linear" }} // Matches timeout
                className="h-full bg-primary-dim shadow-glow-primary"
                />
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
