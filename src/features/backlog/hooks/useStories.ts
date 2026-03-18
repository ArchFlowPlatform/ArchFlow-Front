"use client";

import { useMemo } from "react";
import type { UserStory } from "@/types/backlog";
import { useBacklog } from "./useBacklog";

export interface UseStoriesResult {
  stories: UserStory[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Step 4: stories from backlog; `epicId` filters to one epic. Shares fetch with `useBacklog`.
 */
export function useStories(
  projectId: string | null,
  epicId: number | null = null
): UseStoriesResult {
  const { backlog, loading, error, refetch } = useBacklog(projectId);
  const stories = useMemo(() => {
    const list = backlog?.epics ?? [];
    if (epicId == null) {
      return list.flatMap((epic) => epic.userStories ?? []);
    }
    const epic = list.find((e) => e.id === epicId);
    return epic?.userStories ?? [];
  }, [backlog?.epics, epicId]);
  return { stories, loading, error, refetch };
}
