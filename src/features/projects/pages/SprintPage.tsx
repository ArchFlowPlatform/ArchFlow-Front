"use client";

import { useCallback, useMemo, useState } from "react";

import ProjectShell from "@/components/layout/ProjectShell";
import { useProjectSprint } from "@/contexts/ProjectSprintContext";
import ProjectEmptyState from "@/components/projects/ProjectEmptyState";
import BurndownChart from "@/components/sprint/BurndownChart";
import SprintSummaryCard from "@/components/sprint/SprintSummaryCard";
import SprintTasksPanel from "@/components/sprint/SprintTasksPanel";
import { authUserToUser } from "@/features/auth/types/auth.types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useProject } from "../hooks/useProject";
import { useSprintViewModel } from "../hooks/useSprintViewModel";
import CreateSprintModal from "@/components/sprint/CreateSprintModal";
import InlineToast from "@/components/ui/InlineToast";
import { useToast } from "@/hooks/useToast";
import { updateSprint } from "@/features/sprints/api/sprints.api";
import type { SprintStatus } from "@/types/enums";

interface SprintPageProps {
  projectId?: string;
}

function formatDate(dateISO: string): string {
  const date = new Date(dateISO);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function buildPeriodLabel(startDate: string, endDate: string): string {
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

const PLACEHOLDER_USER = {
  id: "",
  name: "—",
  email: "",
  type: "",
  avatarUrl: "",
  createdAt: "",
  updatedAt: "",
} as const;

export default function SprintPage({ projectId }: SprintPageProps) {
  const [query, setQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [sprintStatusSaving, setSprintStatusSaving] = useState(false);

  const effectiveProjectId = projectId ?? "";
  const { user } = useAuth();
  const { project } = useProject(effectiveProjectId || null);
  const {
    sprints,
    selectedSprintId,
    selectedSprint,
    refetchSprints,
    setSelectedSprintId,
  } = useProjectSprint(effectiveProjectId || "");
  const { toast, showError, showSuccess } = useToast();
  const {
    taskViews,
    burndownPoints,
    scopeHours,
    burnedHours,
    remainingHours,
    loading,
    error,
  } = useSprintViewModel(
    effectiveProjectId || null,
    selectedSprintId,
    selectedSprint
  );

  const projectName = project?.name ?? "…";
  const projectOwnerName = project?.ownerName ?? "—";
  const projectBadgeLabel = project ? String(project.members.length) : "0";
  const currentUser = authUserToUser(user) ?? PLACEHOLDER_USER;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredTaskViews = useMemo(
    () =>
      taskViews.filter((task) =>
        !normalizedQuery ||
        [task.title, task.assignee.name, task.priorityLabel]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      ),
    [normalizedQuery, taskViews],
  );

  const handleSprintStatusChange = useCallback(
    async (next: SprintStatus) => {
      if (!selectedSprintId) return;
      setSprintStatusSaving(true);
      try {
        await updateSprint(effectiveProjectId, selectedSprintId, {
          status: next,
        });
        await refetchSprints();
        showSuccess("Status atualizado", "O status da sprint foi salvo.");
      } catch (e) {
        showError(e instanceof Error ? e.message : String(e));
      } finally {
        setSprintStatusSaving(false);
      }
    },
    [
      effectiveProjectId,
      selectedSprintId,
      refetchSprints,
      showError,
      showSuccess,
    ],
  );

  if (!sprints.length || !selectedSprintId) {
    return (
      <>
        <InlineToast toast={toast} />
        <ProjectShell
          projectId={effectiveProjectId}
          projectName={projectName}
          projectOwnerName={projectOwnerName}
          projectBadgeLabel={projectBadgeLabel}
          activeNavItem="sprint"
          pageTitle="Sprint"
          pageSubtitle="This project does not have any sprints yet."
          currentUser={currentUser}
          mainColumn={
            <ProjectEmptyState
              title="This project does not have any sprints yet."
              description="Create a sprint to start planning scope, tracking progress, and viewing burndown metrics."
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

  if (loading && taskViews.length === 0) {
    return (
      <>
        <InlineToast toast={toast} />
        <ProjectShell
          projectId={effectiveProjectId}
          projectName={projectName}
          projectOwnerName={projectOwnerName}
          projectBadgeLabel={projectBadgeLabel}
          activeNavItem="sprint"
          pageTitle="Sprint"
          pageSubtitle="Loading sprint data…"
          currentUser={currentUser}
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

  if (error && taskViews.length === 0) {
    return (
      <>
        <InlineToast toast={toast} />
        <ProjectShell
          projectId={effectiveProjectId}
          projectName={projectName}
          projectOwnerName={projectOwnerName}
          projectBadgeLabel={projectBadgeLabel}
          activeNavItem="sprint"
          pageTitle="Sprint"
          pageSubtitle="Unable to load sprint."
          currentUser={currentUser}
          mainColumn={
            <ProjectEmptyState
              title="Failed to load sprint."
              description={error.message}
              actionLabel="Try again"
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

  const sprint = selectedSprint!;
  const periodLabel = buildPeriodLabel(sprint.startDate, sprint.endDate);

  return (
    <>
      <InlineToast toast={toast} />
      <ProjectShell
        projectId={effectiveProjectId}
        projectName={projectName}
        projectOwnerName={projectOwnerName}
        projectBadgeLabel={projectBadgeLabel}
        activeNavItem="sprint"
        pageTitle="Sprint"
        pageSubtitle={sprint.goal}
        pageContextLabel={`${sprint.name} • ${periodLabel}`}
        currentUser={currentUser}
        showSearch
        searchPlaceholder="Buscar tarefas do sprint..."
        searchValue={query}
        onSearchChange={setQuery}
        mainColumn={
          <div className="space-y-4 lg:space-y-5">
            <SprintSummaryCard
              sprint={sprint}
              scopeHours={scopeHours}
              burnedHours={burnedHours}
              remainingHours={remainingHours}
              periodLabel={periodLabel}
              onCreateSprint={() => setCreateModalOpen(true)}
              onSprintStatusChange={handleSprintStatusChange}
              statusSaving={sprintStatusSaving}
            />

            <section className="af-surface-lg min-w-0 w-full bg-[#14121a]/70 px-4 py-4 sm:px-5 sm:py-4">
              <BurndownChart
                points={burndownPoints}
                scopeHours={scopeHours}
                burnedHours={burnedHours}
                remainingHours={remainingHours}
              />
            </section>
          </div>
        }
        sideColumn={<SprintTasksPanel tasks={filteredTaskViews} />}
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
