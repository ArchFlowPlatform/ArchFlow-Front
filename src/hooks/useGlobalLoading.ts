import { useEffect, useRef, useState } from "react";

interface GlobalLoadingEventDetail {
  requestId: string;
  source?: string;
}

const GLOBAL_LOADING_START_EVENT = "archflow:global-loading-start";
const GLOBAL_LOADING_STOP_EVENT = "archflow:global-loading-stop";

const SHOW_DELAY_MS = 0;
const MIN_VISIBLE_MS = 280;
export const DEFAULT_LOADING_DURATION_MS = 520;

function createRequestId(source: string): string {
  return `${source}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function dispatchGlobalLoadingEvent(
  eventName: string,
  detail: GlobalLoadingEventDetail,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent<GlobalLoadingEventDetail>(eventName, { detail }));
}

export function beginGlobalLoading(source = "global"): string {
  const requestId = createRequestId(source);
  dispatchGlobalLoadingEvent(GLOBAL_LOADING_START_EVENT, { requestId, source });
  return requestId;
}

export function endGlobalLoading(requestId: string, source = "global"): void {
  dispatchGlobalLoadingEvent(GLOBAL_LOADING_STOP_EVENT, { requestId, source });
}

export function startTimedGlobalLoading(
  source = "global",
  durationMs = DEFAULT_LOADING_DURATION_MS,
): string {
  const requestId = beginGlobalLoading(source);

  window.setTimeout(() => {
    endGlobalLoading(requestId, source);
  }, durationMs);

  return requestId;
}

export function useGlobalLoadingVisibility(): boolean {
  const [activeRequestIds, setActiveRequestIds] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const visibleSinceRef = useRef<number | null>(null);

  useEffect(() => {
    function handleStart(event: Event) {
      const detail = (event as CustomEvent<GlobalLoadingEventDetail>).detail;
      if (!detail?.requestId) {
        return;
      }

      setActiveRequestIds((current) => {
        const next = new Set(current);
        next.add(detail.requestId);
        return next;
      });
    }

    function handleStop(event: Event) {
      const detail = (event as CustomEvent<GlobalLoadingEventDetail>).detail;
      if (!detail?.requestId) {
        return;
      }

      setActiveRequestIds((current) => {
        if (!current.has(detail.requestId)) {
          return current;
        }

        const next = new Set(current);
        next.delete(detail.requestId);
        return next;
      });
    }

    window.addEventListener(GLOBAL_LOADING_START_EVENT, handleStart as EventListener);
    window.addEventListener(GLOBAL_LOADING_STOP_EVENT, handleStop as EventListener);

    return () => {
      window.removeEventListener(
        GLOBAL_LOADING_START_EVENT,
        handleStart as EventListener,
      );
      window.removeEventListener(
        GLOBAL_LOADING_STOP_EVENT,
        handleStop as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    const activeCount = activeRequestIds.size;

    if (activeCount > 0) {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      if (!isVisible && showTimerRef.current === null) {
        showTimerRef.current = window.setTimeout(() => {
          showTimerRef.current = null;
          visibleSinceRef.current = Date.now();
          setIsVisible(true);
        }, SHOW_DELAY_MS);
      }

      return;
    }

    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    if (!isVisible) {
      return;
    }

    const elapsed = visibleSinceRef.current
      ? Date.now() - visibleSinceRef.current
      : MIN_VISIBLE_MS;
    const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);

    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = null;
      visibleSinceRef.current = null;
      setIsVisible(false);
    }, remaining);
  }, [activeRequestIds, isVisible]);

  useEffect(() => {
    return () => {
      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current);
      }

      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  return isVisible;
}
