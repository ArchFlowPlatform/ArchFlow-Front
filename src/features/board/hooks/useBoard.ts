"use client";

import { useState, useEffect, useCallback } from "react";
import type { Board } from "@/types/board";
import { getBoard } from "../api/board.api";

export interface UseBoardResult {
  board: Board | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useBoard(
  projectId: string | null,
  sprintId: string | null
): UseBoardResult {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(Boolean(projectId && sprintId));
  const [error, setError] = useState<Error | null>(null);

  const fetchBoard = useCallback(async () => {
    if (!projectId || !sprintId) {
      setBoard(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getBoard(projectId, sprintId);
      setBoard(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setBoard(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, sprintId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  return { board, loading, error, refetch: fetchBoard };
}
