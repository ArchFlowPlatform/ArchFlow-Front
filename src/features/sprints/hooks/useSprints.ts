"use client";

import { useState, useEffect, useCallback } from "react";
import type { Sprint } from "@/types/sprint";
import { getSprints } from "../api/sprints.api";

export interface UseSprintsResult {
  sprints: Sprint[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSprints(projectId: string | null): UseSprintsResult {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState<Error | null>(null);

  const fetchSprints = useCallback(async () => {
    if (!projectId) {
      setSprints([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getSprints(projectId);
      setSprints(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setSprints([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSprints();
  }, [fetchSprints]);

  return { sprints, loading, error, refetch: fetchSprints };
}
