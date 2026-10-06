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
          200: "rgb(var(--foreground) / <alpha-value>)",
          300: "rgb(var(--slate-300) / <alpha-value>)",
          400: "rgb(var(--muted) / <alpha-value>)",
          500: "rgb(var(--slate-500) / <alpha-value>)",
          600: "rgb(var(--slate-600) / <alpha-value>)",
          700: "rgb(var(--surface-light) / <alpha-value>)",
          800: "rgb(var(--surface) / <alpha-value>)",
          850: "rgb(var(--slate-850) / <alpha-value>)",
          900: "rgb(var(--background) / <alpha-value>)",
          950: "rgb(var(--slate-950) / <alpha-value>)",
        },
        cyan: {
          200: "rgb(var(--cyan-200) / <alpha-value>)",
          300: "rgb(var(--cyan-300) / <alpha-value>)",
          400: "rgb(var(--primary) / <alpha-value>)",
          500: "rgb(var(--primary-dim) / <alpha-value>)",
          600: "rgb(var(--cyan-600) / <alpha-value>)",
          700: "rgb(var(--cyan-700) / <alpha-value>)",
          900: "rgb(var(--cyan-900) / <alpha-value>)",
          950: "rgb(var(--cyan-950) / <alpha-value>)",
        },
        code: {
          editor: "rgb(var(--code-editor) / <alpha-value>)",
          console: "rgb(var(--code-console) / <alpha-value>)",
          line: "rgb(var(--code-line-number) / <alpha-value>)",
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
