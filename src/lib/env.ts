/**
 * Runtime environment helpers.
 * `NEXT_PUBLIC_*` values are inlined by Next.js at build time.
 */

export const USE_MOCKS =
  process.env.NEXT_PUBLIC_USE_MOCKS === "true";
