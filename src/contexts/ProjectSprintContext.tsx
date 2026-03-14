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
  getDefaultSprintForProject,
  getSprintsForProject,
  getSprintRowById,
} from "../mocks/backend/selectors";
import {
  DEFAULT_LOADING_DURATION_MS,
  startTimedGlobalLoading,
} from "../hooks/useGlobalLoading";
import type { SprintRow } from "../mocks/backend/schema";

interface ProjectSprintContextValue {
  selectedSprintIdByProject: Record<string, string>;
  setSelectedSprintId: (projectId: string, sprintId: string) => void;
}

interface UseProjectSprintResult {
  sprints: SprintRow[];
  selectedSprintId: string | null;
  selectedSprint: SprintRow | null;
  setSelectedSprintId: (sprintId: string) => void;
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

export function useProjectSprint(projectId: string): UseProjectSprintResult {
  const context = useContext(ProjectSprintContext);

  if (!context) {
    throw new Error("useProjectSprint must be used within ProjectSprintProvider.");
  }

  const sprints = useMemo(() => getSprintsForProject(projectId), [projectId]);
  const storedSprintId = context.selectedSprintIdByProject[projectId];
  const selectedSprintId =
    storedSprintId && sprints.some((sprint) => sprint.id === storedSprintId)
      ? storedSprintId
      : (getDefaultSprintForProject(projectId)?.id ?? null);

  useEffect(() => {
    if (!selectedSprintId) {
      return;
    }

    if (context.selectedSprintIdByProject[projectId] !== selectedSprintId) {
      context.setSelectedSprintId(projectId, selectedSprintId);
    }
  }, [
    context,
    projectId,
    selectedSprintId,
  ]);

  const selectedSprint = selectedSprintId ? getSprintRowById(selectedSprintId) : null;

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
  };
}
