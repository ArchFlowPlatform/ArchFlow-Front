"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import ProjectShell from "@/components/layout/ProjectShell";
import { useProjectSprint } from "@/contexts/ProjectSprintContext";
import ProjectEmptyState from "@/components/projects/ProjectEmptyState";
import KanbanColumn from "@/components/kanban/KanbanColumn";
import KanbanModal from "@/components/kanban/KanbanModal";
import { authUserToUser } from "@/features/auth/types/auth.types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useProject } from "../hooks/useProject";
import { useKanbanBoardView } from "../hooks/useKanbanBoardView";
import {
  buildKanbanColumns,
  getColumnUsageHours,
  getCardById,
  type KanbanBoardCardState,
  type KanbanColumnId,
  type KanbanColumnView,
} from "../mocks/kanban.mock";

interface KanbanPageProps {
  projectId?: string;
}

function getColumnConfigFromView(
  columns: KanbanColumnView[],
  columnId: KanbanColumnId
): KanbanColumnView | undefined {
  return columns.find((c) => c.id === columnId);
}

export default function KanbanPage({ projectId }: KanbanPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);
  const [cardState, setCardState] = useState<KanbanBoardCardState[]>([]);

  const effectiveProjectId = projectId ?? "";
  const { user } = useAuth();
  const { project } = useProject(effectiveProjectId || null);
  const { sprints, selectedSprintId, selectedSprint } = useProjectSprint(
    effectiveProjectId || ""
  );
  const { view, loading, error, refetch } = useKanbanBoardView(
    effectiveProjectId || null,
    selectedSprintId,
    selectedSprint
  );

  const placeholderUser = authUserToUser(user) ?? { id: "", name: "—", email: "", type: "", avatarUrl: "", createdAt: "", updatedAt: "" };
  const projectName = project?.name ?? "…";
  const projectOwner = project?.owner ?? placeholderUser;
  const projectBadgeLabel = project ? String(project.members.length) : "0";

  const baseBoard = view ?? null;
  const columnMeta = useMemo(
    () =>
      baseBoard
        ? baseBoard.columns.map(({ id, title, wipLimitHours, helpText }) => ({
            id,
            title,
            wipLimitHours,
            helpText,
          }))
        : [],
    [baseBoard]
  );

  const boardCards = useMemo(
    () =>
      baseBoard
        ? baseBoard.allCards.map((card) => {
            const state = cardState.find((entry) => entry.id === card.id);
            return {
              ...card,
              kanbanStatus: state?.kanbanStatus ?? card.kanbanStatus,
              position: state?.position ?? card.position,
            };
          })
        : [],
    [baseBoard, cardState]
  );

  const filteredCards = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return boardCards.filter(
      (card) => !query || card.searchText.includes(query)
    );
  }, [boardCards, searchTerm]);

  const filteredColumns = useMemo(
    () => buildKanbanColumns(filteredCards, columnMeta),
    [columnMeta, filteredCards]
  );

  const fullBoardForCard = useMemo(
    () =>
      baseBoard
        ? {
            ...baseBoard,
            allCards: boardCards,
            columns: buildKanbanColumns(boardCards, columnMeta),
          }
        : null,
    [baseBoard, boardCards, columnMeta]
  );

  const selectedCard =
    fullBoardForCard && selectedCardId
      ? getCardById(fullBoardForCard, selectedCardId)
      : null;

  useEffect(() => {
    if (!baseBoard?.allCards) return;
    setCardState(
      baseBoard.allCards.map((card) => ({
        id: card.id,
        kanbanStatus: card.kanbanStatus,
        position: card.position,
      }))
    );
    setSelectedCardId(null);
    setDraggingCardId(null);
  }, [baseBoard]);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const handleDropCard = useCallback(
    async (cardId: string, targetColumnId: KanbanColumnId) => {
      if (!baseBoard) return;
      const movingCard = boardCards.find((card) => card.id === cardId);
      if (!movingCard) {
        setDraggingCardId(null);
        return;
      }

      if (movingCard.kanbanStatus === targetColumnId) {
        setDraggingCardId(null);
        return;
      }

      const targetColumn = getColumnConfigFromView(
        baseBoard.columns,
        targetColumnId
      );
      const targetCards = boardCards.filter(
        (card) => card.id !== cardId && card.kanbanStatus === targetColumnId
      );
      const currentHours = getColumnUsageHours(targetCards);
      const nextHours = currentHours + movingCard.estimatedHours;

      if (
        targetColumn &&
        targetColumn.wipLimitHours !== null &&
        nextHours > targetColumn.wipLimitHours
      ) {
        setToast({
          title: "WIP limit exceeded",
          body: `This column is limited to ${targetColumn.wipLimitHours}h. Moving this item would increase WIP to ${nextHours}h. Reduce work in progress or move it to another column.`,
        });
        setDraggingCardId(null);
        return;
      }

      const sourceColumn = baseBoard.columns.find(
        (c) => c.id === movingCard.kanbanStatus
      );
      const targetBackendColumnId = targetColumn?.backendColumnId;
      const sourceBackendColumnId = sourceColumn?.backendColumnId;

      if (
        !effectiveProjectId ||
        !selectedSprintId ||
        sourceBackendColumnId == null ||
        targetBackendColumnId == null
      ) {
        setDraggingCardId(null);
        return;
      }

      try {
        const { moveCard } = await import(
          "@/features/board/api/board-cards.api"
        );
        await moveCard(
          effectiveProjectId,
          selectedSprintId,
          sourceBackendColumnId,
          Number(cardId),
          { targetColumnId: targetBackendColumnId }
        );
        await refetch();
      } catch {
        setToast({
          title: "Failed to move card",
          body: "Could not update the card position. Please try again.",
        });
      } finally {
        setDraggingCardId(null);
      }
    },
    [baseBoard, boardCards, effectiveProjectId, selectedSprintId, refetch]
  );

  if (!sprints.length || !selectedSprintId) {
    return (
      <ProjectShell
        projectId={effectiveProjectId}
        projectName={projectName}
        projectOwner={projectOwner}
        projectBadgeLabel={projectBadgeLabel}
        activeNavItem="kanban"
        pageTitle="Kanban"
        pageSubtitle="This project does not have any sprints yet."
        currentUser={placeholderUser}
        fullWidthMain
        mainColumn={
          <ProjectEmptyState
            title="This project does not have any sprints yet."
            description="Create a sprint to organize cards, track delivery flow, and visualize work in progress."
            actionLabel="Create sprint"
          />
        }
      />
    );
  }

  if (loading && !view) {
    return (
      <ProjectShell
        projectId={effectiveProjectId}
        projectName={projectName}
        projectOwner={projectOwner}
        projectBadgeLabel={projectBadgeLabel}
        activeNavItem="kanban"
        pageTitle="Kanban"
        pageSubtitle="Loading board…"
        currentUser={placeholderUser}
        fullWidthMain
        mainColumn={
          <div className="af-surface-lg flex items-center justify-center bg-[#14121a]/70 px-4 py-8">
            <p className="af-text-secondary text-sm">Carregando…</p>
          </div>
        }
      />
    );
  }

  if (error || !view) {
    return (
      <ProjectShell
        projectId={effectiveProjectId}
        projectName={projectName}
        projectOwner={projectOwner}
        projectBadgeLabel={projectBadgeLabel}
        activeNavItem="kanban"
        pageTitle="Kanban"
        pageSubtitle="Unable to load board."
        currentUser={placeholderUser}
        fullWidthMain
        mainColumn={
          <ProjectEmptyState
            title="Failed to load board."
            description={error?.message ?? "Unknown error"}
            actionLabel="Retry"
          />
        }
      />
    );
  }

  return (
    <ProjectShell
      projectId={effectiveProjectId}
      projectName={projectName}
      projectOwner={projectOwner}
      projectBadgeLabel={projectBadgeLabel}
      activeNavItem="kanban"
      pageTitle="Kanban"
      pageSubtitle="Fluxo visual das user stories em andamento no sprint."
      pageContextLabel={`${selectedSprint?.name ?? baseBoard.sprint.name} - Kanban`}
      currentUser={placeholderUser}
      showSearch
      searchPlaceholder="Buscar por epic, story, tarefa..."
      searchValue={searchTerm}
      onSearchChange={(v) => setSearchTerm(v)}
      fullWidthMain
      mainColumn={
        baseBoard.allCards.length === 0 ? (
          <ProjectEmptyState
            title="No cards available."
            description="This sprint board is empty. Add cards to start tracking stories and task flow."
            actionLabel="Add card"
          />
        ) : (
          <>
            {toast ? (
              <div className="pointer-events-none fixed right-5 top-5 z-40 w-full max-w-sm">
                <div className="af-surface-lg af-accent-panel bg-[#14121a]/95 px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.35)]">
                  <p className="text-sm font-semibold text-white">
                    {toast.title}
                  </p>
                  <p className="af-text-secondary mt-1 text-xs leading-relaxed">
                    {toast.body}
                  </p>
                </div>
              </div>
            ) : null}

            <section className="min-h-0">
              <div className="overflow-x-auto overflow-y-hidden pb-2">
                <div className="flex min-h-[calc(100dvh-14rem)] items-stretch gap-3">
                  {filteredColumns.map((column) => (
                    <KanbanColumn
                      key={column.id}
                      column={column}
                      onOpenCard={setSelectedCardId}
                      draggingCardId={draggingCardId}
                      onDragStartCard={setDraggingCardId}
                      onDragEndCard={() => setDraggingCardId(null)}
                      onDropCard={handleDropCard}
                    />
                  ))}

                  <section className="af-surface-lg flex h-full min-h-0 w-[16rem] shrink-0 flex-col bg-[#14121a]/45">
                    <div className="af-separator-b px-3 py-3">
                      <button
                        type="button"
                        className="af-focus-ring af-accent-hover af-text-secondary inline-flex w-full items-center gap-2 px-2 py-2 text-sm transition hover:bg-white/[0.03] hover:text-[var(--accent-soft-35)]"
                      >
                        <Plus
                          className="af-accent-icon h-4 w-4"
                          aria-hidden="true"
                        />
                        <span>Adicionar outra coluna</span>
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </section>

            <KanbanModal
              projectId={effectiveProjectId}
              card={selectedCard}
              onClose={() => setSelectedCardId(null)}
            />
          </>
        )
      }
    />
  );
}
