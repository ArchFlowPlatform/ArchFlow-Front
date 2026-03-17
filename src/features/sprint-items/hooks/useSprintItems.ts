"use client";

import { useState, useEffect, useCallback } from "react";
import type { SprintItem } from "@/types/sprint";
import { getSprintItems } from "../api/sprint-items.api";

export interface UseSprintItemsResult {
  items: SprintItem[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSprintItems(
  projectId: string | null,
  sprintId: string | null
): UseSprintItemsResult {
  const [items, setItems] = useState<SprintItem[]>([]);
  const [loading, setLoading] = useState(Boolean(projectId && sprintId));
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    if (!projectId || !sprintId) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getSprintItems(projectId, sprintId);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, sprintId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, refetch: fetchItems };
}
