"use client";

import { useState, useEffect, useCallback } from "react";
import type { CardActivity } from "@/types/card";
import { getActivities } from "../api/card-activities.api";

/** Step 8: activity log for one card (read-only + create). */
export interface UseCardActivitiesResult {
  activities: CardActivity[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCardActivities(
  projectId: string | null,
  cardId: number | null
): UseCardActivitiesResult {
  const [activities, setActivities] = useState<CardActivity[]>([]);
  const [loading, setLoading] = useState(
    Boolean(projectId && cardId != null)
  );
  const [error, setError] = useState<Error | null>(null);

  const fetchActivities = useCallback(async () => {
    if (!projectId || cardId == null) {
      setActivities([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getActivities(projectId, cardId);
      setActivities(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, cardId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, loading, error, refetch: fetchActivities };
}
