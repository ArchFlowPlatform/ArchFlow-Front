"use client";

import { useState, useEffect, useCallback } from "react";
import type { CardAttachment } from "@/types/card";
import { getAttachments } from "../api/card-attachments.api";

/** Step 8: attachments for one card. `refetch` after create/delete. */
export interface UseCardAttachmentsResult {
  attachments: CardAttachment[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCardAttachments(
  projectId: string | null,
  cardId: number | null
): UseCardAttachmentsResult {
  const [attachments, setAttachments] = useState<CardAttachment[]>([]);
  const [loading, setLoading] = useState(
    Boolean(projectId && cardId != null)
  );
  const [error, setError] = useState<Error | null>(null);

  const fetchAttachments = useCallback(async () => {
    if (!projectId || cardId == null) {
      setAttachments([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getAttachments(projectId, cardId);
      setAttachments(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, cardId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  return { attachments, loading, error, refetch: fetchAttachments };
}
