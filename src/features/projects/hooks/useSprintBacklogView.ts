"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Sprint } from "@/types/sprint";
import type { UserStory } from "@/types/backlog";
import type { User } from "@/types/user";
import { getTasks } from "@/features/story-tasks/api/story-tasks.api";
import { useSprintItems } from "@/features/sprint-items/hooks/useSprintItems";
import { useBacklog } from "@/features/backlog/hooks/useBacklog";
import { useProject } from "@/features/projects/hooks/useProject";
import type {
  AssigneeWorkloadView,
  SprintBacklogStoryView,
  SprintBacklogViewModel,
  StoryTaskRowView,
} from "../mocks/sprintBacklog.mock";

type PriorityLabel = "P1" | "P2" | "P3";

function priorityNumberToLabel(priority: number): PriorityLabel {
  if (priority <= 1) return "P1";
  if (priority === 2) return "P2";
  return "P3";
}

function formatLoadLabel(weightRatio: number): string {
  if (weightRatio >= 0.45) return "Alta";
  if (weightRatio >= 0.25) return "Média";
  return "Baixa";
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

export interface UseSprintBacklogViewResult {
  view: SprintBacklogViewModel | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  /** Backlog stories not yet in this sprint (for POST item). */
  availableBacklogStories: UserStory[];
}

/**
 * Step 6: `useSprintItems` + `getTasks` per item + backlog/project for labels/assignees.
 */
export function useSprintBacklogView(
  projectId: string | null,
  sprintId: string | null,
  sprint: Sprint | null
): UseSprintBacklogViewResult {
  const { items, loading: itemsLoading, error: itemsError, refetch: refetchItems } = useSprintItems(projectId, sprintId);
  const { backlog, loading: backlogLoading } = useBacklog(projectId);
  const { project } = useProject(projectId);

  const [tasksByItemId, setTasksByItemId] = useState<Record<number, import("@/types/sprint").StoryTask[]>>({});
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<Error | null>(null);

  const members = project?.members ?? [];
  const epics = backlog?.epics ?? [];
  const epicNameByEpicId = new Map(epics.map((e) => [e.id, e.name]));
  const allBacklogStories = epics.flatMap((e) => e.userStories ?? []);

  const fetchTasksForItems = useCallback(
    async (itemIds: number[]) => {
      if (!projectId || !sprintId || itemIds.length === 0) {
        setTasksByItemId({});
        return;
      }
      setTasksLoading(true);
      setTasksError(null);
      try {
        const results = await Promise.all(
          itemIds.map((itemId) =>
            getTasks(projectId, sprintId, itemId).then((tasks) => ({ itemId, tasks }))
          )
        );
        const map: Record<number, import("@/types/sprint").StoryTask[]> = {};
        for (const { itemId, tasks } of results) {
          map[itemId] = tasks;
        }
        setTasksByItemId(map);
      } catch (e) {
        setTasksByItemId({});
        setTasksError(e instanceof Error ? e : new Error(String(e)));
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

  const availableBacklogStories = useMemo(() => {
    if (itemsLoading || itemsError || backlogLoading || !backlog) return [];
    const inSprint = new Set(items.map((i) => i.userStoryId));
    return allBacklogStories.filter(
      (s) => !inSprint.has(s.id) && !s.isArchived
    );
  }, [
    items,
    allBacklogStories,
    itemsLoading,
    itemsError,
    backlog,
    backlogLoading,
  ]);

  const view: SprintBacklogViewModel | null = (() => {
    if (!sprint || !projectId || !sprintId) return null;
    if (itemsLoading || tasksLoading) return null;
    if (itemsError || tasksError) return null;

    const stories: SprintBacklogStoryView[] = items
      .map((item) => {
        const userStory =
          item.userStory ?? allBacklogStories.find((s) => s.id === item.userStoryId);
        if (!userStory) return null;
        const epicName = epicNameByEpicId.get(userStory.epicId) ?? "—";
        const tasksForItem = tasksByItemId[item.id] ?? [];
        const taskViews: StoryTaskRowView[] = tasksForItem
          .sort((a, b) => a.position - b.position || a.id - b.id)
          .map((task) => ({
            id: String(task.id),
            numericTaskId: task.id,
            userStoryId: String(userStory.id),
            title: task.title,
            description: task.description ?? "",
            priorityLabel: priorityNumberToLabel(task.priority),
            assignee: resolveUser(task.assigneeId, members, "Sem responsável"),
            estimatedHours: task.estimatedHours ?? 0,
            doneHours: task.actualHours ?? 0,
          }));
        const storyAssignee = resolveUser(
          userStory.assigneeId,
          members,
          taskViews[0] ? taskViews[0].assignee.name : "Sem responsável"
        );
        return {
          id: String(userStory.id),
          sprintItemId: item.id,
          title: userStory.title,
          epicName,
          acceptanceCriteria: userStory.acceptanceCriteria ?? "",
          description: userStory.description ?? "",
          effort: userStory.effort ?? 0,
          assignee: storyAssignee,
          tasks: taskViews,
        } satisfies SprintBacklogStoryView;
      })
      .filter((s): s is SprintBacklogStoryView => s !== null);

    const allTasks = stories.flatMap((s) => s.tasks);
    const totalEstimated = allTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
    const totalDone = allTasks.reduce((sum, t) => sum + t.doneHours, 0);

    const assignees: AssigneeWorkloadView[] = Array.from(
      allTasks.reduce(
        (acc, task) => {
          const uid = task.assignee.id || "unassigned";
          const entry = acc.get(uid) ?? {
            assignee: task.assignee,
            storyIds: new Set<string>(),
            tasks: [] as StoryTaskRowView[],
          };
          entry.storyIds.add(task.userStoryId);
          entry.tasks.push(task);
          acc.set(uid, entry);
          return acc;
        },
        new Map<string, { assignee: User; storyIds: Set<string>; tasks: StoryTaskRowView[] }>()
      )
    )
      .map(([assigneeId, entry]) => {
        const estimatedHours = entry.tasks.reduce((s, t) => s + t.estimatedHours, 0);
        const doneHours = entry.tasks.reduce((s, t) => s + t.doneHours, 0);
        const remainingHours = Math.max(estimatedHours - doneHours, 0);
        const averageTaskHours =
          entry.tasks.length > 0 ? Math.round((estimatedHours / entry.tasks.length) * 10) / 10 : 0;
        const progressRatio = estimatedHours > 0 ? Math.min(doneHours / estimatedHours, 1) : 0;
        const sprintWeightRatio = totalEstimated > 0 ? estimatedHours / totalEstimated : 0;
        const topTasks = [...entry.tasks]
          .sort((a, b) => b.estimatedHours - a.estimatedHours)
          .slice(0, 3);
        return {
          assigneeId,
          assignee: entry.assignee,
          storyCount: entry.storyIds.size,
          taskCount: entry.tasks.length,
          estimatedHours,
          doneHours,
          remainingHours,
          averageTaskHours,
          loadLabel: formatLoadLabel(sprintWeightRatio),
          progressRatio,
          sprintWeightRatio,
          statusChips: [doneHours <= estimatedHours ? "OK" : "Risco", "assignee"],
          topTasks,
        } satisfies AssigneeWorkloadView;
      })
      .sort((a, b) => b.estimatedHours - a.estimatedHours);

    return {
      sprint: {
        id: sprint.id,
        projectId: sprint.projectId,
        name: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        capacityHours: sprint.capacityHours,
        status: sprint.status as "planned" | "active" | "completed",
      },
      storyCount: stories.length,
      taskCount: allTasks.length,
      estimatedHours: totalEstimated,
      doneHours: totalDone,
      remainingHours: Math.max(totalEstimated - totalDone, 0),
      stories,
      assignees,
    } as SprintBacklogViewModel;
  })();

  return {
    view,
    loading: itemsLoading || tasksLoading,
    error: itemsError ?? tasksError,
    refetch,
    availableBacklogStories,
  };
}
