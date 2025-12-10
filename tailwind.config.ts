import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",        // <-- Looks in your root app folder
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // <-- Looks in your root components folder
  ],
  theme: {
    extend: {
      // 1. Custom Fonts (Matches your globals.css @font-face)
      fontFamily: {
        sans: ["var(--font-inter)"],
        road: ["Road Rage", "sans-serif"], 
      },
      
      // 2. Animations (Merged yours + new ones)
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "grid-flow": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(40px)" },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
      animation: {
        "grid-flow": "grid-flow 20s linear infinite",
        "blob": "blob 10s infinite",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite", // Added this one
      },

      // 3. Colors (The Critical Fix)
      colors: {
        // Keep your existing custom slates
        slate: {
          850: "#151e2e",
          900: "#0f172a",
        },

        // --- NEW: Map CSS Variables to Tailwind Utilities ---
        background: "rgb(var(--background) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          light: "rgb(var(--surface-light) / <alpha-value>)",
        },
        border: "rgb(var(--border) / <alpha-value>)",
        
        // Text
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",

        // Brand
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          dim: "rgb(var(--primary-dim) / <alpha-value>)", 
        },

        // Status
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
export default config;