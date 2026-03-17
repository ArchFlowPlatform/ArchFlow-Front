"use client";

import { useCallback, useEffect, useState } from "react";
import type { Sprint } from "@/types/sprint";
import type { BoardColumn, BoardCard } from "@/types/board";
import type { User } from "@/types/user";
import type {
  BusinessValue,
  UserStoryComplexity,
  UserStoryStatus,
} from "@/types/enums";
import { getCards } from "@/features/board/api/board-cards.api";
import { useBoardColumns } from "@/features/board/hooks/useBoardColumns";
import { useBacklog } from "@/features/backlog/hooks/useBacklog";
import { useProject } from "@/features/projects/hooks/useProject";
import type {
  KanbanBoardViewModel,
  KanbanCardView,
  KanbanColumnView,
  KanbanColumnId,
  KanbanSprint,
  KanbanUserLabelView,
  UserStoryPriority,
} from "../mocks/kanban.mock";

function priorityNumberToLabel(priority: number): UserStoryPriority {
  if (priority <= 1) return "P1";
  if (priority === 2) return "P2";
  return "P3";
}

function splitAcceptanceCriteria(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split("\n").map((l) => l.trim()).filter(Boolean);
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

function resolveUser(
  assigneeId: string | null,
  members: { user?: User }[],
  fallback: string
): User {
  if (!assigneeId?.trim()) {
    return { id: "", name: fallback, email: "", type: "", avatarUrl: "", createdAt: "", updatedAt: "" } as User;
  }
  const m = members.find((x) => x.user?.id === assigneeId);
  if (m?.user) return m.user;
  return { id: assigneeId, name: "—", email: "", type: "", avatarUrl: "", createdAt: "", updatedAt: "" } as User;
}

export interface UseKanbanBoardViewResult {
  view: KanbanBoardViewModel | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Aggregated hook: fetches board columns, cards per column, backlog (epic/story), project (assignees).
 * Builds KanbanBoardViewModel for KanbanPage.
 */
export function useKanbanBoardView(
  projectId: string | null,
  sprintId: string | null,
  sprint: Sprint | null
): UseKanbanBoardViewResult {
  const { columns, loading: colsLoading, error: colsError, refetch: refetchCols } = useBoardColumns(
    projectId,
    sprintId
  );
  const { backlog } = useBacklog(projectId);
  const { project } = useProject(projectId);
  const [cardsByColumnId, setCardsByColumnId] = useState<Record<number, BoardCard[]>>({});

  const members = project?.members ?? [];
  const epics = backlog?.epics ?? [];
  const epicNameByEpicId = new Map(epics.map((e) => [e.id, e.name]));
  const allStories = epics.flatMap((e) => e.userStories ?? []);

  const fetchCardsForColumns = useCallback(
    async (colIds: number[]) => {
      if (!projectId || !sprintId || colIds.length === 0) {
        setCardsByColumnId({});
        return;
      }
      try {
        const results = await Promise.all(
          colIds.map((cid) => getCards(projectId, sprintId, cid).then((cards) => ({ columnId: cid, cards })))
        );
        const map: Record<number, BoardCard[]> = {};
        for (const { columnId, cards } of results) map[columnId] = cards;
        setCardsByColumnId(map);
      } catch {
        setCardsByColumnId({});
      }
    },
    [projectId, sprintId]
  );

  useEffect(() => {
    if (columns.length > 0) {
      fetchCardsForColumns(columns.map((c) => c.id));
    } else {
      setCardsByColumnId({});
    }
  }, [columns, fetchCardsForColumns]);

  const refetch = useCallback(() => refetchCols(), [refetchCols]);

  const loading = colsLoading;
  const error = colsError;

  const view: KanbanBoardViewModel | null = (() => {
    if (!sprint || !projectId || !sprintId) return null;
    if (colsLoading || error) return null;

    const sortedColumns = [...columns].sort((a, b) => a.position - b.position);
    const allCards: KanbanCardView[] = [];

    for (const col of sortedColumns) {
      const viewId: KanbanColumnId = `col-${col.id}` as KanbanColumnId;
      const colCards = cardsByColumnId[col.id] ?? [];

      for (const card of colCards) {
        const story = card.userStory ?? allStories.find((s) => s.id === card.userStoryId);
        if (!story) continue;

        const epicName = epicNameByEpicId.get(story.epicId) ?? "—";
        const assignee = resolveUser(story.assigneeId, members, "Sem responsável");
        const dueDate = card.updatedAt?.slice(0, 10) ?? story.updatedAt?.slice(0, 10) ?? "";
        const searchText = [
          story.title,
          story.persona,
          story.description,
          epicName,
        ]
          .join(" ")
          .toLowerCase();

        allCards.push({
          id: String(card.id),
          title: story.title,
          persona: story.persona ?? "",
          description: story.description ?? "",
          acceptanceCriteria: splitAcceptanceCriteria(story.acceptanceCriteria),
          effort: story.effort ?? 0,
          epicName,
          userLabels: [] as KanbanUserLabelView[],
          priority: priorityNumberToLabel(story.priority),
          businessValue: (story.businessValue ?? "medium") as BusinessValue,
          complexity: (story.complexity ?? "medium") as UserStoryComplexity,
          dueDateISO: dueDate,
          dueDateLabel: dueDate ? `Due ${formatDate(dueDate)}` : "",
          status: (story.status ?? "draft") as UserStoryStatus,
          kanbanStatus: viewId,
          type: "US",
          assignee,
          estimatedHours: story.effort ?? 0,
          doneHours: 0,
          createdAt: card.createdAt,
          updatedAt: card.updatedAt,
          createdAtLabel: formatDateTime(card.createdAt),
          updatedAtLabel: formatDateTime(card.updatedAt),
          linkedChips: ["US"],
          tasks: [],
          comments: [],
          searchText,
          position: card.position,
        } as KanbanCardView);
      }
    }

    const columnViews: KanbanColumnView[] = sortedColumns.map((col) => {
      const viewId: KanbanColumnId = `col-${col.id}` as KanbanColumnId;
      const colCards = allCards
        .filter((c) => c.kanbanStatus === viewId)
        .sort((a, b) => a.position - b.position);
      const currentHours = colCards.reduce((s, c) => s + c.estimatedHours, 0);
      const wipLimit = col.wipLimit;
      const wipLabel =
        wipLimit == null
          ? `WIP ${currentHours}h`
          : `WIP ${currentHours}h / ${wipLimit}h`;

      return {
        id: viewId,
        backendColumnId: col.id,
        title: col.name,
        wipLabel,
        wipLimitHours: wipLimit,
        currentHours,
        helpText: col.description ?? "WIP: limite em horas para manter o fluxo saudável.",
        cards: colCards,
      };
    });

    const sprintView: KanbanSprint = {
      id: sprint.id,
      projectId: sprint.projectId,
      name: sprint.name,
      capacityHours: sprint.capacityHours,
      status: sprint.status as "planned" | "active" | "completed",
    };

    return {
      sprint: sprintView,
      columns: columnViews,
      allCards,
    } as KanbanBoardViewModel;
  })();

  return { view, loading, error, refetch };
}
