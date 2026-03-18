"use client";

import { useState, useEffect, useCallback } from "react";
import type { BoardColumn } from "@/types/board";
import { getColumns } from "../api/board-columns.api";

export interface UseBoardColumnsResult {
  columns: BoardColumn[];
  loading: boolean;
  error: Error | null;
  /** Refetch columns; returns latest column list (for chaining card refetch). */
  refetch: () => Promise<BoardColumn[]>;
}

export function useBoardColumns(
  projectId: string | null,
  sprintId: string | null
): UseBoardColumnsResult {
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [loading, setLoading] = useState(Boolean(projectId && sprintId));
  const [error, setError] = useState<Error | null>(null);

  const fetchColumns = useCallback(async (): Promise<BoardColumn[]> => {
    if (!projectId || !sprintId) {
      setColumns([]);
      setLoading(false);
      setError(null);
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getColumns(projectId, sprintId);
      setColumns(data);
      return data;
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setColumns([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [projectId, sprintId]);

  useEffect(() => {
    fetchColumns();
  }, [fetchColumns]);

  return { columns, loading, error, refetch: fetchColumns };
}
