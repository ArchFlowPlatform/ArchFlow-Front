import type { ClassValue } from "clsx";
import { clsx } from "clsx";

/**
 * Simple class name concatenation. Filters falsy values.
 * For Tailwind class merging, use cn() instead.
 */
export function cx(...classNames: ClassValue[]): string {
  return clsx(...classNames);
}
