"use client";

import { useState, useEffect, useCallback } from "react";
import type { CardComment } from "@/types/card";
import { getComments } from "../api/card-comments.api";

/** Step 8: comments for one card. `refetch` after create/update/delete. */
export interface UseCardCommentsResult {
  comments: CardComment[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCardComments(
  projectId: string | null,
  cardId: number | null
): UseCardCommentsResult {
  const [comments, setComments] = useState<CardComment[]>([]);
  const [loading, setLoading] = useState(
    Boolean(projectId && cardId != null)
  );
  const [error, setError] = useState<Error | null>(null);

  const fetchComments = useCallback(async () => {
    if (!projectId || cardId == null) {
      setComments([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getComments(projectId, cardId);
      setComments(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, cardId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, loading, error, refetch: fetchComments };
}
