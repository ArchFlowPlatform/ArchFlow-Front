"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Sprint } from "@/types/sprint";
import type { UserStory } from "@/types/backlog";
import type { User } from "@/types/user";
import { normalizeStoryTaskStatus } from "@/lib/story-task-status";
import { resolveUsersByIdCached } from "@/lib/users/resolve-assignee-names";
import { getTasks } from "@/features/story-tasks/api/story-tasks.api";
import { useSprintItems } from "@/features/sprint-items/hooks/useSprintItems";
import { useBacklog } from "@/features/backlog/hooks/useBacklog";
import type {
  AssigneeWorkloadView,
  SprintBacklogStoryView,
  SprintBacklogViewModel,
  StoryTaskRowView,
} from "../mocks/sprintBacklog.mock";

type PriorityLabel = "P1" | "P2" | "P3";

function isAbortLike(e: unknown): boolean {
  if (typeof e !== "object" || e === null) return false;
  const o = e as { code?: string; name?: string };
  return o.code === "ERR_CANCELED" || o.name === "CanceledError";
}

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
  fallbackName: string,
  resolvedUsersById: Record<string, User>
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

  const resolved = resolvedUsersById[assigneeId];
  if (resolved?.name) return resolved;

  const member = members.find((m) => m.user?.id === assigneeId);
  if (member?.user) return member.user;
  return {
    id: assigneeId,
    name: "Sem responsável",
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
 * Step 6: `useSprintItems` + `getTasks` per item + backlog for labels/assignees.
 * Pass `members` from the page (single `useProject` per screen) to avoid duplicate
 * `/projects/:id` + `/members` calls. `sprintListReady` gates loading until sprints resolve.
 */
export function useSprintBacklogView(
  projectId: string | null,
  sprintId: string | null,
  sprint: Sprint | null,
  members: { user?: User }[],
  sprintListReady: boolean
): UseSprintBacklogViewResult {
  const { items, loading: itemsLoading, error: itemsError, refetch: refetchItems } = useSprintItems(projectId, sprintId);
  const {
    backlog,
    loading: backlogLoading,
    refetch: refetchBacklog,
  } = useBacklog(projectId);

  const [tasksByItemId, setTasksByItemId] = useState<Record<number, import("@/types/sprint").StoryTask[]>>({});
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<Error | null>(null);

  const [resolvedUsersById, setResolvedUsersById] = useState<Record<string, User>>({});
  const [assigneesLoading, setAssigneesLoading] = useState(false);
  const epics = backlog?.epics ?? [];
  const epicNameByEpicId = new Map(epics.map((e) => [e.id, e.name]));
  const allBacklogStories = epics.flatMap((e) => e.userStories ?? []);

  const assigneeIdsToResolve = useMemo(() => {
    if (itemsLoading || tasksLoading || backlogLoading || !projectId || !sprintId) return [];

    const ids = new Set<string>();
    for (const item of items) {
      const story =
        item.userStory ?? allBacklogStories.find((s) => s.id === item.userStoryId);
      const id = story?.assigneeId;
      if (id?.trim()) ids.add(id);
    }
    return Array.from(ids);
  }, [
    items,
    itemsLoading,
    tasksLoading,
    backlogLoading,
    projectId,
    sprintId,
    allBacklogStories,
  ]);

  const assigneeIdsKey = useMemo(() => {
    return [...assigneeIdsToResolve].sort().join("|");
  }, [assigneeIdsToResolve]);

  useEffect(() => {
    let cancelled = false;

    async function run(): Promise<void> {
      const ids = assigneeIdsKey ? assigneeIdsKey.split("|").filter(Boolean) : [];
      if (ids.length === 0) {
        setAssigneesLoading(false);
        return;
      }

      setAssigneesLoading(true);
      try {
        const resolved = await resolveUsersByIdCached(ids);
        if (cancelled) return;
        setResolvedUsersById((prev) => ({ ...prev, ...resolved }));
      } finally {
        if (!cancelled) setAssigneesLoading(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [assigneeIdsKey]);

  const itemIdsKey = useMemo(
    () =>
      [...items]
        .map((i) => i.id)
        .sort((a, b) => a - b)
        .join(","),
    [items]
  );

  useEffect(() => {
    if (!projectId || !sprintId || itemIdsKey === "") {
      setTasksByItemId({});
      setTasksLoading(false);
      setTasksError(null);
      return;
    }

    const itemIds = itemIdsKey.split(",").map((s) => Number(s));
    const ac = new AbortController();

    setTasksLoading(true);
    setTasksError(null);

    void (async () => {
      try {
        const results = await Promise.all(
          itemIds.map((itemId) =>
            getTasks(projectId, sprintId, itemId, ac.signal).then((tasks) => ({
              itemId,
              tasks,
            }))
          )
        );
        const map: Record<number, import("@/types/sprint").StoryTask[]> = {};
        for (const { itemId, tasks } of results) {
          map[itemId] = tasks;
        }
        setTasksByItemId(map);
      } catch (e) {
        if (isAbortLike(e)) return;
        setTasksByItemId({});
        setTasksError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!ac.signal.aborted) {
          setTasksLoading(false);
        }
      }
    })();

    return () => ac.abort();
  }, [itemIdsKey, projectId, sprintId]);

  const refetch = useCallback(async () => {
    await Promise.all([refetchItems(), refetchBacklog()]);
  }, [refetchItems, refetchBacklog]);

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

  const sprintMissing =
    Boolean(sprintListReady && sprintId && !sprint);

  const view: SprintBacklogViewModel | null = (() => {
    if (!sprint || !projectId || !sprintId) return null;
    if (itemsLoading || tasksLoading || assigneesLoading || backlogLoading) return null;
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
            status: normalizeStoryTaskStatus(task.status),
            assignee: resolveUser(
              task.assigneeId,
              members,
              "Sem responsável",
              resolvedUsersById,
            ),
            estimatedHours: task.estimatedHours ?? 0,
            doneHours: task.actualHours ?? 0,
          }));
        const storyAssignee = resolveUser(
          userStory.assigneeId,
          members,
          taskViews[0] ? taskViews[0].assignee.name : "Sem responsável",
          resolvedUsersById
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
    loading:
      !sprintMissing &&
      (itemsLoading ||
        tasksLoading ||
        assigneesLoading ||
        backlogLoading ||
        !sprintListReady),
    error:
      itemsError ??
      tasksError ??
      (sprintMissing
        ? new Error("Sprint não encontrada para este projeto.")
        : null),
    refetch,
    availableBacklogStories,
  };
}
