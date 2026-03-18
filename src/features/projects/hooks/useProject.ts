"use client";

import { useState, useEffect, useCallback } from "react";
import type { ProjectWithDetails } from "@/types/project";
import { getProjectById, getMembers } from "../api/projects.api";

/** Step 3: `getProjectById` + `getMembers` for project-scoped pages / shell. */
export interface UseProjectResult {
  project: ProjectWithDetails | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

async function enrichProjectWithDetails(
  project: Awaited<ReturnType<typeof getProjectById>>
): Promise<ProjectWithDetails> {
  let members: Awaited<ReturnType<typeof getMembers>> = [];
  try {
    members = await getMembers(project.id);
  } catch {
    // leave members empty if fetch fails
  }
  const ownerMember = members.find((m) => m.role === "owner");
  return {
    ...project,
    members,
  } as ProjectWithDetails;
}

export function useProject(projectId: string | null): UseProjectResult {
  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState<Error | null>(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) {
      setProject(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getProjectById(projectId);
      const enriched = await enrichProjectWithDetails(data);
      setProject(enriched);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return { project, loading, error, refetch: fetchProject };
}
