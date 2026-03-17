"use client";

import { useState, useEffect, useCallback } from "react";
import type { BoardCard } from "@/types/board";
import { getCards } from "../api/board-cards.api";

export interface UseBoardCardsResult {
  cards: BoardCard[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useBoardCards(
  projectId: string | null,
  sprintId: string | null,
  columnId: number | null
): UseBoardCardsResult {
  const [cards, setCards] = useState<BoardCard[]>([]);
  const [loading, setLoading] = useState(
    Boolean(projectId && sprintId && columnId != null)
  );
  const [error, setError] = useState<Error | null>(null);

  const fetchCards = useCallback(async () => {
    if (!projectId || !sprintId || columnId == null) {
      setCards([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getCards(projectId, sprintId, columnId);
      setCards(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, sprintId, columnId]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return { cards, loading, error, refetch: fetchCards };
}
