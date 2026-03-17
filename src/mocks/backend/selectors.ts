import type { User } from "../../types/user";
import {
  boardColumnsTable,
  boardsTable,
  cardActivitiesTable,
  cardCommentsTable,
  cardLabelsTable,
  cardsTable,
  epicsTable,
  labelsTable,
  productBacklogsTable,
  projectMembersTable,
  projectsTable,
  sprintItemsTable,
  sprintsTable,
  tasksTable,
  userStoriesTable,
  usersTable,
} from "./rawData";
import type {
  BoardColumnRow,
  BoardRow,
  CardActivityRow,
  CardCommentRow,
  CardLabelRow,
  CardRow,
  EpicRow,
  LabelRow,
  ProductBacklogRow,
  ProjectMemberRow,
  ProjectRow,
  SprintItemRow,
  SprintRow,
  TaskRow,
  UserRow,
  UserStoryRow,
} from "./schema";

export const usersById = new Map(usersTable.map((row) => [row.id, row]));
export const projectsById = new Map(projectsTable.map((row) => [row.id, row]));
export const productBacklogsByProjectId = new Map(
  productBacklogsTable.map((row) => [row.project_id, row]),
);
export const epicsById = new Map(epicsTable.map((row) => [row.id, row]));
export const userStoriesById = new Map(userStoriesTable.map((row) => [row.id, row]));
export const sprintsById = new Map(sprintsTable.map((row) => [row.id, row]));
export const boardsById = new Map(boardsTable.map((row) => [row.id, row]));
export const boardColumnsById = new Map(boardColumnsTable.map((row) => [row.id, row]));
export const tasksById = new Map(tasksTable.map((row) => [row.id, row]));
export const cardsById = new Map(cardsTable.map((row) => [row.id, row]));
export const labelsById = new Map(labelsTable.map((row) => [row.id, row]));

function groupBy<T, K>(items: T[], buildKey: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const key = buildKey(item);
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return map;
}

export const projectMembersByProjectId = groupBy(
  projectMembersTable,
  (row) => row.project_id,
);
export const epicsByBacklogId = groupBy(epicsTable, (row) => row.product_backlog_id);
export const userStoriesByEpicId = groupBy(userStoriesTable, (row) => row.epic_id);
export const sprintsByProjectId = groupBy(sprintsTable, (row) => row.project_id);
export const sprintItemsBySprintId = groupBy(sprintItemsTable, (row) => row.sprint_id);
export const tasksByUserStoryId = groupBy(tasksTable, (row) => row.user_story_id);
export const boardsByProjectId = groupBy(boardsTable, (row) => row.project_id);
export const boardColumnsByBoardId = groupBy(boardColumnsTable, (row) => row.board_id);
export const cardsByColumnId = groupBy(cardsTable, (row) => row.column_id);
export const labelsByProjectId = groupBy(labelsTable, (row) => row.project_id);
export const cardLabelsByCardId = groupBy(cardLabelsTable, (row) => row.card_id);
export const cardCommentsByCardId = groupBy(cardCommentsTable, (row) => row.card_id);
export const cardActivitiesByCardId = groupBy(cardActivitiesTable, (row) => row.card_id);

export function toCamelUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    type: row.type ?? "",
    avatarUrl: row.avatar_url ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getUserRowById(userId: string): UserRow {
  const user = usersById.get(userId);
  if (!user) {
    throw new Error(`Missing user row for ${userId}`);
  }
  return user;
}

export function getUserById(userId: string): User {
  return toCamelUser(getUserRowById(userId));
}

export function getProjectRowById(projectId: string): ProjectRow {
  const project = projectsById.get(projectId);
  if (!project) {
    throw new Error(`Missing project row for ${projectId}`);
  }
  return project;
}

export function getProductBacklogRowByProjectId(projectId: string): ProductBacklogRow {
  const backlog = productBacklogsByProjectId.get(projectId);
  if (!backlog) {
    throw new Error(`Missing product backlog row for ${projectId}`);
  }
  return backlog;
}

export function getEpicRowById(epicId: string): EpicRow {
  const epic = epicsById.get(epicId);
  if (!epic) {
    throw new Error(`Missing epic row for ${epicId}`);
  }
  return epic;
}

export function getUserStoryRowById(storyId: string): UserStoryRow {
  const story = userStoriesById.get(storyId);
  if (!story) {
    throw new Error(`Missing user story row for ${storyId}`);
  }
  return story;
}

export function getSprintRowById(sprintId: string): SprintRow {
  const sprint = sprintsById.get(sprintId);
  if (!sprint) {
    throw new Error(`Missing sprint row for ${sprintId}`);
  }
  return sprint;
}

export function getBoardRowById(boardId: string): BoardRow {
  const board = boardsById.get(boardId);
  if (!board) {
    throw new Error(`Missing board row for ${boardId}`);
  }
  return board;
}

export function getBoardColumnRowById(columnId: string): BoardColumnRow {
  const column = boardColumnsById.get(columnId);
  if (!column) {
    throw new Error(`Missing board column row for ${columnId}`);
  }
  return column;
}

export function getTaskRowById(taskId: string): TaskRow {
  const task = tasksById.get(taskId);
  if (!task) {
    throw new Error(`Missing task row for ${taskId}`);
  }
  return task;
}

export function getCardRowById(cardId: string): CardRow {
  const card = cardsById.get(cardId);
  if (!card) {
    throw new Error(`Missing card row for ${cardId}`);
  }
  return card;
}

export function getLabelRowById(labelId: string): LabelRow {
  const label = labelsById.get(labelId);
  if (!label) {
    throw new Error(`Missing label row for ${labelId}`);
  }
  return label;
}

export function getProjectMembers(projectId: string): ProjectMemberRow[] {
  return [...(projectMembersByProjectId.get(projectId) ?? [])];
}

export function getEpicsForProject(projectId: string): EpicRow[] {
  const backlog = getProductBacklogRowByProjectId(projectId);
  return [...(epicsByBacklogId.get(backlog.id) ?? [])].sort(
    (left, right) => left.priority - right.priority,
  );
}

export function getUserStoriesForEpic(epicId: string): UserStoryRow[] {
  return [...(userStoriesByEpicId.get(epicId) ?? [])].sort(
    (left, right) => left.priority - right.priority,
  );
}

export function getActiveSprintForProject(projectId: string): SprintRow | null {
  return (
    (sprintsByProjectId.get(projectId) ?? []).find((row) => row.status === "active") ??
    null
  );
}

export function getSprintsForProject(projectId: string): SprintRow[] {
  return [...(sprintsByProjectId.get(projectId) ?? [])].sort((left, right) =>
    right.start_date.localeCompare(left.start_date),
  );
}

export function getDefaultSprintForProject(projectId: string): SprintRow | null {
  return getActiveSprintForProject(projectId) ?? getSprintsForProject(projectId)[0] ?? null;
}

export function getSprintItemsForSprint(sprintId: string): SprintItemRow[] {
  return [...(sprintItemsBySprintId.get(sprintId) ?? [])].sort((left, right) =>
    left.added_at.localeCompare(right.added_at),
  );
}

export function getTasksForUserStory(storyId: string): TaskRow[] {
  return [...(tasksByUserStoryId.get(storyId) ?? [])].sort((left, right) =>
    left.created_at.localeCompare(right.created_at),
  );
}

export function getDefaultBoardForProject(projectId: string): BoardRow | null {
  return (
    (boardsByProjectId.get(projectId) ?? []).find((row) => row.is_default) ??
    (boardsByProjectId.get(projectId) ?? [])[0] ??
    null
  );
}

export function getColumnsForBoard(boardId: string): BoardColumnRow[] {
  return [...(boardColumnsByBoardId.get(boardId) ?? [])].sort(
    (left, right) => left.position - right.position,
  );
}

export function getCardsForColumn(columnId: string): CardRow[] {
  return [...(cardsByColumnId.get(columnId) ?? [])].sort(
    (left, right) => left.position - right.position,
  );
}

export function getLabelsForCard(cardId: string): LabelRow[] {
  return (cardLabelsByCardId.get(cardId) ?? []).map((row) => getLabelRowById(row.label_id));
}

export function getCommentsForCard(cardId: string): CardCommentRow[] {
  return [...(cardCommentsByCardId.get(cardId) ?? [])].sort((left, right) =>
    left.created_at.localeCompare(right.created_at),
  );
}

export function getActivitiesForCard(cardId: string): CardActivityRow[] {
  return [...(cardActivitiesByCardId.get(cardId) ?? [])].sort((left, right) =>
    left.created_at.localeCompare(right.created_at),
  );
}

export function priorityNumberToLabel(priority: number): "P1" | "P2" | "P3" {
  if (priority <= 1) return "P1";
  if (priority === 2) return "P2";
  return "P3";
}

export function splitAcceptanceCriteria(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
