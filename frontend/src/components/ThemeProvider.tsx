"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type Theme = "light" | "dark";
type Density = "compact" | "comfortable";
type Accent = "yellow" | "orange" | "steel";

const THEMES: readonly Theme[] = ["light", "dark"];
const DENSITIES: readonly Density[] = ["compact", "comfortable"];
const ACCENTS: readonly Accent[] = ["yellow", "orange", "steel"];

function isStoredValue<T extends string>(
  value: string | null,
  allowed: readonly T[]
): value is T {
  return value !== null && allowed.includes(value as T);
}

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  density: Density;
  setDensity: (density: Density) => void;
  accent: Accent;
  setAccent: (accent: Accent) => void;
  reducedMotion: boolean;
}

interface ThemeProviderProps {
  children: ReactNode;
}

/* ─── Context ──────────────────────────────────────────────────────────────── */

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

/* ─── Provider ─────────────────────────────────────────────────────────────── */

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [density, setDensityState] = useState<Density>("comfortable");
  const [accent, setAccentState] = useState<Accent>("yellow");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage + system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("vanguard:theme");
    const savedDensity = localStorage.getItem("vanguard:density");
    const savedAccent = localStorage.getItem("vanguard:accent");

    // Dark-first baseline (v2 default)
    setThemeState(isStoredValue(savedTheme, THEMES) ? savedTheme : "dark");
    setDensityState(isStoredValue(savedDensity, DENSITIES) ? savedDensity : "comfortable");
    setAccentState(isStoredValue(savedAccent, ACCENTS) ? savedAccent : "yellow");

    // Check reduced motion preference
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    motionQuery.addEventListener("change", handleMotionChange);
    setMounted(true);

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  // Apply theme to DOM via data-theme attribute
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("vanguard:theme", theme);
  }, [theme, mounted]);

  // Apply density to DOM via data-density attribute
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.setAttribute("data-density", density);
    localStorage.setItem("vanguard:density", density);
  }, [density, mounted]);

  // Apply accent to DOM via data-accent attribute
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    if (accent === "yellow") {
      root.removeAttribute("data-accent");
    } else {
      root.setAttribute("data-accent", accent);
    }
    localStorage.setItem("vanguard:accent", accent);
  }, [accent, mounted]);

  // Setters
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const setDensity = useCallback((newDensity: Density) => {
    setDensityState(newDensity);
  }, []);

  const setAccent = useCallback((newAccent: Accent) => {
    setAccentState(newAccent);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme,
      density,
      setDensity,
      accent,
      setAccent,
      reducedMotion,
    }),
    [theme, toggleTheme, setTheme, density, setDensity, accent, setAccent, reducedMotion]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/* ─── Utility: Density Row Heights ─────────────────────────────────────────── */

export const DENSITY = {
  compact: {
    rowHeight: "2rem",
    padding: "0.5rem 0.75rem",
    fontSize: "0.8125rem",
  },
  comfortable: {
    rowHeight: "2.75rem",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
  },
} as const;

export function useDensityStyles() {
  const { density } = useTheme();
  return DENSITY[density];
}
