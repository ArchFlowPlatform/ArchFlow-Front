import { USE_MOCKS } from "@/lib/env";
import type { StoryTaskStatus } from "@/lib/story-task-status";
import type { User } from "@/types/user";

type SprintStatus = "planned" | "active" | "completed" | "cancelled";

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  capacityHours: number;
  createdAt: string;
  updatedAt: string;
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
  priority: number;
  assigneeId: string;
  estimatedHours: number;
  actualHours: number;
  createdAt: string;
  updatedAt: string;
}

type PriorityLabel = "P1" | "P2" | "P3";

export interface SprintTaskView {
  id: string;
  sprintId: string;
  userStoryId: string;
  title: string;
  assignee: User;
  estimatedHours: number;
  doneHours: number;
  priorityLabel: PriorityLabel;
  /** StoryTaskStatus: Todo = 0, Doing = 1, Done = 2 */
  status: StoryTaskStatus;
}

export interface BurndownPoint {
  dateISO: string;
  label: string;
  idealRemaining: number;
  actualRemaining: number;
  delta: number;
}

export interface SprintViewModel {
  sprint: Sprint;
  items: SprintItem[];
  tasks: Task[];
  taskViews: SprintTaskView[];
  scopeHours: number;
  burnedHours: number;
  remainingHours: number;
  burndownPoints: BurndownPoint[];
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

// ── Mock-only builder (gated behind NEXT_PUBLIC_USE_MOCKS) ──

function assertMocksEnabled(caller: string): void {
  if (!USE_MOCKS) {
    throw new Error(
      `${caller}() requires NEXT_PUBLIC_USE_MOCKS=true. ` +
        "Production code should use real API hooks instead.",
    );
  }
}

export function buildMockSprintView(
  projectId?: string,
  sprintId?: string,
): SprintViewModel {
  assertMocksEnabled("buildMockSprintView");

  /* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
  const { roadmapProjectId } = require("@/mocks/backend/rawData") as { roadmapProjectId: string };
  const sel = require("@/mocks/backend/selectors") as Record<string, (...args: unknown[]) => unknown>;
  /* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */

  type RawItem = Record<string, unknown>;
  const pid = projectId ?? roadmapProjectId;
  const fallback = sel.getDefaultSprintForProject(pid) as RawItem | undefined;
  if (!fallback && !sprintId) throw new Error(`Missing sprint row for project ${pid}.`);

  const row = sel.getSprintRowById(sprintId ?? (fallback!.id as string)) as RawItem;
  const sprint: Sprint = {
    id: row.id as string,
    projectId: row.project_id as string,
    name: row.name as string,
    goal: (row.goal as string) ?? "",
    startDate: `${row.start_date}T00:00:00Z`,
    endDate: `${row.end_date}T00:00:00Z`,
    status: row.status as SprintStatus,
    capacityHours: (row.capacity_hours as number) ?? 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };

  const items: SprintItem[] = (sel.getSprintItemsForSprint(sprint.id) as RawItem[]).map((i) => ({
    id: i.id as string,
    sprintId: i.sprint_id as string,
    userStoryId: i.user_story_id as string,
    addedAt: i.added_at as string,
  }));

  const storyIds = new Set(items.map((i) => i.userStoryId));
  const prioLabel = sel.priorityNumberToLabel as (n: number) => PriorityLabel;
  const getUser = sel.getUserById as (id: string) => User;

  const tasks: Task[] = items.flatMap((item) =>
    (sel.getTasksForUserStory(item.userStoryId) as RawItem[])
      .map((t) => ({
        id: t.id as string,
        userStoryId: t.user_story_id as string,
        title: t.title as string,
        description: (t.description as string) ?? "",
        priority: t.priority as number,
        assigneeId: (t.assignee_id as string) ?? "",
        estimatedHours: (t.estimated_hours as number) ?? 0,
        actualHours: (t.actual_hours as number) ?? 0,
        createdAt: t.created_at as string,
        updatedAt: t.updated_at as string,
      }))
      .filter((t) => storyIds.has(t.userStoryId)),
  );

  const taskViews: SprintTaskView[] = tasks.map((t) => ({
    id: t.id,
    sprintId: sprint.id,
    userStoryId: t.userStoryId,
    title: t.title,
    assignee: getUser(t.assigneeId),
    estimatedHours: t.estimatedHours,
    doneHours: t.actualHours,
    priorityLabel: prioLabel(t.priority),
    status: 0,
  }));

  const scopeHours = taskViews.reduce((s, t) => s + t.estimatedHours, 0);
  const burnedHours = taskViews.reduce((s, t) => s + t.doneHours, 0);
  const remainingHours = Math.max(scopeHours - burnedHours, 0);
  const days = eachDayInclusive(sprint.startDate, sprint.endDate);
  const totalDays = Math.max(days.length, 1);
  const effectiveBurned = scopeHours - remainingHours;

  const burndownPoints: BurndownPoint[] = days.map((day, index) => {
    const t = totalDays === 1 ? 0 : index / (totalDays - 1);
    const ideal = scopeHours * (1 - t);
    const actual = Math.max(scopeHours - effectiveBurned * t, 0);
    return {
      dateISO: day.toISOString().slice(0, 10),
      label: day.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      idealRemaining: Number(ideal.toFixed(2)),
      actualRemaining: Number(actual.toFixed(2)),
      delta: Number((actual - ideal).toFixed(2)),
    };
  });

  return { sprint, items, tasks, taskViews, scopeHours, burnedHours, remainingHours, burndownPoints };
}
