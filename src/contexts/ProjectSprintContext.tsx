"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_LOADING_DURATION_MS,
  startTimedGlobalLoading,
} from "@/hooks/useGlobalLoading";
import { useSprints } from "@/features/sprints/hooks/useSprints";
import type { Sprint } from "@/types/sprint";

interface ProjectSprintContextValue {
  selectedSprintIdByProject: Record<string, string>;
  setSelectedSprintId: (projectId: string, sprintId: string) => void;
}

export interface UseProjectSprintResult {
  sprints: Sprint[];
  selectedSprintId: string | null;
  selectedSprint: Sprint | null;
  setSelectedSprintId: (sprintId: string) => void;
  loading: boolean;
  error: Error | null;
  /** Reload sprint list from API (after create/update/mutations). */
  refetchSprints: () => Promise<void>;
}

const STORAGE_KEY = "archflow:selected-sprint-by-project";

const ProjectSprintContext = createContext<ProjectSprintContextValue | null>(null);

function readStoredSelection(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, string>)
      : {};
  } catch {
    return {};
  }
}

function getDefaultSprintId(sprints: Sprint[]): string | null {
  const active = sprints.find((s) => s.status === "active");
  if (active) return active.id;
  return sprints[0]?.id ?? null;
}

/**
 * Step 5: selection map in **sessionStorage**. Children use `useProjectSprint` → API sprints via `useSprints`.
 */
export function ProjectSprintProvider({ children }: { children: ReactNode }) {
  const [selectedSprintIdByProject, setSelectedSprintIdByProject] = useState<
    Record<string, string>
  >(readStoredSelection);

  useEffect(() => {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(selectedSprintIdByProject),
    );
  }, [selectedSprintIdByProject]);

  const value = useMemo<ProjectSprintContextValue>(
    () => ({
      selectedSprintIdByProject,
      setSelectedSprintId: (projectId, sprintId) => {
        setSelectedSprintIdByProject((current) => {
          if (current[projectId] === sprintId) {
            return current;
          }

          return {
            ...current,
            [projectId]: sprintId,
          };
        });
      },
    }),
    [selectedSprintIdByProject],
  );

  return (
    <ProjectSprintContext.Provider value={value}>
      {children}
    </ProjectSprintContext.Provider>
  );
}

/**
 * Step 5: `useSprints` + persisted selection; invalid stored id → active sprint, else first.
 */
export function useProjectSprint(projectId: string): UseProjectSprintResult {
  const context = useContext(ProjectSprintContext);

  if (!context) {
    throw new Error("useProjectSprint must be used within ProjectSprintProvider.");
  }

  const { sprints, loading, error, refetch: refetchSprints } = useSprints(
    projectId || null,
  );
  const storedSprintId = context.selectedSprintIdByProject[projectId];
  const selectedSprintId = useMemo(() => {
    if (storedSprintId && sprints.some((s) => s.id === storedSprintId)) {
      return storedSprintId;
    }
    return getDefaultSprintId(sprints);
  }, [sprints, storedSprintId]);

  useEffect(() => {
    if (!selectedSprintId) {
      return;
    }

    if (context.selectedSprintIdByProject[projectId] !== selectedSprintId) {
      context.setSelectedSprintId(projectId, selectedSprintId);
    }
  }, [context, projectId, selectedSprintId]);

  const selectedSprint = useMemo(
    () =>
      selectedSprintId
        ? sprints.find((s) => s.id === selectedSprintId) ?? null
        : null,
    [sprints, selectedSprintId],
  );

  return {
    sprints,
    selectedSprintId,
    selectedSprint,
    setSelectedSprintId: (sprintId: string) => {
      if (sprintId === selectedSprintId) {
        return;
      }

      startTimedGlobalLoading("sprint-transition", DEFAULT_LOADING_DURATION_MS);
      context.setSelectedSprintId(projectId, sprintId);
    },
    loading,
    error,
    refetchSprints,
  };
}
