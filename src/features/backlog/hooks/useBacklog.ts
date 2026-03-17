"use client";

import { useState, useEffect, useCallback } from "react";
import type { ProductBacklog } from "@/types/backlog";
import { getBacklog } from "../api/backlog.api";

export interface UseBacklogResult {
  backlog: ProductBacklog | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useBacklog(projectId: string | null): UseBacklogResult {
  const [backlog, setBacklog] = useState<ProductBacklog | null>(null);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState<Error | null>(null);

  const fetchBacklog = useCallback(async () => {
    if (!projectId) {
      setBacklog(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getBacklog(projectId);
      setBacklog(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setBacklog(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchBacklog();
  }, [fetchBacklog]);

  return { backlog, loading, error, refetch: fetchBacklog };
}
