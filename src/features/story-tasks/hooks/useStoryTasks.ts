"use client";

import { useState, useEffect, useCallback } from "react";
import type { StoryTask } from "@/types/sprint";
import { getTasks } from "../api/story-tasks.api";

export interface UseStoryTasksResult {
  tasks: StoryTask[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useStoryTasks(
  projectId: string | null,
  sprintId: string | null,
  sprintItemId: number | null
): UseStoryTasksResult {
  const [tasks, setTasks] = useState<StoryTask[]>([]);
  const [loading, setLoading] = useState(
    Boolean(projectId && sprintId && sprintItemId)
  );
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId || !sprintId || sprintItemId == null) {
      setTasks([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks(projectId, sprintId, sprintItemId);
      setTasks(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, sprintId, sprintItemId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, refetch: fetchTasks };
}
