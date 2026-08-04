import type { Config } from "tailwindcss";

/*
 * VANGUARD Design System — Tailwind Extension
 * Source: docs/VISUAL-DIRECTION.md
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
        // Canonical surfaces
        canvas: "var(--canvas)",
        bg: "var(--bg)",
        background: "var(--bg)",
        surface: {
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
        },

        // Canonical borders
        border: {
          DEFAULT: "var(--border)",
          subtle: "var(--border-subtle)",
          default: "var(--border-default)",
          strong: "var(--border-strong)",
        },

        // Canonical text
        foreground: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        faint: "var(--text-faint)",
        disabled: "var(--text-disabled)",

        // Brand
        brand: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
          soft: "var(--brand-soft)",
          50: "var(--brand-50)",
          100: "var(--brand-100)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
        },

        // Canonical semantic colors
        healthy: {
          DEFAULT: "var(--healthy)",
          soft: "var(--healthy-soft)",
        },
        information: {
          DEFAULT: "var(--information)",
          soft: "var(--information-soft)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          soft: "var(--warning-soft)",
        },
        critical: {
          DEFAULT: "var(--critical)",
          soft: "var(--critical-soft)",
        },
        offline: {
          DEFAULT: "var(--offline)",
          soft: "var(--offline-soft)",
        },
        unknown: {
          DEFAULT: "var(--unknown)",
          soft: "var(--unknown-soft)",
        },

        // Legacy semantic aliases
        signal: {
          DEFAULT: "var(--signal)",
          soft: "var(--signal-soft)",
        },
        hud: {
          DEFAULT: "var(--hud)",
          soft: "var(--hud-soft)",
        },

        // Vehicle status compatibility
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

        // Task status compatibility
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
        // Canonical type scale
        "display-sm": [
          "var(--text-display-sm)",
          { lineHeight: "var(--leading-display-sm)", fontWeight: "600" },
        ],
        "heading-md": [
          "var(--text-heading-md)",
          { lineHeight: "var(--leading-heading-md)", fontWeight: "600" },
        ],
        "heading-sm": [
          "var(--text-heading-sm)",
          { lineHeight: "var(--leading-heading-sm)", fontWeight: "600" },
        ],
        "body-md": [
          "var(--text-body-md)",
          { lineHeight: "var(--leading-body-md)", fontWeight: "400" },
        ],
        "body-strong": [
          "var(--text-body-strong)",
          { lineHeight: "var(--leading-body-md)", fontWeight: "600" },
        ],
        "label-md": [
          "var(--text-label-md)",
          { lineHeight: "var(--leading-label-md)", fontWeight: "500" },
        ],
        "metadata-sm": [
          "var(--text-metadata-sm)",
          { lineHeight: "var(--leading-metadata-sm)", fontWeight: "400" },
        ],
        "metric-lg": [
          "var(--text-metric-lg)",
          { lineHeight: "var(--leading-metric-lg)", fontWeight: "600" },
        ],

        // Compatibility aliases
        display: [
          "var(--text-display)",
          { lineHeight: "var(--leading-display-sm)", fontWeight: "600" },
        ],
        h1: [
          "var(--text-h1)",
          { lineHeight: "var(--leading-heading-md)", fontWeight: "600" },
        ],
        h2: [
          "var(--text-h2)",
          { lineHeight: "var(--leading-heading-sm)", fontWeight: "600" },
        ],
        body: [
          "var(--text-body)",
          { lineHeight: "var(--leading-body-md)" },
        ],
        sm: [
          "var(--text-sm)",
          { lineHeight: "var(--leading-body-md)" },
        ],
        label: [
          "var(--text-label)",
          { lineHeight: "var(--leading-label-md)", fontWeight: "500" },
        ],
        mono: [
          "var(--text-mono-kpi)",
          { lineHeight: "var(--leading-metric-lg)", fontWeight: "600" },
        ],
      },

      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
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
        "1": "var(--space-1)",
        "2": "var(--space-2)",
        "3": "var(--space-3)",
        "4": "var(--space-4)",
        "5": "var(--space-5)",
        "6": "var(--space-6)",
        "8": "var(--space-8)",
        "10": "var(--space-10)",
        "12": "var(--space-12)",
      },

      /* ─── Border Radius ────────────────────────────────────────────────── */
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
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
        map: "var(--z-map)",
        route: "var(--z-route)",
        marker: "var(--z-marker)",
        cluster: "var(--z-cluster)",
        dock: "var(--z-dock)",
        toast: "var(--z-toast)",
        modal: "var(--z-modal)",
        tooltip: "var(--z-tooltip)",
      },

      /* ─── Transition ───────────────────────────────────────────────────── */
      transitionDuration: {
        micro: "var(--duration-micro)",
        normal: "var(--duration-normal)",
        panel: "var(--duration-panel)",
        modal: "var(--duration-modal)",
        route: "var(--duration-route)",
        slow: "var(--duration-slow)",
      },

      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        "ease-out-quint": "var(--ease-out-quint)",
        spring: "var(--ease-spring)",
      },

      /* ─── Animation ────────────────────────────────────────────────────── */
      animation: {
        "fade-in": "fade-in 200ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "slide-in": "slide-in 280ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "scale-in": "scale-in 200ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "live-pulse": "none",
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
