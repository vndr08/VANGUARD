import type { Config } from "tailwindcss";

/*
 * VANGUARD Design System — Tailwind Extension
 * Source: DESIGN.md tokens
 *
 * Usage:
 * - Colors: bg-surface-1, text-brand, border-st-driving, bg-st-driving-bg
 * - Fonts: font-mono
 * - Shadows: shadow-elev-1, shadow-elev-2, shadow-elev-3, shadow-glow-live
 * - Radius: rounded-xl (custom)
 * - Transition: duration-micro, duration-normal, duration-panel
 */

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],

  theme: {
    extend: {
      /* ─── Colors ──────────────────────────────────────────────────────── */
      colors: {
        // Surface hierarchy
        bg: "var(--bg)",
        background: "var(--bg)",
        surface: {
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
        },

        // Border
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },

        // Text
        foreground: "var(--text)",
        muted: "var(--text-muted)",
        faint: "var(--text-faint)",

        // Brand
        brand: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
          soft: "var(--brand-soft)",
        },

        // Signal (hi-vis amber)
        signal: {
          DEFAULT: "var(--signal)",
          soft: "var(--signal-soft)",
        },

        // HUD (technical cyan)
        hud: {
          DEFAULT: "var(--hud)",
          soft: "var(--hud-soft)",
        },

        // Vehicle status
        st: {
          driving: {
            DEFAULT: "var(--st-driving)",
            bg: "var(--st-driving-bg)",
          },
          idle: {
            DEFAULT: "var(--st-idle)",
            bg: "var(--st-idle-bg)",
          },
          stop: {
            DEFAULT: "var(--st-stop)",
            bg: "var(--st-stop-bg)",
          },
          offline: {
            DEFAULT: "var(--st-offline)",
            bg: "var(--st-offline-bg)",
          },
          delayed: {
            DEFAULT: "var(--st-delayed)",
            bg: "var(--st-delayed-bg)",
          },
        },

        // Task status
        task: {
          waiting: "var(--task-waiting)",
          assigned: "var(--task-assigned)",
          progress: "var(--task-progress)",
          unloading: "var(--task-unloading)",
          completed: "var(--task-completed)",
        },

        // Legacy compatibility
        steel: {
          50: "#f7f8f8",
          100: "#ecefee",
          200: "#d8dddd",
          300: "#b8c1c0",
          400: "#8f9b9a",
          500: "#667371",
          600: "#4f5a58",
          700: "#3d4644",
          800: "#2c3332",
          900: "#171d1c",
          950: "#0b0f0e",
        },
      },

      /* ─── Typography ───────────────────────────────────────────────────── */
      fontSize: {
        display: ["var(--text-display)", { lineHeight: "1.25", fontWeight: "600" }],
        h1: ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }],
        h2: ["1rem", { lineHeight: "1.5rem", fontWeight: "600" }],
        body: ["0.875rem", { lineHeight: "1.5" }],
        sm: ["0.8125rem", { lineHeight: "1.125rem" }],
        label: ["0.6875rem", { lineHeight: "0.875rem", fontWeight: "600" }],
        mono: ["var(--text-mono-kpi)", { lineHeight: "1.875rem", fontWeight: "600" }],
      },

      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },

      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
      },

      letterSpacing: {
        tight: "-0.02em",
        normal: "0",
        wide: "0.04em",
      },

      /* ─── Spacing (base 4px) ───────────────────────────────────────────── */
      spacing: {
        "1": "0.25rem",  // 4px
        "2": "0.5rem",   // 8px
        "3": "0.75rem",  // 12px
        "4": "1rem",     // 16px
        "5": "1.25rem",  // 20px
        "6": "1.5rem",   // 24px
        "8": "2rem",     // 32px
        "10": "2.5rem",  // 40px
        "12": "3rem",    // 48px
      },

      /* ─── Border Radius ────────────────────────────────────────────────── */
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "10px",
        "2xl": "14px",
        full: "9999px",
      },

      /* ─── Shadows / Elevation ───────────────────────────────────────────── */
      boxShadow: {
        "elev-0": "var(--elev-0)",
        "elev-1": "var(--elev-1)",
        "elev-2": "var(--elev-2)",
        "elev-3": "var(--elev-3)",
        "elev": "var(--elev-1)",
        "glow-live": "var(--glow-live)",
      },

      /* ─── Z-Index ──────────────────────────────────────────────────────── */
      zIndex: {
        map: "0",
        route: "10",
        marker: "20",
        cluster: "25",
        dock: "40",
        toast: "60",
        modal: "80",
        tooltip: "100",
      },

      /* ─── Transition ───────────────────────────────────────────────────── */
      transitionDuration: {
        micro: "120ms",
        normal: "200ms",
        panel: "280ms",
        route: "600ms",
        slow: "900ms",
      },

      transitionTimingFunction: {
        "ease-out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      /* ─── Animation ────────────────────────────────────────────────────── */
      animation: {
        "fade-in": "fade-in 200ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "slide-in": "slide-in 280ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "scale-in": "scale-in 200ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "live-pulse": "live-pulse 2s ease-in-out infinite",
        "skeleton-shimmer": "skeleton-shimmer 1.5s ease-in-out infinite",
      },

      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "live-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "skeleton-shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
    },
  },

  plugins: [],
};

export default config;
