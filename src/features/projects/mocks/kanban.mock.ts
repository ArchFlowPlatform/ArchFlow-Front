/**
 * Kanban view-model types and pure utility functions.
 *
 * Mock data builders (`buildKanbanBoardView`, etc.) are gated behind
 * `NEXT_PUBLIC_USE_MOCKS=true` and use lazy `require()` to avoid bundling
 * backend mock tables in production.
 */
import { USE_MOCKS } from "@/lib/env";
import type { User } from "@/types/user";

// ── Type aliases (used only by mock builders, kept local) ───

type BusinessValue = "high" | "medium" | "low";
type SprintStatus = "planned" | "active" | "completed" | "cancelled";
type StoryComplexity = "low" | "medium" | "high" | "very_high";
type UserStoryStatus = "draft" | "ready" | "in_progress" | "done";

// ── Exported types ──────────────────────────────────────────

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

// ── Pure utility functions (used by production code) ────────

function formatDate(dateISO: string): string {
  return new Date(dateISO).toLocaleDateString("pt-BR");
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

export function buildKanbanColumns(
  cards: KanbanCardView[],
  columnMeta: Array<
    Pick<KanbanColumnView, "id" | "title" | "wipLimitHours" | "helpText">
  >,
): KanbanColumnView[] {
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

export function getCardById(
  board: KanbanBoardViewModel,
  cardId: string | null,
): KanbanCardView | null {
  if (!cardId) return null;
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

export function buildInitialKanbanCardState(
  cards: KanbanCardView[],
): KanbanBoardCardState[] {
  return cards.map((card) => ({
    id: card.id,
    kanbanStatus: card.kanbanStatus,
    position: card.position,
  }));
}

// ── Mock-only builders (gated behind NEXT_PUBLIC_USE_MOCKS) ─

function assertMocksEnabled(caller: string): void {
  if (!USE_MOCKS) {
    throw new Error(
      `${caller}() requires NEXT_PUBLIC_USE_MOCKS=true. ` +
        "Production code should use real API hooks instead.",
    );
  }
}

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
function getMockBackend() {
  assertMocksEnabled("getMockBackend");
  const rawData = require("@/mocks/backend/rawData") as {
    roadmapProjectId: string;
  };
  const selectors = require("@/mocks/backend/selectors") as {
    getCardsForColumn: (columnId: string) => Array<Record<string, unknown>>;
    getColumnsForBoard: (boardId: string) => Array<Record<string, unknown>>;
    getCommentsForCard: (cardId: string) => Array<Record<string, unknown>>;
    getDefaultBoardForProject: (projectId: string) => Record<string, unknown> | undefined;
    getDefaultSprintForProject: (projectId: string) => Record<string, unknown> | undefined;
    getEpicRowById: (epicId: string) => Record<string, unknown>;
    getLabelsForCard: (cardId: string) => Array<{ id: string; name: string; color: string }>;
    getSprintItemsForSprint: (sprintId: string) => Array<Record<string, unknown>>;
    getSprintRowById: (sprintId: string) => Record<string, unknown>;
    getTasksForUserStory: (storyId: string) => Array<Record<string, unknown>>;
    getUserById: (userId: string) => User;
    getUserStoryRowById: (storyId: string) => Record<string, unknown>;
    priorityNumberToLabel: (n: number) => UserStoryPriority;
    splitAcceptanceCriteria: (value: string) => string[];
  };
  return { ...rawData, ...selectors };
}
/* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */

function mapRawColumnToViewId(columnName: string): KanbanColumnId {
  const n = columnName.toLowerCase();
  if (n.includes("review")) return "review";
  if (n.includes("doing")) return "doing";
  if (n.includes("done")) return "done";
  return "todo";
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

export function buildKanbanBoardView(
  projectId?: string,
  sprintId?: string,
): KanbanBoardViewModel {
  assertMocksEnabled("buildKanbanBoardView");
  const mock = getMockBackend();
  const pid = projectId ?? mock.roadmapProjectId;

  const sprintRow = sprintId
    ? mock.getSprintRowById(sprintId)
    : mock.getDefaultSprintForProject(pid);
  if (!sprintRow) throw new Error(`Missing sprint row for project ${pid}.`);

  const sprint: KanbanSprint = {
    id: sprintRow.id as string,
    projectId: (sprintRow as Record<string, unknown>).project_id as string,
    name: sprintRow.name as string,
    capacityHours: ((sprintRow as Record<string, unknown>).capacity_hours as number) ?? 0,
    status: sprintRow.status as SprintStatus,
  };

  const board = mock.getDefaultBoardForProject(pid);
  if (!board) throw new Error(`Missing default board for project ${pid}.`);

  const rawColumns = mock.getColumnsForBoard(board.id as string);
  const viewIdMap = new Map<string, KanbanColumnId>(
    rawColumns.map((c) => [c.id as string, mapRawColumnToViewId(c.name as string)]),
  );
  const columnMeta = rawColumns.map((c) => ({
    id: viewIdMap.get(c.id as string) ?? "todo" as KanbanColumnId,
    title: c.name as string,
    wipLimitHours: (c.wip_limit as number | null) ?? null,
    helpText: (c.description as string) ?? "WIP: limite em horas para manter o fluxo saudavel no board.",
  }));

  const sprintStoryIds = new Set(
    mock.getSprintItemsForSprint(sprint.id).map((i) => i.user_story_id as string),
  );

  const allCards: KanbanCardView[] = rawColumns.flatMap((col) =>
    mock.getCardsForColumn(col.id as string)
      .filter((card) => card.user_story_id && sprintStoryIds.has(card.user_story_id as string))
      .map((rawCard): KanbanCardView => {
        const colId = viewIdMap.get(col.id as string) ?? "todo";
        const story = mock.getUserStoryRowById(rawCard.user_story_id as string);
        const epic = mock.getEpicRowById(story.epic_id as string);
        const labels = mock.getLabelsForCard(rawCard.id as string).map((l) => ({
          id: l.id,
          name: l.name,
          color: l.color,
        }));
        const tasks = mock.getTasksForUserStory((story as Record<string, unknown>).id as string).map((t) => ({
          id: t.id as string,
          title: t.title as string,
          priority: mock.priorityNumberToLabel(t.priority as number),
          estimatedHours: (t.estimated_hours as number) ?? 0,
          doneHours: (t.actual_hours as number) ?? 0,
          assignee: mock.getUserById(
            (t.assignee_id as string) ?? (story.assignee_id as string) ?? "96cd4b95-acdf-4a62-9063-53292716b656",
          ),
        }));
        const comments = mock.getCommentsForCard(rawCard.id as string).map(
          (c): KanbanCommentView => ({
            id: c.id as string,
            author: mock.getUserById(c.user_id as string),
            body: c.content as string,
            type: c.parent_comment_id ? "note" : "comment",
            createdAt: c.created_at as string,
            createdAtLabel: formatDateTime(c.created_at as string),
          }),
        );
        const due = (rawCard.due_date as string) ?? (story.updated_at as string).slice(0, 10);
        const searchText = [
          rawCard.title,
          story.persona,
          rawCard.description ?? story.description,
          epic.name,
          ...labels.map((l) => l.name),
          ...tasks.map((t) => t.title),
        ].join(" ").toLowerCase();

        return {
          id: rawCard.id as string,
          title: rawCard.title as string,
          persona: story.persona as string,
          description: (rawCard.description ?? story.description) as string,
          acceptanceCriteria: mock.splitAcceptanceCriteria(
            (story.acceptance_criteria as string) ?? "",
          ),
          effort: (story.effort as number) ?? 0,
          epicName: epic.name as string,
          userLabels: labels,
          priority: mock.priorityNumberToLabel(story.priority as number),
          businessValue: story.business_value as BusinessValue,
          complexity: story.complexity as StoryComplexity,
          dueDateISO: due,
          dueDateLabel: `Due ${formatDate(due)}`,
          status: story.status as UserStoryStatus,
          kanbanStatus: colId,
          type: "US",
          assignee: mock.getUserById(
            (rawCard.assignee_id as string) ?? (story.assignee_id as string) ?? "96cd4b95-acdf-4a62-9063-53292716b656",
          ),
          estimatedHours: (rawCard.estimated_hours as number) ?? 0,
          doneHours: (rawCard.actual_hours as number) ?? 0,
          createdAt: rawCard.created_at as string,
          updatedAt: rawCard.updated_at as string,
          createdAtLabel: formatDateTime(rawCard.created_at as string),
          updatedAtLabel: formatDateTime(rawCard.updated_at as string),
          linkedChips: [
            ...(rawCard.user_story_id ? ["US"] : []),
            ...(tasks.length > 0 ? ["Task"] : []),
          ],
          tasks,
          comments,
          searchText,
          position: rawCard.position as number,
        };
      }),
  );

  return {
    sprint,
    columns: buildKanbanColumns(allCards, columnMeta),
    allCards,
  };
}

export function getColumnConfig(
  columnId: KanbanColumnId,
  projectId?: string,
) {
  assertMocksEnabled("getColumnConfig");
  const mock = getMockBackend();
  const pid = projectId ?? mock.roadmapProjectId;
  const board = mock.getDefaultBoardForProject(pid);
  if (!board) throw new Error(`Missing default board for project ${pid}.`);
  const rawColumns = mock.getColumnsForBoard(board.id as string);
  const mapped = rawColumns.map((c) => ({
    id: mapRawColumnToViewId(c.name as string),
    title: c.name as string,
    wipLimitHours: (c.wip_limit as number | null) ?? null,
    helpText: (c.description as string) ?? "",
  }));
  const config = mapped.find((c) => c.id === columnId);
  if (!config) throw new Error(`Missing Kanban column config for ${columnId}`);
  return config;
}
