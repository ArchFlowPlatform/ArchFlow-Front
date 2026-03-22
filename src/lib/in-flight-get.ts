/**
 * Coalesces identical in-flight GET responses so concurrent callers share one
 * network round-trip (e.g. duplicate hooks mounting before the first resolves).
 * Do not use when `AbortSignal` is passed — caller owns cancellation.
 */

const inFlight = new Map<string, Promise<unknown>>();

export function shareInFlightGet<T>(key: string, factory: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T>;
  const p = factory().finally(() => {
    inFlight.delete(key);
  });
  inFlight.set(key, p);
  return p as Promise<T>;
}
