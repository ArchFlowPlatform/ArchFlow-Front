"use client";

import { useState, useEffect, useCallback } from "react";
import type { ProjectWithDetails } from "@/types/project";
import { getProjects, getMembers } from "../api/projects.api";

export interface UseProjectsResult {
  projects: ProjectWithDetails[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Step 3: `getProjects()` + per-project `getMembers()` → `ProjectWithDetails[]`.
 * Caching via in-hook state + `refetch` (no extra deps).
 */
async function enrichProjectsWithDetails(
  projects: Awaited<ReturnType<typeof getProjects>>
): Promise<ProjectWithDetails[]> {
  const enriched = await Promise.all(
    projects.map(async (project) => {
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
    })
  );
  return enriched;
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getProjects();
      const enriched = await enrichProjectsWithDetails(list);
      setProjects(enriched);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, refetch: fetchProjects };
}
