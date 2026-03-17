import { roadmapProjectId } from "@/mocks/backend/rawData";
import {
  getDefaultSprintForProject,
  getSprintRowById,
  getSprintItemsForSprint,
  getTasksForUserStory,
  getUserById,
  priorityNumberToLabel,
} from "@/mocks/backend/selectors";
import type { SprintStatus } from "@/mocks/backend/schema";
import type { User } from "@/types/user";

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

function buildSprintFromRowId(sprintId: string): Sprint {
  const sprintRow = getSprintRowById(sprintId);

  return {
    id: sprintRow.id,
    projectId: sprintRow.project_id,
    name: sprintRow.name,
    goal: sprintRow.goal ?? "",
    startDate: `${sprintRow.start_date}T00:00:00Z`,
    endDate: `${sprintRow.end_date}T00:00:00Z`,
    status: sprintRow.status,
    capacityHours: sprintRow.capacity_hours ?? 0,
    createdAt: sprintRow.created_at,
    updatedAt: sprintRow.updated_at,
  };
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

export function buildMockSprintView(
  projectId = roadmapProjectId,
  sprintId?: string,
): SprintViewModel {
  const fallbackSprintRow = getDefaultSprintForProject(projectId);

  if (!fallbackSprintRow && !sprintId) {
    throw new Error(`Missing sprint row for project ${projectId}.`);
  }

  const sprint = buildSprintFromRowId(sprintId ?? fallbackSprintRow!.id);

  const items: SprintItem[] = getSprintItemsForSprint(sprint.id).map((item) => ({
    id: item.id,
    sprintId: item.sprint_id,
    userStoryId: item.user_story_id,
    addedAt: item.added_at,
  }));

  const userStoryIds = new Set(items.map((item) => item.userStoryId));

  const tasks: Task[] = items.flatMap((item) =>
    getTasksForUserStory(item.userStoryId)
      .map((task) => ({
        id: task.id,
        userStoryId: task.user_story_id,
        title: task.title,
        description: task.description ?? "",
        priority: task.priority,
        assigneeId: task.assignee_id ?? "",
        estimatedHours: task.estimated_hours ?? 0,
        actualHours: task.actual_hours ?? 0,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      }))
      .filter((task) => userStoryIds.has(task.userStoryId)),
  );

  const taskViews: SprintTaskView[] = tasks.map((task) => {
    return {
      id: task.id,
      sprintId: sprint.id,
      userStoryId: task.userStoryId,
      title: task.title,
      assignee: getUserById(task.assigneeId),
      estimatedHours: task.estimatedHours,
      doneHours: task.actualHours,
      priorityLabel: priorityNumberToLabel(task.priority),
    };
  });

  const scopeHours = taskViews.reduce(
    (sum, task) => sum + task.estimatedHours,
    0,
  );

  const burnedHours = taskViews.reduce(
    (sum, task) => sum + task.doneHours,
    0,
  );

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
    sprint,
    items,
    tasks,
    taskViews,
    scopeHours,
    burnedHours,
    remainingHours,
    burndownPoints,
  };
}
