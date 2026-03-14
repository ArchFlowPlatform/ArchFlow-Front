import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines clsx and tailwind-merge for conditional Tailwind classes.
 * Use for component className props with proper merge behavior.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
