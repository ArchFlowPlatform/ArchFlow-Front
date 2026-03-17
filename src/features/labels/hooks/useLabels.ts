"use client";

import { useState, useEffect, useCallback } from "react";
import type { Label } from "@/types/card";
import { getLabels } from "../api/labels.api";

export interface UseLabelsResult {
  labels: Label[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useLabels(projectId: string | null): UseLabelsResult {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState<Error | null>(null);

  const fetchLabels = useCallback(async () => {
    if (!projectId) {
      setLabels([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getLabels(projectId);
      setLabels(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setLabels([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  return { labels, loading, error, refetch: fetchLabels };
}
