import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
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
        signal: {
          50: "#fff4ef",
          100: "#ffe5d8",
          200: "#ffc6ad",
          300: "#ff9b73",
          400: "#fb7040",
          500: "#e84d1f",
          600: "#c73916",
          700: "#982b15",
          800: "#7a2718",
          900: "#42130b",
        },
        navy: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#829ab1",
          500: "#627d98",
          600: "#486581",
          700: "#334e68",
          800: "#243b53",
          900: "#102a43",
          950: "#0a1929",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
