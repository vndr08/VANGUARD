/**
 * Shared utility functions for VANGUARD UI
 */

/**
 * Simple className combiner - no external dependency
 * Joins truthy values and filters falsy
 */
export function cx(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}
