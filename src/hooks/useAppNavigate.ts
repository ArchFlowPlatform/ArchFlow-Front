"use client";

import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";

import {
  DEFAULT_LOADING_DURATION_MS,
  startTimedGlobalLoading,
} from "./useGlobalLoading";

export function shouldHandleNavigationClick(
  event: MouseEvent<HTMLElement>,
): boolean {
  return !(
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

interface NavigateToPathOptions {
  withLoading?: boolean;
  loadingDurationMs?: number;
}

export function useAppNavigate() {
  const router = useRouter();

  const navigate = (pathname: string, options: NavigateToPathOptions = {}) => {
    const { withLoading = true, loadingDurationMs = DEFAULT_LOADING_DURATION_MS } = options;

    if (withLoading) {
      startTimedGlobalLoading("navigation", loadingDurationMs);
    }

    router.push(pathname);
  };

  return { navigate };
}
