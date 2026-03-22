"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import ProjectShell from "@/components/layout/ProjectShell";
import { useProjectSprint } from "@/contexts/ProjectSprintContext";
import ProjectEmptyState from "@/components/projects/ProjectEmptyState";
import InlineToast from "@/components/ui/InlineToast";
import SelectDropdown from "@/components/ui/SelectDropdown";
import StorySprintCard from "@/components/sprint-backlog/StorySprintCard";
import WorkloadPanel from "@/components/sprint-backlog/WorkloadPanel";
import { authUserToUser } from "@/features/auth/types/auth.types";
import { useAuth } from "@/features/auth/context/AuthContext";
import CreateSprintModal from "@/components/sprint/CreateSprintModal";
import { createSprintItem, deleteSprintItem } from "@/features/sprint-items/api/sprint-items.api";
import {
  createTask,
  deleteTask,
  updateTask,
} from "@/features/story-tasks/api/story-tasks.api";
import { useToast } from "@/hooks/useToast";
import type { StoryTaskStatus } from "@/lib/story-task-status";
import { useProject } from "../hooks/useProject";
import { useSprintBacklogView } from "../hooks/useSprintBacklogView";
import type {
  AssigneeWorkloadView,
  StoryTaskRowView,
} from "../mocks/sprintBacklog.mock";

interface SprintBacklogPageProps {
  projectId?: string;
}

function formatDate(dateISO: string): string {
  const date = new Date(dateISO);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function buildPeriodLabel(startDate: string, endDate: string): string {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function formatLoadLabel(weightRatio: number): string {
  if (weightRatio >= 0.45) return "Alta";
  if (weightRatio >= 0.25) return "Média";
  return "Baixa";
}

export default function SprintBacklogPage({
  projectId,
}: SprintBacklogPageProps) {
  const [query, setQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [addStoryId, setAddStoryId] = useState("");
  const { toast, showError } = useToast();

  const effectiveProjectId = projectId ?? "";
  const { user } = useAuth();
  const { project } = useProject(effectiveProjectId || null);
  const {
    sprints,
    selectedSprintId,
    selectedSprint,
    loading: sprintsLoading,
    refetchSprints,
    setSelectedSprintId,
  } = useProjectSprint(effectiveProjectId || "");
  const { view, loading, error, refetch, availableBacklogStories } =
    useSprintBacklogView(
      effectiveProjectId || null,
      selectedSprintId,
      selectedSprint,
      project?.members ?? [],
      !sprintsLoading
    );

  const runWithRefetch = useCallback(
    async (action: () => Promise<void>) => {
      setMutating(true);
      try {
        await action();
        await refetch();
      } catch (e) {
        showError(e instanceof Error ? e.message : String(e));
      } finally {
        setMutating(false);
      }
    },
    [refetch]
  );

  const placeholderUser = authUserToUser(user) ?? { id: "", name: "—", email: "", type: "", avatarUrl: "", createdAt: "", updatedAt: "" };
  const projectName = project?.name ?? "…";
  const projectOwnerName = project?.ownerName ?? "—";
  const projectBadgeLabel = project ? String(project.members.length) : "0";

  const stories = view?.stories ?? [];
  const sprint = view?.sprint ?? null;
  const periodLabel = sprint ? buildPeriodLabel(sprint.startDate, sprint.endDate) : "";
  const sprintStatusLabel =
    sprint?.status === "active"
      ? "active"
      : sprint?.status === "completed"
        ? "completed"
        : "planned";
  const normalizedQuery = query.trim().toLowerCase();

  const filteredStories = useMemo(
    () =>
      stories.filter(
        (story) =>
          !normalizedQuery ||
          [
            story.title,
            story.description,
            story.acceptanceCriteria,
            story.epicName,
            story.assignee.name,
            ...(story.tasks ?? []).flatMap((task) => [
              task.title,
              task.description,
              task.assignee.name,
            ]),
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
      ),
    [normalizedQuery, stories]
  );

  const filteredAssignees = useMemo(() => {
    const allTasks = filteredStories.flatMap((story) => story.tasks ?? []);
    const totalEstimatedHours = allTasks.reduce(
      (sum, task) => sum + task.estimatedHours,
      0
    );

    return Array.from(
      allTasks.reduce(
        (groups, task) => {
          const existing = groups.get(task.assignee.id) ?? {
            assignee: task.assignee,
            storyIds: new Set<string>(),
            tasks: [] as StoryTaskRowView[],
          };
          existing.storyIds.add(task.userStoryId);
          existing.tasks.push(task);
          groups.set(task.assignee.id, existing);
          return groups;
        },
        new Map<
          string,
          {
            assignee: StoryTaskRowView["assignee"];
            storyIds: Set<string>;
            tasks: StoryTaskRowView[];
          }
        >()
      )
    )
      .map(([assigneeId, entry]) => {
        const estimatedHours = entry.tasks.reduce(
          (sum, task) => sum + task.estimatedHours,
          0
        );
        const doneHours = entry.tasks.reduce(
          (sum, task) => sum + task.doneHours,
          0
        );
        const remainingHours = Math.max(estimatedHours - doneHours, 0);
        const averageTaskHours = entry.tasks.length
          ? Math.round((estimatedHours / entry.tasks.length) * 10) / 10
          : 0;
        const progressRatio =
          estimatedHours > 0 ? Math.min(doneHours / estimatedHours, 1) : 0;
        const sprintWeightRatio =
          totalEstimatedHours > 0 ? estimatedHours / totalEstimatedHours : 0;
        const topTasks = [...entry.tasks]
          .sort((left, right) => right.estimatedHours - left.estimatedHours)
          .slice(0, 3);

        return {
          assigneeId,
          assignee: entry.assignee,
          storyCount: entry.storyIds.size,
          taskCount: entry.tasks.length,
          estimatedHours,
          doneHours,
          remainingHours,
          averageTaskHours,
          loadLabel: formatLoadLabel(sprintWeightRatio),
          progressRatio,
          sprintWeightRatio,
          statusChips: [
            doneHours <= estimatedHours ? "OK" : "Risco",
            "assignee",
          ],
          topTasks,
        } satisfies AssigneeWorkloadView;
      })
      .filter(
        (assignee) =>
          !normalizedQuery ||
          assignee.assignee.name.toLowerCase().includes(normalizedQuery) ||
          assignee.topTasks.some((task) =>
            [task.title, task.assignee.name]
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery)
          )
      )
      .sort((left, right) => right.estimatedHours - left.estimatedHours);
  }, [filteredStories, normalizedQuery]);

  if (effectiveProjectId && sprintsLoading && sprints.length === 0) {
    return (
      <>
        <InlineToast toast={toast} />
        <ProjectShell
          projectId={effectiveProjectId}
          projectName={projectName}
          projectOwnerName={projectOwnerName}
          projectBadgeLabel={projectBadgeLabel}
          activeNavItem="sprint-backlog"
          pageTitle="Sprint Backlog"
          pageSubtitle="Carregando sprints…"
          currentUser={placeholderUser}
          mainColumn={
            <div className="af-surface-lg flex items-center justify-center bg-[#14121a]/70 px-4 py-8">
              <p className="af-text-secondary text-sm">Carregando…</p>
            </div>
          }
        />
        <CreateSprintModal
          projectId={effectiveProjectId}
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreated={async (sprint) => {
            try {
              await refetchSprints();
              setSelectedSprintId(sprint.id);
            } catch (e) {
              showError(e instanceof Error ? e.message : String(e));
            }
          }}
        />
      </>
    );
  }

  if (!sprintsLoading && (!sprints.length || !selectedSprintId)) {
    return (
      <>
        <InlineToast toast={toast} />
        <ProjectShell
          projectId={effectiveProjectId}
          projectName={projectName}
          projectOwnerName={projectOwnerName}
          projectBadgeLabel={projectBadgeLabel}
          activeNavItem="sprint-backlog"
          pageTitle="Sprint Backlog"
          pageSubtitle="This project does not have any sprints yet."
          currentUser={placeholderUser}
          mainColumn={
            <ProjectEmptyState
              title="This project does not have any sprints yet."
              description="Create a sprint before planning user stories and tasks for execution."
              actionLabel="Create sprint"
              onAction={() => setCreateModalOpen(true)}
            />
          }
        />
        <CreateSprintModal
          projectId={effectiveProjectId}
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreated={async (sprint) => {
            try {
              await refetchSprints();
              setSelectedSprintId(sprint.id);
            } catch (e) {
              showError(e instanceof Error ? e.message : String(e));
            }
          }}
        />
      </>
    );
  }

  if (loading && !view) {
    return (
      <>
        <InlineToast toast={toast} />
        <ProjectShell
          projectId={effectiveProjectId}
          projectName={projectName}
          projectOwnerName={projectOwnerName}
          projectBadgeLabel={projectBadgeLabel}
          activeNavItem="sprint-backlog"
          pageTitle="Sprint Backlog"
          pageSubtitle="Loading sprint items…"
          currentUser={placeholderUser}
          mainColumn={
            <div className="af-surface-lg flex items-center justify-center bg-[#14121a]/70 px-4 py-8">
              <p className="af-text-secondary text-sm">Carregando…</p>
            </div>
          }
        />
        <CreateSprintModal
          projectId={effectiveProjectId}
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreated={async (sprint) => {
            try {
              await refetchSprints();
              setSelectedSprintId(sprint.id);
            } catch (e) {
              showError(e instanceof Error ? e.message : String(e));
            }
          }}
        />
      </>
    );
  }

  if (error) {
    return (
      <>
        <InlineToast toast={toast} />
        <ProjectShell
          projectId={effectiveProjectId}
          projectName={projectName}
          projectOwnerName={projectOwnerName}
          projectBadgeLabel={projectBadgeLabel}
          activeNavItem="sprint-backlog"
          pageTitle="Sprint Backlog"
          pageSubtitle="Unable to load sprint backlog."
          currentUser={placeholderUser}
          mainColumn={
            <ProjectEmptyState
              title="Failed to load sprint backlog."
              description={error.message}
              actionLabel="Try again"
              onAction={() => void refetch()}
            />
          }
        />
        <CreateSprintModal
          projectId={effectiveProjectId}
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreated={async (sprint) => {
            try {
              await refetchSprints();
              setSelectedSprintId(sprint.id);
            } catch (e) {
              showError(e instanceof Error ? e.message : String(e));
            }
          }}
        />
      </>
    );
  }

  const filteredTaskCount = filteredStories.reduce(
    (sum, story) => sum + (story.tasks ?? []).length,
    0
  );
  const filteredEstimatedHours = filteredStories.reduce(
    (sum, story) =>
      sum +
      (story.tasks ?? []).reduce((taskSum, task) => taskSum + task.estimatedHours, 0),
    0
  );
  const filteredDoneHours = filteredStories.reduce(
    (sum, story) =>
      sum +
      (story.tasks ?? []).reduce((taskSum, task) => taskSum + task.doneHours, 0),
    0
  );
  const filteredRemainingHours = Math.max(
    filteredEstimatedHours - filteredDoneHours,
    0
  );

  return (
    <>
    <InlineToast toast={toast} />
    <ProjectShell
      projectId={effectiveProjectId}
      projectName={projectName}
      projectOwnerName={projectOwnerName}
      projectBadgeLabel={projectBadgeLabel}
      activeNavItem="sprint-backlog"
      pageTitle="Sprint Backlog"
      pageSubtitle="Stories planejadas para entrega nesta sprint, com tarefas e distribuição por responsável."
      pageContextLabel={`${sprint?.name ?? "Sprint"} - itens planejados`}
      currentUser={placeholderUser}
      showSearch
      searchPlaceholder="Buscar stories, tarefas ou responsáveis..."
      searchValue={query}
      onSearchChange={setQuery}
      mainColumn={
        <>
          {selectedSprintId && availableBacklogStories.length > 0 ? (
            <div className="af-surface-lg mb-4 flex flex-wrap items-end gap-3 bg-[#14121a]/70 px-4 py-3 sm:px-5">
              <div className="min-w-[14rem] flex-1">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
                  Adicionar user story à sprint
                </span>
                <SelectDropdown
                  value={addStoryId}
                  options={availableBacklogStories.map((s) => ({
                    value: String(s.id),
                    label: s.title,
                  }))}
                  onChange={(v) => setAddStoryId(v)}
                  placeholder="Selecione…"
                  disabled={mutating}
                />
              </div>
              <button
                type="button"
                disabled={mutating || !addStoryId}
                onClick={() =>
                  runWithRefetch(async () => {
                    await createSprintItem(effectiveProjectId, selectedSprintId, {
                      userStoryId: Number(addStoryId),
                    });
                    setAddStoryId("");
                  })
                }
                className="af-surface-md af-focus-ring af-accent-hover shrink-0 px-4 py-2 text-xs font-medium text-white/90"
              >
                Adicionar à sprint
              </button>
            </div>
          ) : null}

          {stories.length === 0 ? (
            <section className="af-surface-lg bg-[#14121a]/70 px-4 py-4 sm:px-5 sm:py-4">
              <header className="af-separator-b pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      User Stories na Sprint
                    </h2>
                    <p className="af-text-secondary mt-1 text-xs">
                      Itens planejados para entrega em {periodLabel}.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`af-surface-sm inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                        sprint?.status === "active"
                          ? "af-accent-chip-strong text-white"
                          : "bg-white/5 text-white/72"
                      }`}
                    >
                      {sprintStatusLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCreateModalOpen(true)}
                      className="af-focus-ring af-surface-sm af-accent-hover inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:text-white/90 disabled:opacity-50"
                    >
                      <Plus className="h-3 w-3" aria-hidden />
                      Criar Sprint
                    </button>
                    <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/72">
                      {filteredStories.length} stories
                    </span>
                  </div>
                </div>
              </header>

              <div className="mt-3">
                <ProjectEmptyState
                  title="No items in this sprint."
                  description={
                    availableBacklogStories.length > 0
                      ? "Use o seletor acima para adicionar user stories do backlog a esta sprint."
                      : "This sprint has not received any backlog items yet. Add stories in the product backlog, then add them here."
                  }
                  actionLabel="Add item to sprint"
                />
              </div>
            </section>
          ) : (
            <section className="af-surface-lg bg-[#14121a]/70 px-4 py-4 sm:px-5 sm:py-4">
              <header className="af-separator-b pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      User Stories na Sprint
                    </h2>
                    <p className="af-text-secondary mt-1 text-xs">
                      Itens planejados para entrega em {periodLabel}.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`af-surface-sm inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                        sprint?.status === "active"
                          ? "af-accent-chip-strong text-white"
                          : "bg-white/5 text-white/72"
                      }`}
                    >
                      {sprintStatusLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCreateModalOpen(true)}
                      className="af-focus-ring af-surface-sm af-accent-hover inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:text-white/90 disabled:opacity-50"
                    >
                      <Plus className="h-3 w-3" aria-hidden />
                      Criar Sprint
                    </button>
                    <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/72">
                      {filteredStories.length} stories
                    </span>
                  </div>
                </div>
              </header>

              <div className="mt-3 space-y-3">
                {filteredStories.map((story) => (
                  <StorySprintCard
                    key={story.sprintItemId}
                    story={story}
                    mutating={mutating}
                    onRemoveFromSprint={(sprintItemId) =>
                      runWithRefetch(async () => {
                        await deleteSprintItem(
                          effectiveProjectId,
                          selectedSprintId!,
                          sprintItemId
                        );
                      })
                    }
                    onCreateTask={(sprintItemId, title) =>
                      runWithRefetch(async () => {
                        await createTask(
                          effectiveProjectId,
                          selectedSprintId!,
                          sprintItemId,
                          { title }
                        );
                      })
                    }
                    onUpdateTaskStatus={(
                      sprintItemId: number,
                      taskId: number,
                      status: StoryTaskStatus,
                    ) =>
                      runWithRefetch(async () => {
                        await updateTask(
                          effectiveProjectId,
                          selectedSprintId!,
                          sprintItemId,
                          taskId,
                          { status }
                        );
                      })
                    }
                    onDeleteTask={(sprintItemId, taskId) =>
                      runWithRefetch(async () => {
                        await deleteTask(
                          effectiveProjectId,
                          selectedSprintId!,
                          sprintItemId,
                          taskId
                        );
                      })
                    }
                  />
                ))}
              </div>
            </section>
          )}
        </>
      }
      sideColumn={
        stories.length === 0 ? undefined : (
          <WorkloadPanel
            assignees={filteredAssignees}
            storyCount={filteredStories.length}
            taskCount={filteredTaskCount}
            estimatedHours={filteredEstimatedHours}
            doneHours={filteredDoneHours}
            remainingHours={filteredRemainingHours}
          />
        )
      }
    />
    <CreateSprintModal
      projectId={effectiveProjectId}
      open={createModalOpen}
      onClose={() => setCreateModalOpen(false)}
      onCreated={async (sprint) => {
        try {
          await refetchSprints();
          setSelectedSprintId(sprint.id);
        } catch (e) {
          showError(e instanceof Error ? e.message : String(e));
        }
      }}
    />
    </>
  );
}
