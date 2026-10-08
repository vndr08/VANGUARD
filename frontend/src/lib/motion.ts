/**
 * VANGUARD Motion Utility
 *
 * Respects prefers-reduced-motion system preference.
 * All animations gracefully degrade to instant transitions or opacity-only fades.
 *
 * Source: DESIGN.md §6 Motion System
 */

import { useTheme } from "@/components/ThemeProvider";
import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Token Constants ────────────────────────────────────────────────────────── */

// Durations (ms)
export const DURATION = {
  micro: 120,
  normal: 180,
  panel: 180,
  route: 320,
  slow: 400,
} as const;

// Easing curves
export const EASE = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  outQuint: "cubic-bezier(0.2, 0, 0, 1)",
  spring: "cubic-bezier(0.2, 0, 0, 1)",
  linear: "linear",
} as const;

/* ─── Reduced Motion Hook ───────────────────────────────────────────────────── */

/**
 * Returns true if user prefers reduced motion
 * Falls back to instant/no-animation behavior
 */
export function useReducedMotion(): boolean {
  const { reducedMotion } = useTheme();
  return reducedMotion;
}

/* ─── Animation CSS Properties ──────────────────────────────────────────────── */

/**
 * Get CSS transition string with reduced-motion fallback
 */
export function transition(
  properties: string[],
  duration: keyof typeof DURATION = "normal",
  easing: keyof typeof EASE = "outQuint"
): string {
  const d = DURATION[duration];
  const e = EASE[easing];

  return properties
    .map((prop) => `${prop} ${d}ms ${e}`)
    .join(", ");
}

/**
 * Get animation CSS property string with reduced-motion fallback
 */
export function animation(
  name: string,
  duration: keyof typeof DURATION = "normal",
  easing: keyof typeof EASE = "outQuint",
  delay: number = 0,
  fillMode: "both" | "forwards" | "none" = "both"
): string {
  const d = DURATION[duration];
  const e = EASE[easing];

  return `${name} ${d}ms ${e} ${delay}ms ${fillMode}`;
}

/* ─── Reduced Motion Fallback Classes ───────────────────────────────────────── */

/**
 * CSS class that disables transform/opacity animations
 * Applied via: <Element className={noMotion} />
 */
export const noMotion = "will-change-auto [&_*]:transition-none [&_*]:animation-none";

/**
 * Get appropriate transition class based on motion preference
 */
export function motionTransition(
  properties: string[],
  duration: keyof typeof DURATION = "normal",
  easing: keyof typeof EASE = "outQuint"
): string {
  return transition(properties, duration, easing);
}

/* ─── Pre-built Animation Keyframes ─────────────────────────────────────────── */

/**
 * Fade in from opacity 0
 */
export const fadeIn = {
  from: { opacity: 0 },
  to: { opacity: 1 },
};

/**
 * Slide in from right (panel enter)
 */
export const slideInRight = {
  from: { opacity: 0, transform: "translateX(24px)" },
  to: { opacity: 1, transform: "translateX(0)" },
};

/**
 * Slide in from bottom (toast enter)
 */
export const slideInUp = {
  from: { opacity: 0, transform: "translateY(16px)" },
  to: { opacity: 1, transform: "translateY(0)" },
};

/**
 * Scale in (modal/dropdown enter)
 */
export const scaleIn = {
  from: { opacity: 0, transform: "scale(0.95)" },
  to: { opacity: 1, transform: "scale(1)" },
};

/**
 * Live pulse (driving status glow)
 */
export const livePulse = {
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.5 },
};

/* ─── useAnimatedNumber Hook ───────────────────────────────────────────────── */

/**
 * Animated number counter using requestAnimationFrame
 * Respects prefers-reduced-motion (instant jump if reduced)
 *
 * @param target - Target number to animate to
 * @param duration - Animation duration in ms (default: 400ms)
 * @returns current animated value
 */
export function useAnimatedNumber(target: number, duration: number = DURATION.slow): number {
  const { reducedMotion } = useTheme();
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(target);

  useEffect(() => {
    // If reduced motion, jump directly to target
    if (reducedMotion) {
      valueRef.current = target;
      setValue(target);
      return;
    }

    fromRef.current = valueRef.current;
    startRef.current = null;

    const animate = (timestamp: number) => {
      if (startRef.current === null) {
        startRef.current = timestamp;
      }

      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      const current = Math.round(fromRef.current + (target - fromRef.current) * eased);

      valueRef.current = current;
      setValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration, reducedMotion]);

  return value;
}

/* ─── Marker Interpolation (Map) ─────────────────────────────────────────────── */

/**
 * Lerp between two positions for smooth marker movement
 * Used for GPS position updates
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Interpolate heading angle (handles wrap-around at 360°)
 */
export function lerpAngle(start: number, end: number, t: number): number {
  const diff = ((end - start + 540) % 360) - 180;
  return (start + diff * t + 360) % 360;
}

/* ─── Compatibility Utilities ──────────────────────────────────────────────── */

/**
 * Legacy list delay helper. New page and card stagger should not use this.
 * @param index - Item index in list
 * @param baseDelay - Base delay in ms
 * @param staggerMs - Additional delay per item in ms
 */
export function getStaggerDelay(
  index: number,
  baseDelay: number = 0,
  staggerMs: number = 0
): number {
  return baseDelay + index * staggerMs;
}

/**
 * Generate stagger animation delays for a list
 */
export function staggerDelays(
  count: number,
  baseDelay: number = 0,
  staggerMs: number = 0
): number[] {
  return Array.from({ length: count }, (_, i) =>
    getStaggerDelay(i, baseDelay, staggerMs)
  );
}

/* ─── useEnterAnimation ────────────────────────────────────────────────────── */

/**
 * Compatibility hook. Foundation intentionally avoids automatic page entry motion.
 */
export function useEnterAnimation(options: {
  delay?: number;
  stagger?: number;
  reducedMotion?: boolean;
} = {}): { style: React.CSSProperties; className: string } {
  return {
    style: {},
    className: "",
  };
}
