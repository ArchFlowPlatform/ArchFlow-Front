"use client";

import { useMemo } from "react";
import type { Epic } from "@/types/backlog";
import { useBacklog } from "./useBacklog";

export interface UseEpicsResult {
  epics: Epic[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Returns epics for a project. Data comes from useBacklog(projectId).
 */
export function useEpics(projectId: string | null): UseEpicsResult {
  const { backlog, loading, error, refetch } = useBacklog(projectId);
  const epics = useMemo(
    () => backlog?.epics ?? [],
    [backlog?.epics]
  );
  return { epics, loading, error, refetch };
}
