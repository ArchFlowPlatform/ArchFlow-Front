import { roadmapProjectId } from "@/mocks/backend/rawData";
import {
  getDefaultSprintForProject,
  getEpicRowById,
  getSprintRowById,
  getSprintItemsForSprint,
  getTasksForUserStory,
  getUserById,
  getUserStoryRowById,
  priorityNumberToLabel,
} from "@/mocks/backend/selectors";
import type { SprintStatus } from "@/mocks/backend/schema";
import type { User } from "@/types/user";

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

function buildSprintFromRowId(sprintId: string): Sprint {
  const sprintRow = getSprintRowById(sprintId);

  return {
    id: sprintRow.id,
    projectId: sprintRow.project_id,
    name: sprintRow.name,
    startDate: `${sprintRow.start_date}T00:00:00Z`,
    endDate: `${sprintRow.end_date}T00:00:00Z`,
    capacityHours: sprintRow.capacity_hours ?? 0,
    status: sprintRow.status,
  };
}

function formatLoadLabel(weightRatio: number): string {
  if (weightRatio >= 0.45) return "Alta";
  if (weightRatio >= 0.25) return "Média";
  return "Baixa";
}

export function buildSprintBacklogView(
  projectId = roadmapProjectId,
  sprintId?: string,
): SprintBacklogViewModel {
  const fallbackSprintRow = getDefaultSprintForProject(projectId);

  if (!fallbackSprintRow && !sprintId) {
    throw new Error(`Missing sprint row for project ${projectId}.`);
  }

  const sprint = buildSprintFromRowId(sprintId ?? fallbackSprintRow!.id);

  const sprintItems: SprintItem[] = getSprintItemsForSprint(sprint.id)
    .map((item) => ({
      id: item.id,
      sprintId: item.sprint_id,
      userStoryId: item.user_story_id,
      addedAt: item.added_at,
    }))
    .sort((left, right) => left.addedAt.localeCompare(right.addedAt));

  const storyIds = new Set(sprintItems.map((item) => item.userStoryId));

  const sprintTasks: Task[] = sprintItems
    .flatMap((item) =>
      getTasksForUserStory(item.userStoryId).map((task) => ({
        id: task.id,
        userStoryId: task.user_story_id,
        title: task.title,
        description: task.description ?? "",
        priority: task.priority as PriorityLevel,
        assigneeId: task.assignee_id ?? "",
        estimatedHours: task.estimated_hours ?? 0,
        actualHours: task.actual_hours ?? 0,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      })),
    )
    .filter((task) => storyIds.has(task.userStoryId))
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));

  const taskViewsByStoryId = new Map<string, StoryTaskRowView[]>();

  let mockTaskNumericId = 1;
  for (const task of sprintTasks) {
    const taskView: StoryTaskRowView = {
      id: task.id,
      numericTaskId: mockTaskNumericId++,
      userStoryId: task.userStoryId,
      title: task.title,
      description: task.description,
      priorityLabel: priorityNumberToLabel(task.priority),
      assignee: getUserById(task.assigneeId),
      estimatedHours: task.estimatedHours,
      doneHours: task.actualHours,
    };

    const currentList = taskViewsByStoryId.get(task.userStoryId) ?? [];
    currentList.push(taskView);
    taskViewsByStoryId.set(task.userStoryId, currentList);
  }

  let mockSprintItemNumericId = 1;
  const stories = sprintItems
    .map((item) => {
      const story = getUserStoryRowById(item.userStoryId);
      const epic = getEpicRowById(story.epic_id);
      const taskViews = taskViewsByStoryId.get(story.id) ?? [];
      const storyAssignee =
        story.assignee_id && story.assignee_id.trim().length > 0
          ? getUserById(story.assignee_id)
          : (taskViews[0]?.assignee ?? getUserById("96cd4b95-acdf-4a62-9063-53292716b656"));

      return {
        id: story.id,
        sprintItemId: mockSprintItemNumericId++,
        title: story.title,
        epicName: epic.name,
        acceptanceCriteria: story.acceptance_criteria ?? "",
        description: story.description,
        effort: story.effort ?? 0,
        assignee: storyAssignee,
        tasks: taskViews,
      } satisfies SprintBacklogStoryView;
    })
    .filter((story): story is SprintBacklogStoryView => Boolean(story));

  const estimatedMinutesTotal = sprintTasks.reduce(
    (sum, task) => sum + task.estimatedHours,
    0,
  );
  const loggedMinutesTotal = sprintTasks.reduce(
    (sum, task) => sum + task.actualHours,
    0,
  );

  const assignees = Array.from(
    sprintTasks.reduce((groups, task) => {
      const existing = groups.get(task.assigneeId) ?? [];
      existing.push(task);
      groups.set(task.assigneeId, existing);
      return groups;
    }, new Map<string, Task[]>()),
  )
    .map(([assigneeId, tasksForAssignee]) => {
      const assignee = getUserById(assigneeId);
      const storyCount = new Set(tasksForAssignee.map((task) => task.userStoryId))
        .size;
      const estimatedMinutes = tasksForAssignee.reduce(
        (sum, task) => sum + task.estimatedHours,
        0,
      );
      const loggedMinutes = tasksForAssignee.reduce(
        (sum, task) => sum + task.actualHours,
        0,
      );
      const remainingMinutes = Math.max(estimatedMinutes - loggedMinutes, 0);
      const averageTaskHours = tasksForAssignee.length
        ? Math.round((estimatedMinutes / tasksForAssignee.length) * 10) / 10
        : 0;
      const progressRatio =
        estimatedMinutes > 0 ? Math.min(loggedMinutes / estimatedMinutes, 1) : 0;
      const sprintWeightRatio =
        estimatedMinutesTotal > 0 ? estimatedMinutes / estimatedMinutesTotal : 0;

      const topTasks = [...tasksForAssignee]
        .sort((left, right) => right.estimatedHours - left.estimatedHours)
        .slice(0, 3)
        .map((task) => {
          const taskViews = taskViewsByStoryId.get(task.userStoryId) ?? [];
          return taskViews.find((candidate) => candidate.id === task.id);
        })
        .filter((task): task is StoryTaskRowView => Boolean(task));

      return {
        assigneeId,
        assignee,
        storyCount,
        taskCount: tasksForAssignee.length,
        estimatedHours: estimatedMinutes,
        doneHours: loggedMinutes,
        remainingHours: remainingMinutes,
        averageTaskHours,
        loadLabel: formatLoadLabel(sprintWeightRatio),
        progressRatio,
        sprintWeightRatio,
        statusChips: [loggedMinutes <= estimatedMinutes ? "OK" : "Risco", "assignee"],
        topTasks,
      } satisfies AssigneeWorkloadView;
    })
    .sort((left, right) => right.estimatedHours - left.estimatedHours);

  return {
    sprint,
    storyCount: stories.length,
    taskCount: sprintTasks.length,
    estimatedHours: estimatedMinutesTotal,
    doneHours: loggedMinutesTotal,
    remainingHours: Math.round(
      Math.max(estimatedMinutesTotal - loggedMinutesTotal, 0),
    ),
    stories,
    assignees,
  };
}
