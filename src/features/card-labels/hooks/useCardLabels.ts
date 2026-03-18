"use client";

import { useState, useEffect, useCallback } from "react";
import type { CardLabel, Label } from "@/types/card";
import { getCardLabels } from "../api/card-labels.api";

export type CardLabelWithLabel = CardLabel & { label?: Label };

/** Step 8: labels attached to one card. `refetch` after add/remove. */
export interface UseCardLabelsResult {
  cardLabels: CardLabelWithLabel[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCardLabels(
  projectId: string | null,
  cardId: number | null
): UseCardLabelsResult {
  const [cardLabels, setCardLabels] = useState<CardLabelWithLabel[]>([]);
  const [loading, setLoading] = useState(
    Boolean(projectId && cardId != null)
  );
  const [error, setError] = useState<Error | null>(null);

  const fetchCardLabels = useCallback(async () => {
    if (!projectId || cardId == null) {
      setCardLabels([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getCardLabels(projectId, cardId);
      setCardLabels(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setCardLabels([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, cardId]);

  useEffect(() => {
    fetchCardLabels();
  }, [fetchCardLabels]);

  return {
    cardLabels,
    loading,
    error,
    refetch: fetchCardLabels,
  };
}
