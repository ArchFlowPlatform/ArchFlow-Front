import { USE_MOCKS } from "@/lib/env";
import type { StoryTaskStatus } from "@/lib/story-task-status";
import type { User } from "@/types/user";

type SprintStatus = "planned" | "active" | "completed" | "cancelled";

export type PriorityLevel = 1 | 2 | 3;
export type PriorityLabel = "P1" | "P2" | "P3";

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  capacityHours: number;
  status: SprintStatus;
}

export interface SprintItem {
  id: string;
  sprintId: string;
  userStoryId: string;
  addedAt: string;
}

export interface Task {
  id: string;
  userStoryId: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  assigneeId: string;
  estimatedHours: number;
  actualHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoryTaskRowView {
  id: string;
  /** Backend task id for DELETE / tasks API. */
  numericTaskId: number;
  userStoryId: string;
  title: string;
  description: string;
  priorityLabel: PriorityLabel;
  /** StoryTaskStatus: Todo = 0, Doing = 1, Done = 2 */
  status: StoryTaskStatus;
  assignee: User;
  estimatedHours: number;
  doneHours: number;
}

export interface SprintBacklogStoryView {
  id: string;
  /** Sprint item row id for sprint-items API. */
  sprintItemId: number;
  title: string;
  epicName: string;
  acceptanceCriteria: string;
  description: string;
  effort: number;
  assignee: User;
  tasks: StoryTaskRowView[];
}

export interface AssigneeWorkloadView {
  assigneeId: string;
  assignee: User;
  storyCount: number;
  taskCount: number;
  estimatedHours: number;
  doneHours: number;
  remainingHours: number;
  averageTaskHours: number;
  loadLabel: string;
  progressRatio: number;
  sprintWeightRatio: number;
  statusChips: string[];
  topTasks: StoryTaskRowView[];
}

export interface SprintBacklogViewModel {
  sprint: Sprint;
  storyCount: number;
  taskCount: number;
  estimatedHours: number;
  doneHours: number;
  remainingHours: number;
  stories: SprintBacklogStoryView[];
  assignees: AssigneeWorkloadView[];
}

// ── Mock-only builder (gated behind NEXT_PUBLIC_USE_MOCKS) ──

function assertMocksEnabled(caller: string): void {
  if (!USE_MOCKS) {
    throw new Error(
      `${caller}() requires NEXT_PUBLIC_USE_MOCKS=true. ` +
        "Production code should use real API hooks instead.",
    );
  }
}

export function buildSprintBacklogView(
  projectId?: string,
  sprintId?: string,
): SprintBacklogViewModel {
  assertMocksEnabled("buildSprintBacklogView");

  /* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
  const { roadmapProjectId } = require("@/mocks/backend/rawData") as { roadmapProjectId: string };
  const sel = require("@/mocks/backend/selectors") as Record<string, (...args: unknown[]) => unknown>;
  /* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */

  const pid = projectId ?? roadmapProjectId;
  const fallback = sel.getDefaultSprintForProject(pid) as Record<string, unknown> | undefined;
  if (!fallback && !sprintId) throw new Error(`Missing sprint row for project ${pid}.`);

  const sprintRow = sel.getSprintRowById(sprintId ?? (fallback!.id as string)) as Record<string, unknown>;
  const sprint: Sprint = {
    id: sprintRow.id as string,
    projectId: sprintRow.project_id as string,
    name: sprintRow.name as string,
    startDate: `${sprintRow.start_date}T00:00:00Z`,
    endDate: `${sprintRow.end_date}T00:00:00Z`,
    capacityHours: (sprintRow.capacity_hours as number) ?? 0,
    status: sprintRow.status as SprintStatus,
  };

  type RawItem = Record<string, unknown>;
  const rawItems = (sel.getSprintItemsForSprint(sprint.id) as RawItem[])
    .map((i) => ({
      id: i.id as string,
      sprintId: i.sprint_id as string,
      userStoryId: i.user_story_id as string,
      addedAt: i.added_at as string,
    }))
    .sort((a, b) => a.addedAt.localeCompare(b.addedAt));

  const storyIds = new Set(rawItems.map((i) => i.userStoryId));
  type PriorityLabel = "P1" | "P2" | "P3";
  const prioLabel = sel.priorityNumberToLabel as (n: number) => PriorityLabel;
  const getUser = sel.getUserById as (id: string) => User;

  const tasks: Task[] = rawItems
    .flatMap((item) =>
      (sel.getTasksForUserStory(item.userStoryId) as RawItem[]).map((t) => ({
        id: t.id as string,
        userStoryId: t.user_story_id as string,
        title: t.title as string,
        description: (t.description as string) ?? "",
        priority: t.priority as PriorityLevel,
        assigneeId: (t.assignee_id as string) ?? "",
        estimatedHours: (t.estimated_hours as number) ?? 0,
        actualHours: (t.actual_hours as number) ?? 0,
        createdAt: t.created_at as string,
        updatedAt: t.updated_at as string,
      })),
    )
    .filter((t) => storyIds.has(t.userStoryId))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const taskViewsByStoryId = new Map<string, StoryTaskRowView[]>();
  let numId = 1;
  for (const task of tasks) {
    const tv: StoryTaskRowView = {
      id: task.id,
      numericTaskId: numId++,
      userStoryId: task.userStoryId,
      title: task.title,
      description: task.description,
      priorityLabel: prioLabel(task.priority),
      status: 0,
      assignee: getUser(task.assigneeId),
      estimatedHours: task.estimatedHours,
      doneHours: task.actualHours,
    };
    const list = taskViewsByStoryId.get(task.userStoryId) ?? [];
    list.push(tv);
    taskViewsByStoryId.set(task.userStoryId, list);
  }

  let sprintItemNum = 1;
  const stories: SprintBacklogStoryView[] = rawItems
    .map((item) => {
      const story = sel.getUserStoryRowById(item.userStoryId) as RawItem;
      const epic = sel.getEpicRowById(story.epic_id as string) as RawItem;
      const tvs = taskViewsByStoryId.get((story.id as string)) ?? [];
      const assignee =
        story.assignee_id && (story.assignee_id as string).trim().length > 0
          ? getUser(story.assignee_id as string)
          : (tvs[0]?.assignee ?? getUser("96cd4b95-acdf-4a62-9063-53292716b656"));
      return {
        id: story.id as string,
        sprintItemId: sprintItemNum++,
        title: story.title as string,
        epicName: epic.name as string,
        acceptanceCriteria: (story.acceptance_criteria as string) ?? "",
        description: story.description as string,
        effort: (story.effort as number) ?? 0,
        assignee,
        tasks: tvs,
      } satisfies SprintBacklogStoryView;
    })
    .filter((s): s is SprintBacklogStoryView => Boolean(s));

  const estTotal = tasks.reduce((s, t) => s + t.estimatedHours, 0);
  const doneTotal = tasks.reduce((s, t) => s + t.actualHours, 0);

  function fmtLoad(w: number): string {
    if (w >= 0.45) return "Alta";
    if (w >= 0.25) return "Média";
    return "Baixa";
  }

  const assignees: AssigneeWorkloadView[] = Array.from(
    tasks.reduce((groups, t) => {
      const list = groups.get(t.assigneeId) ?? [];
      list.push(t);
      groups.set(t.assigneeId, list);
      return groups;
    }, new Map<string, Task[]>()),
  )
    .map(([aId, aTs]) => {
      const assignee = getUser(aId);
      const sc = new Set(aTs.map((t) => t.userStoryId)).size;
      const est = aTs.reduce((s, t) => s + t.estimatedHours, 0);
      const done = aTs.reduce((s, t) => s + t.actualHours, 0);
      const rem = Math.max(est - done, 0);
      const avg = aTs.length ? Math.round((est / aTs.length) * 10) / 10 : 0;
      const prog = est > 0 ? Math.min(done / est, 1) : 0;
      const sw = estTotal > 0 ? est / estTotal : 0;
      const topTasks = [...aTs]
        .sort((a, b) => b.estimatedHours - a.estimatedHours)
        .slice(0, 3)
        .map((t) => (taskViewsByStoryId.get(t.userStoryId) ?? []).find((c) => c.id === t.id))
        .filter((t): t is StoryTaskRowView => Boolean(t));
      return {
        assigneeId: aId,
        assignee,
        storyCount: sc,
        taskCount: aTs.length,
        estimatedHours: est,
        doneHours: done,
        remainingHours: rem,
        averageTaskHours: avg,
        loadLabel: fmtLoad(sw),
        progressRatio: prog,
        sprintWeightRatio: sw,
        statusChips: [done <= est ? "OK" : "Risco", "assignee"],
        topTasks,
      } satisfies AssigneeWorkloadView;
    })
    .sort((a, b) => b.estimatedHours - a.estimatedHours);

  return {
    sprint,
    storyCount: stories.length,
    taskCount: tasks.length,
    estimatedHours: estTotal,
    doneHours: doneTotal,
    remainingHours: Math.round(Math.max(estTotal - doneTotal, 0)),
    stories,
    assignees,
  };
}
