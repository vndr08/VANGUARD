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

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  density: Density;
  setDensity: (density: Density) => void;
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
  const [theme, setThemeState] = useState<Theme>("light");
  const [density, setDensityState] = useState<Density>("compact");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage + system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("vanguard-theme") as Theme | null;
    const savedDensity = localStorage.getItem("vanguard-density") as Density | null;

    // Check system preference
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    // Theme: saved > system
    const initialTheme = savedTheme ?? (systemPrefersDark ? "dark" : "light");
    setThemeState(initialTheme);

    // Density: saved > default (compact for cockpit)
    setDensityState(savedDensity ?? "compact");

    // Check reduced motion preference
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);

    // Listen for changes
    const handleThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("vanguard-theme")) {
        setThemeState(e.matches ? "dark" : "light");
      }
    };

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    const themeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    themeQuery.addEventListener("change", handleThemeChange);
    motionQuery.addEventListener("change", handleMotionChange);

    setMounted(true);

    return () => {
      themeQuery.removeEventListener("change", handleThemeChange);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  // Apply theme to DOM
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("vanguard-theme", theme);
  }, [theme, mounted]);

  // Apply density to DOM
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.remove("density-compact", "density-normal");
    root.classList.add(`density-${density}`);
    localStorage.setItem("vanguard-density", density);
  }, [density, mounted]);

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

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme,
      density,
      setDensity,
      reducedMotion,
    }),
    [theme, toggleTheme, setTheme, density, setDensity, reducedMotion]
  );

  // Avoid flash of wrong theme — show nothing until mounted
  if (!mounted) {
    return (
      <div
        className="bg-background"
        style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}
      />
    );
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/* ─── Hooks ─────────────────────────────────────────────────────────────────── */

/**
 * Hook to get current theme-aware class
 * @example const cls = useThemeClass({ dark: "bg-gray-900", light: "bg-white" })
 */
export function useThemeClass(
  classes: Record<Theme | "mounted", string>
): string {
  const { theme, mounted } = useTheme2();
  if (!mounted) return classes.mounted;
  return classes[theme];
}

// Internal hook to avoid circular export issues
function useTheme2() {
  const context = useContext(ThemeContext);
  return {
    theme: context?.theme ?? "light",
    density: context?.density ?? "compact",
    reducedMotion: context?.reducedMotion ?? false,
    mounted: true,
  };
}

/* ─── Utility: Density Row Heights ─────────────────────────────────────────── */

export const DENSITY = {
  compact: {
    rowHeight: "2rem",    // 32px
    padding: "0.5rem 0.75rem",
    fontSize: "0.8125rem",
  },
  comfortable: {
    rowHeight: "2.75rem", // 44px
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
  },
} as const;

/**
 * Get density CSS variables for inline styles
 */
export function useDensityStyles() {
  const { density } = useTheme();
  return DENSITY[density];
}
