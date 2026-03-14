import type { ClassValue } from "./types";

export function cx(...classNames: ClassValue[]): string {
  return classNames.filter(Boolean).join(" ");
}
