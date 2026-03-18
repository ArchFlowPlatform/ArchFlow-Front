/**
 * Step 10 — Thin validation helpers that wrap Zod safeParse.
 *
 * When validation fails the **raw** data is returned (passthrough) so the app
 * doesn't crash on unexpected backend shapes. A console warning is emitted in
 * development so issues are surfaced during testing.
 */

import type { z } from "zod";

function warnInDev(label: string, issues: z.ZodIssue[]): void {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[api-validation] ${label}: response failed Zod validation`,
      issues
    );
  }
}

/**
 * Validate an array response. Returns parsed data on success, raw data on failure.
 * `T` is the domain type the caller expects — the schema validates shape, not TS type.
 */
export function safeParseArray<T>(
  schema: z.ZodTypeAny,
  data: unknown[],
  label: string
): T[] {
  const arraySchema = schema.array();
  const result = arraySchema.safeParse(data);
  if (result.success) return result.data as T[];
  warnInDev(label, result.error.issues);
  return data as T[];
}

/**
 * Validate a single-object response. Returns parsed data on success, raw data on failure.
 * `T` is the domain type the caller expects — the schema validates shape, not TS type.
 */
export function safeParseObject<T>(
  schema: z.ZodTypeAny,
  data: unknown,
  label: string
): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data as T;
  warnInDev(label, result.error.issues);
  return data as T;
}
