"use client";

import { useCallback, useEffect, useState } from "react";
import type { Sprint } from "@/types/sprint";
import type { User } from "@/types/user";
import { getTasks } from "@/features/story-tasks/api/story-tasks.api";
import { useSprintItems } from "@/features/sprint-items/hooks/useSprintItems";
import { useProject } from "@/features/projects/hooks/useProject";
import type { SprintTaskView, BurndownPoint } from "../mocks/sprint.mock";

type PriorityLabel = "P1" | "P2" | "P3";

function priorityNumberToLabel(priority: number): PriorityLabel {
  if (priority <= 1) return "P1";
  if (priority === 2) return "P2";
  return "P3";
}

function resolveUser(
  assigneeId: string | null,
  members: { user?: User }[],
  fallbackName: string
): User {
  if (!assigneeId?.trim()) {
    return {
      id: "",
      name: fallbackName,
      email: "",
      type: "",
      avatarUrl: "",
      createdAt: "",
      updatedAt: "",
    } as User;
  }
  const member = members.find((m) => m.user?.id === assigneeId);
  if (member?.user) return member.user;
  return {
    id: assigneeId,
    name: "—",
    email: "",
    type: "",
    avatarUrl: "",
    createdAt: "",
    updatedAt: "",
  } as User;
}

function eachDayInclusive(startISO: string, endISO: string): Date[] {
  const dates: Date[] = [];
  const start = new Date(startISO);
  const end = new Date(endISO);
  const cursor = new Date(start);
  cursor.setUTCHours(0, 0, 0, 0);
  while (cursor <= end) {
    dates.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export interface UseSprintViewModelResult {
  taskViews: SprintTaskView[];
  scopeHours: number;
  burnedHours: number;
  remainingHours: number;
  burndownPoints: BurndownPoint[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Builds SprintViewModel (task views, hours, burndown) from API data.
 * Uses useSprintItems, getTasks, and useProject for member resolution.
 */
export function useSprintViewModel(
  projectId: string | null,
  sprintId: string | null,
  sprint: Sprint | null
): UseSprintViewModelResult {
  const { items, loading: itemsLoading, error: itemsError, refetch: refetchItems } =
    useSprintItems(projectId, sprintId);
  const { project } = useProject(projectId);
  const [tasksByItemId, setTasksByItemId] = useState<
    Record<number, Awaited<ReturnType<typeof getTasks>>>
  >({});
  const [tasksLoading, setTasksLoading] = useState(false);

  const members = project?.members ?? [];

  const fetchTasksForItems = useCallback(
    async (itemIds: number[]) => {
      if (!projectId || !sprintId || itemIds.length === 0) {
        setTasksByItemId({});
        return;
      }
      setTasksLoading(true);
      try {
        const results = await Promise.all(
          itemIds.map((itemId) =>
            getTasks(projectId, sprintId, itemId).then((tasks) => ({
              itemId,
              tasks,
            }))
          )
        );
        const map: Record<number, Awaited<ReturnType<typeof getTasks>>> = {};
        for (const { itemId, tasks } of results) {
          map[itemId] = tasks;
        }
        setTasksByItemId(map);
      } catch {
        setTasksByItemId({});
      } finally {
        setTasksLoading(false);
      }
    },
    [projectId, sprintId]
  );

  useEffect(() => {
    if (items.length > 0) {
      fetchTasksForItems(items.map((i) => i.id));
    } else {
      setTasksByItemId({});
    }
  }, [items, fetchTasksForItems]);

  const refetch = useCallback(async () => {
    await refetchItems();
  }, [refetchItems]);

  const view = (() => {
    if (!sprint || !projectId || !sprintId) {
      return null;
    }
    if (itemsLoading || tasksLoading) return null;
    if (itemsError) return null;

    const taskViews: SprintTaskView[] = items.flatMap((item) => {
      const tasksForItem = tasksByItemId[item.id] ?? [];
      return tasksForItem
        .sort((a, b) => a.position - b.position || a.id - b.id)
        .map((task) => ({
          id: String(task.id),
          sprintId: sprint.id,
          userStoryId: String(item.userStoryId),
          title: task.title,
          assignee: resolveUser(
            task.assigneeId,
            members,
            "Sem responsável"
          ),
          estimatedHours: task.estimatedHours ?? 0,
          doneHours: task.actualHours ?? 0,
          priorityLabel: priorityNumberToLabel(task.priority),
        }));
    });

    const scopeHours = taskViews.reduce(
      (sum, t) => sum + t.estimatedHours,
      0
    );
    const burnedHours = taskViews.reduce((sum, t) => sum + t.doneHours, 0);
    const remainingHours = Math.max(scopeHours - burnedHours, 0);

    const days = eachDayInclusive(sprint.startDate, sprint.endDate);
    const totalDays = Math.max(days.length, 1);
    const effectiveBurned = scopeHours - remainingHours;

    const burndownPoints: BurndownPoint[] = days.map((day, index) => {
      const t = totalDays === 1 ? 0 : index / (totalDays - 1);
      const idealRemaining = scopeHours * (1 - t);
      const actualRemainingRaw = scopeHours - effectiveBurned * t;
      const actualRemaining = Math.max(actualRemainingRaw, 0);
      const delta = actualRemaining - idealRemaining;
      const label = day.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
      const dateISO = day.toISOString().slice(0, 10);
      return {
        dateISO,
        label,
        idealRemaining: Number(idealRemaining.toFixed(2)),
        actualRemaining: Number(actualRemaining.toFixed(2)),
        delta: Number(delta.toFixed(2)),
      };
    });

    return {
      taskViews,
      scopeHours,
      burnedHours,
      remainingHours,
      burndownPoints,
    };
  })();

  return {
    taskViews: view?.taskViews ?? [],
    scopeHours: view?.scopeHours ?? 0,
    burnedHours: view?.burnedHours ?? 0,
    remainingHours: view?.remainingHours ?? 0,
    burndownPoints: view?.burndownPoints ?? [],
    loading: itemsLoading || tasksLoading,
    error: itemsError ?? null,
    refetch,
  };
}
