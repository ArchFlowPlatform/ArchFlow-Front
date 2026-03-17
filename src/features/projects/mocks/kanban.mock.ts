import { roadmapProjectId } from "@/mocks/backend/rawData";
import {
  getCardsForColumn,
  getColumnsForBoard,
  getCommentsForCard,
  getDefaultBoardForProject,
  getDefaultSprintForProject,
  getEpicRowById,
  getLabelsForCard,
  getSprintItemsForSprint,
  getSprintRowById,
  getTasksForUserStory,
  getUserById,
  getUserStoryRowById,
  priorityNumberToLabel,
  splitAcceptanceCriteria,
} from "@/mocks/backend/selectors";
import type {
  BusinessValue,
  LabelRow,
  SprintStatus,
  UserStoryComplexity as StoryComplexity,
  UserStoryStatus,
} from "@/mocks/backend/schema";
import type { User } from "@/types/user";

export type UserStoryPriority = "P1" | "P2" | "P3";
export type KanbanColumnId = "todo" | "doing" | "review" | "done" | (string & {});

export interface KanbanSprint {
  id: string;
  projectId: string;
  name: string;
  capacityHours: number;
  status: SprintStatus;
}

export interface KanbanTaskView {
  id: string;
  title: string;
  priority: UserStoryPriority;
  estimatedHours: number;
  doneHours: number;
  assignee: User;
}

export interface KanbanCommentView {
  id: string;
  author: User;
  body: string;
  type: "comment" | "note";
  createdAt: string;
  createdAtLabel: string;
}

export interface KanbanUserLabelView {
  id: string;
  name: string;
  color: string;
}

export interface KanbanCardView {
  id: string;
  title: string;
  persona: string;
  description: string;
  acceptanceCriteria: string[];
  effort: number;
  epicName: string;
  userLabels: KanbanUserLabelView[];
  priority: UserStoryPriority;
  businessValue: BusinessValue;
  complexity: StoryComplexity;
  dueDateISO: string;
  dueDateLabel: string;
  status: UserStoryStatus;
  kanbanStatus: KanbanColumnId;
  type: "US";
  assignee: User;
  estimatedHours: number;
  doneHours: number;
  createdAt: string;
  updatedAt: string;
  createdAtLabel: string;
  updatedAtLabel: string;
  linkedChips: string[];
  tasks: KanbanTaskView[];
  comments: KanbanCommentView[];
  searchText: string;
  position: number;
}

export interface KanbanColumnView {
  id: KanbanColumnId;
  /** Backend column id for API calls (moveCard, etc.). Set when using real API. */
  backendColumnId?: number;
  title: string;
  wipLabel: string;
  wipLimitHours: number | null;
  currentHours: number;
  helpText: string;
  cards: KanbanCardView[];
}

export interface KanbanBoardCardState {
  id: string;
  kanbanStatus: KanbanColumnId;
  position: number;
}

export interface KanbanBoardViewModel {
  sprint: KanbanSprint;
  columns: KanbanColumnView[];
  allCards: KanbanCardView[];
}

function mapRawColumnToViewId(columnName: string): KanbanColumnId {
  const normalizedName = columnName.toLowerCase();
  if (normalizedName.includes("review")) return "review";
  if (normalizedName.includes("doing")) return "doing";
  if (normalizedName.includes("done")) return "done";
  return "todo";
}

function buildKanbanSprint(projectId = roadmapProjectId, sprintId?: string): KanbanSprint {
  const sprintRow = sprintId
    ? getSprintRowById(sprintId)
    : getDefaultSprintForProject(projectId);

  if (!sprintRow) {
    throw new Error(`Missing sprint row for project ${projectId}.`);
  }

  return {
    id: sprintRow.id,
    projectId: sprintRow.project_id,
    name: sprintRow.name,
    capacityHours: sprintRow.capacity_hours ?? 0,
    status: sprintRow.status,
  };
}

function getBoardColumnsMeta(projectId = roadmapProjectId) {
  const defaultBoardRow = getDefaultBoardForProject(projectId);

  if (!defaultBoardRow) {
    throw new Error(`Missing default board for project ${projectId}.`);
  }

  const rawBoardColumns = getColumnsForBoard(defaultBoardRow.id);
  const viewColumnIdByRawColumnId = new Map<string, KanbanColumnId>(
    rawBoardColumns.map((column) => [column.id, mapRawColumnToViewId(column.name)]),
  );
  const columnMeta: Array<
    Pick<KanbanColumnView, "id" | "title" | "wipLimitHours" | "helpText">
  > = rawBoardColumns.map((column) => ({
    id: viewColumnIdByRawColumnId.get(column.id) ?? "todo",
    title: column.name,
    wipLimitHours: column.wip_limit,
    helpText:
      column.description ??
      "WIP (Work in Progress): limite em horas para manter o fluxo saudavel no board.",
  }));

  return {
    rawBoardColumns,
    viewColumnIdByRawColumnId,
    columnMeta,
  };
}

function formatDate(dateISO: string): string {
  return new Date(dateISO).toLocaleDateString("pt-BR");
}

function formatDateTime(dateISO: string): string {
  return new Date(dateISO).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBusinessValue(value: BusinessValue): string {
  if (value === "high") return "BV high";
  if (value === "medium") return "BV medium";
  return "BV low";
}

function formatPriorityTone(priority: UserStoryPriority): string {
  if (priority === "P1") return "high";
  if (priority === "P2") return "medium";
  return "low";
}

export function formatKanbanStoryStatus(status: UserStoryStatus): string {
  if (status === "in_progress") return "in progress";
  return status;
}

function buildKanbanCardView(
  rawColumnId: string,
  cardId: string,
  viewColumnIdByRawColumnId: Map<string, KanbanColumnId>,
): KanbanCardView {
  const columnId = viewColumnIdByRawColumnId.get(rawColumnId) ?? "todo";
  const rawCard = getCardsForColumn(rawColumnId).find((card) => card.id === cardId);

  if (!rawCard || !rawCard.user_story_id) {
    throw new Error(`Missing raw kanban card for ${cardId}`);
  }

  const story = getUserStoryRowById(rawCard.user_story_id);
  const epic = getEpicRowById(story.epic_id);
  const userLabels: KanbanUserLabelView[] = getLabelsForCard(rawCard.id).map(
    (label: LabelRow) => ({
      id: label.id,
      name: label.name,
      color: label.color,
    }),
  );
  const taskViews = getTasksForUserStory(story.id).map((task) => ({
    id: task.id,
    title: task.title,
    priority: priorityNumberToLabel(task.priority),
    estimatedHours: task.estimated_hours ?? 0,
    doneHours: task.actual_hours ?? 0,
    assignee: getUserById(
      task.assignee_id ?? story.assignee_id ?? "96cd4b95-acdf-4a62-9063-53292716b656",
    ),
  }));
  const commentViews: KanbanCommentView[] = getCommentsForCard(rawCard.id).map(
    (comment): KanbanCommentView => ({
      id: comment.id,
      author: getUserById(comment.user_id),
      body: comment.content,
      type: comment.parent_comment_id ? "note" : "comment",
      createdAt: comment.created_at,
      createdAtLabel: formatDateTime(comment.created_at),
    }),
  );
  const dueDateISO = rawCard.due_date ?? story.updated_at.slice(0, 10);
  const searchText = [
    rawCard.title,
    story.persona,
    rawCard.description ?? story.description,
    epic.name,
    ...userLabels.map((label) => label.name),
    ...taskViews.map((task) => task.title),
  ]
    .join(" ")
    .toLowerCase();

  return {
    id: rawCard.id,
    title: rawCard.title,
    persona: story.persona,
    description: rawCard.description ?? story.description,
    acceptanceCriteria: splitAcceptanceCriteria(story.acceptance_criteria),
    effort: story.effort ?? 0,
    epicName: epic.name,
    userLabels,
    priority: priorityNumberToLabel(story.priority),
    businessValue: story.business_value,
    complexity: story.complexity,
    dueDateISO,
    dueDateLabel: `Due ${formatDate(dueDateISO)}`,
    status: story.status,
    kanbanStatus: columnId,
    type: "US",
    assignee: getUserById(
      rawCard.assignee_id ?? story.assignee_id ?? "96cd4b95-acdf-4a62-9063-53292716b656",
    ),
    estimatedHours: rawCard.estimated_hours ?? 0,
    doneHours: rawCard.actual_hours ?? 0,
    createdAt: rawCard.created_at,
    updatedAt: rawCard.updated_at,
    createdAtLabel: formatDateTime(rawCard.created_at),
    updatedAtLabel: formatDateTime(rawCard.updated_at),
    linkedChips: [
      ...(rawCard.user_story_id ? ["US"] : []),
      ...(taskViews.length > 0 ? ["Task"] : []),
    ],
    tasks: taskViews,
    comments: commentViews,
    searchText,
    position: rawCard.position,
  };
}

function buildAllCards(
  projectId = roadmapProjectId,
  sprintId?: string,
): KanbanCardView[] {
  const sprint = buildKanbanSprint(projectId, sprintId);
  const sprintStoryIds = new Set(
    getSprintItemsForSprint(sprint.id).map((item) => item.user_story_id),
  );

  const { rawBoardColumns, viewColumnIdByRawColumnId } = getBoardColumnsMeta(projectId);

  return rawBoardColumns.flatMap((column) =>
    getCardsForColumn(column.id)
      .filter((card) => card.user_story_id && sprintStoryIds.has(card.user_story_id))
      .map((card) =>
        buildKanbanCardView(column.id, card.id, viewColumnIdByRawColumnId),
      ),
  );
}

export function buildKanbanBoardView(
  projectId = roadmapProjectId,
  sprintId?: string,
): KanbanBoardViewModel {
  const sprint = buildKanbanSprint(projectId, sprintId);
  const allCards = buildAllCards(projectId, sprint.id);
  const { columnMeta } = getBoardColumnsMeta(projectId);

  return {
    sprint,
    columns: buildKanbanColumns(allCards, columnMeta),
    allCards,
  };
}

export function buildInitialKanbanCardState(
  cards: KanbanCardView[],
): KanbanBoardCardState[] {
  return cards.map((card) => ({
    id: card.id,
    kanbanStatus: card.kanbanStatus,
    position: card.position,
  }));
}

export function buildKanbanColumns(
  cards: KanbanCardView[],
  columnMetaOverride?: Array<
    Pick<KanbanColumnView, "id" | "title" | "wipLimitHours" | "helpText">
  >,
): KanbanColumnView[] {
  const columnMeta = columnMetaOverride ?? getBoardColumnsMeta().columnMeta;

  return columnMeta.map((column) => {
    const columnCards = cards
      .filter((card) => card.kanbanStatus === column.id)
      .sort((left, right) => left.position - right.position);
    const currentHours = getColumnUsageHours(columnCards);
    const wipLabel =
      column.wipLimitHours === null
        ? `WIP ${currentHours}h`
        : `WIP ${currentHours}h / ${column.wipLimitHours}h`;

    return {
      ...column,
      currentHours,
      wipLabel,
      cards: columnCards,
    };
  });
}

export function getColumnUsageHours(cards: KanbanCardView[]): number {
  return cards.reduce((sum, card) => sum + card.estimatedHours, 0);
}

export function getColumnConfig(
  columnId: KanbanColumnId,
  projectId = roadmapProjectId,
) {
  const config = getBoardColumnsMeta(projectId).columnMeta.find(
    (column) => column.id === columnId,
  );

  if (!config) {
    throw new Error(`Missing Kanban column config for ${columnId}`);
  }

  return config;
}

export function getCardById(
  board: KanbanBoardViewModel,
  cardId: string | null,
): KanbanCardView | null {
  if (!cardId) {
    return null;
  }

  return board.allCards.find((card) => card.id === cardId) ?? null;
}

export function getCardSystemBadges(card: KanbanCardView): string[] {
  return [
    `Epic: ${card.epicName}`,
    `Priority: ${formatPriorityTone(card.priority)}`,
    card.dueDateLabel,
    `Est/Act: ${card.estimatedHours}h / ${card.doneHours}h`,
    `Effort: ${card.effort}`,
    formatBusinessValue(card.businessValue),
    formatKanbanStoryStatus(card.status),
    ...card.linkedChips,
  ];
}

export function getInlineCardSystemBadges(card: KanbanCardView): string[] {
  return [
    `Effort: ${card.effort}`,
    formatBusinessValue(card.businessValue),
    formatKanbanStoryStatus(card.status),
    formatDate(card.dueDateISO),
    ...card.linkedChips,
  ];
}
