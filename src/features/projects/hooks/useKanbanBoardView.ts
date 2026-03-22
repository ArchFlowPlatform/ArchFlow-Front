"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Sprint, SprintItem } from "@/types/sprint";
import type { BoardColumn, BoardCard } from "@/types/board";
import type { User } from "@/types/user";
import type {
  BusinessValue,
  UserStoryComplexity,
  UserStoryStatus,
} from "@/types/enums";
import { getCards } from "@/features/board/api/board-cards.api";
import { getCardLabels } from "@/features/card-labels/api/card-labels.api";
import { getLabels } from "@/features/labels/api/labels.api";
import { useBoardColumns } from "@/features/board/hooks/useBoardColumns";
import { useSprintItems } from "@/features/sprint-items/hooks/useSprintItems";
import { useBacklog } from "@/features/backlog/hooks/useBacklog";
import { useProject } from "@/features/projects/hooks/useProject";
import { getSprintItemUserStoryLabel } from "@/lib/sprint-item-label";
import { resolveUsersByIdCached } from "@/lib/users/resolve-assignee-names";
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
  if (value == null) return [];
  if (value === "") return [];
  // Preserve content exactly: keep empty lines and do not trim.
  // Split on both Unix and Windows newlines.
  return value.split(/\r?\n/);
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
  fallback: string,
  resolvedUsersById: Record<string, User>
): User {
  if (!assigneeId?.trim()) {
    return { id: "", name: fallback, email: "", type: "", avatarUrl: "", createdAt: "", updatedAt: "" } as User;
  }

  const resolved = resolvedUsersById[assigneeId];
  if (resolved?.name) return resolved;

  const m = members.find((x) => x.user?.id === assigneeId);
  if (m?.user) return m.user;

  return { id: assigneeId, name: "Sem responsável", email: "", type: "", avatarUrl: "", createdAt: "", updatedAt: "" } as User;
}

export interface UseKanbanBoardViewResult {
  view: KanbanBoardViewModel | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  /** Sprint items for current sprint (user stories in sprint scope). */
  sprintItems: SprintItem[];
}

/**
 * Step 7: `useBoardColumns` + `getCards` per column (same contract as `useBoardCards` per column).
 * After DnD, call `refetch()` so columns + card positions stay in sync with the API.
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
  const {
    items: sprintItems,
    loading: itemsLoading,
    refetch: refetchSprintItems,
  } = useSprintItems(projectId, sprintId);
  const { backlog } = useBacklog(projectId);
  const { project } = useProject(projectId);
  const [cardsByColumnId, setCardsByColumnId] = useState<Record<number, BoardCard[]>>({});
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cardsError, setCardsError] = useState<Error | null>(null);
  /** Card id string → labels for Kanban chips (same API as modal). */
  const [labelsByCardId, setLabelsByCardId] = useState<
    Record<string, KanbanUserLabelView[]>
  >({});

  const members = project?.members ?? [];
  const [resolvedUsersById, setResolvedUsersById] = useState<Record<string, User>>({});
  const [assigneesLoading, setAssigneesLoading] = useState(false);
  const epics = backlog?.epics ?? [];
  const epicNameByEpicId = new Map(epics.map((e) => [e.id, e.name]));
  const allStories = epics.flatMap((e) => e.userStories ?? []);

  const sprintItemIdByUserStoryId = useMemo(() => {
    const m = new Map<number, number>();
    for (const item of sprintItems) {
      m.set(item.userStoryId, item.id);
    }
    return m;
  }, [sprintItems]);

  const assigneeIdsToResolve = useMemo(() => {
    if (colsLoading || cardsLoading) return [];
    if (colsError || cardsError) return [];

    const ids = new Set<string>();
    for (const cards of Object.values(cardsByColumnId)) {
      for (const card of cards) {
        const story = card.userStory ?? allStories.find((s) => s.id === card.userStoryId);
        const id = story?.assigneeId;
        if (id?.trim()) ids.add(id);
      }
    }
    return Array.from(ids);
  }, [
    cardsByColumnId,
    allStories,
    colsLoading,
    cardsLoading,
    colsError,
    cardsError,
  ]);

  const assigneeIdsKey = useMemo(() => {
    return [...assigneeIdsToResolve].sort().join("|");
  }, [assigneeIdsToResolve]);

  const boardCardIdsKey = useMemo(() => {
    const ids: number[] = [];
    for (const cards of Object.values(cardsByColumnId)) {
      for (const c of cards) ids.push(c.id);
    }
    return [...new Set(ids)].sort((a, b) => a - b).join(",");
  }, [cardsByColumnId]);

  useEffect(() => {
    if (!projectId || boardCardIdsKey === "") {
      setLabelsByCardId({});
      return;
    }

    let cancelled = false;
    const numericIds = boardCardIdsKey
      .split(",")
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n));

    void (async () => {
      try {
        const projectLabels = await getLabels(projectId);
        const entries = await Promise.all(
          numericIds.map(async (cardId) => {
            try {
              const rows = await getCardLabels(projectId, cardId);
              const views: KanbanUserLabelView[] = rows.map((cl) => {
                const pl = projectLabels.find((l) => l.id === cl.labelId);
                return {
                  id: String(cl.id),
                  name: cl.label?.name ?? pl?.name ?? "—",
                  color: cl.label?.color ?? pl?.color ?? "#666",
                };
              });
              return [String(cardId), views] as const;
            } catch {
              return [String(cardId), [] as KanbanUserLabelView[]] as const;
            }
          }),
        );
        if (!cancelled) {
          setLabelsByCardId(Object.fromEntries(entries));
        }
      } catch {
        if (!cancelled) setLabelsByCardId({});
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId, boardCardIdsKey]);

  useEffect(() => {
    let cancelled = false;

    async function run(): Promise<void> {
      if (assigneeIdsToResolve.length === 0) {
        setAssigneesLoading(false);
        return;
      }

      setAssigneesLoading(true);
      try {
        const resolved = await resolveUsersByIdCached(assigneeIdsToResolve);
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
  }, [assigneeIdsKey, assigneeIdsToResolve]);

  const fetchCardsForColumns = useCallback(
    async (colIds: number[]) => {
      if (!projectId || !sprintId || colIds.length === 0) {
        setCardsByColumnId({});
        setCardsLoading(false);
        setCardsError(null);
        return;
      }
      setCardsLoading(true);
      setCardsError(null);
      try {
        const results = await Promise.all(
          colIds.map((cid) =>
            getCards(projectId, sprintId, cid).then((cards) => ({
              columnId: cid,
              cards,
            }))
          )
        );
        const map: Record<number, BoardCard[]> = {};
        for (const { columnId, cards } of results) map[columnId] = cards;
        setCardsByColumnId(map);
      } catch (e) {
        setCardsByColumnId({});
        setCardsError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setCardsLoading(false);
      }
    },
    [projectId, sprintId]
  );

  useEffect(() => {
    if (!projectId || !sprintId) {
      setCardsByColumnId({});
      setCardsLoading(false);
      setCardsError(null);
      return;
    }
    const ids = columns.map((c) => c.id);
    if (ids.length === 0) {
      setCardsByColumnId({});
      setCardsLoading(false);
      setCardsError(null);
      return;
    }
    void fetchCardsForColumns(ids);
  }, [projectId, sprintId, columns, fetchCardsForColumns]);

  const refetch = useCallback(async () => {
    await refetchSprintItems();
    const cols = await refetchCols();
    if (cols.length > 0) {
      await fetchCardsForColumns(cols.map((c) => c.id));
    } else {
      setCardsByColumnId({});
      setCardsError(null);
    }
  }, [refetchSprintItems, refetchCols, fetchCardsForColumns]);

  const loading = colsLoading || cardsLoading || assigneesLoading || itemsLoading;
  const error = colsError ?? cardsError;

  const view = useMemo<KanbanBoardViewModel | null>(() => {
    if (!sprint || !projectId || !sprintId) return null;
    if (colsLoading || cardsLoading || assigneesLoading || itemsLoading) return null;
    if (colsError || cardsError) return null;

    const sortedColumns = [...columns].sort((a, b) => a.position - b.position);
    const allCards: KanbanCardView[] = [];

    for (const col of sortedColumns) {
      const viewId: KanbanColumnId = `col-${col.id}` as KanbanColumnId;
      const colCards = cardsByColumnId[col.id] ?? [];

      for (const card of colCards) {
        const cardKey = String(card.id);
        const cardLabelViews = labelsByCardId[cardKey] ?? [];
        const story = card.userStory ?? allStories.find((s) => s.id === card.userStoryId);
        const sprintItemId =
          sprintItemIdByUserStoryId.get(card.userStoryId) ?? null;

        if (!story) {
          const sprintItem = sprintItems.find(
            (si) => si.userStoryId === card.userStoryId,
          );
          const fallbackTitle = sprintItem
            ? getSprintItemUserStoryLabel(sprintItem)
            : "User story indisponível no backlog do projeto";

          allCards.push({
            id: cardKey,
            userStoryId: card.userStoryId,
            sprintItemId,
            title: fallbackTitle,
            persona: "",
            description: "",
            acceptanceCriteria: [],
            effort: 0,
            epicName: "—",
            userLabels: cardLabelViews,
            priority: "P3",
            businessValue: "medium" as BusinessValue,
            complexity: "medium" as UserStoryComplexity,
            dueDateISO: "",
            dueDateLabel: "",
            status: "draft" as UserStoryStatus,
            kanbanStatus: viewId,
            type: "US",
            assignee: resolveUser(
              null,
              members,
              "Sem responsável",
              resolvedUsersById,
            ),
            estimatedHours: 0,
            doneHours: 0,
            createdAt: card.createdAt,
            updatedAt: card.updatedAt,
            createdAtLabel: formatDateTime(card.createdAt),
            updatedAtLabel: formatDateTime(card.updatedAt),
            linkedChips: ["US"],
            tasks: [],
            comments: [],
            searchText: [
              fallbackTitle,
              String(card.userStoryId),
              ...cardLabelViews.map((l) => l.name),
            ]
              .join(" ")
              .toLowerCase(),
            position: card.position,
          } as KanbanCardView);
          continue;
        }

        const epicName = epicNameByEpicId.get(story.epicId) ?? "—";
        const assignee = resolveUser(
          story.assigneeId,
          members,
          "Sem responsável",
          resolvedUsersById,
        );
        const dueDate = card.updatedAt?.slice(0, 10) ?? story.updatedAt?.slice(0, 10) ?? "";
        const searchText = [
          story.title,
          story.persona,
          story.description,
          epicName,
          ...cardLabelViews.map((l) => l.name),
        ]
          .join(" ")
          .toLowerCase();

        allCards.push({
          id: cardKey,
          userStoryId: card.userStoryId,
          sprintItemId,
          title: story.title,
          persona: story.persona ?? "",
          description: story.description ?? "",
          acceptanceCriteria: splitAcceptanceCriteria(story.acceptanceCriteria),
          effort: story.effort ?? 0,
          epicName,
          userLabels: cardLabelViews,
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
  }, [
    columns,
    cardsByColumnId,
    sprint,
    colsLoading,
    cardsLoading,
    assigneesLoading,
    itemsLoading,
    colsError,
    cardsError,
    epics,
    members,
    resolvedUsersById,
    sprintItemIdByUserStoryId,
    sprintItems,
    projectId,
    sprintId,
    labelsByCardId,
  ]);

  return { view, loading, error, refetch, sprintItems };
}
