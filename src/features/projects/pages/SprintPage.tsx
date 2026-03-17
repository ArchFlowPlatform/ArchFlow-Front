"use client";

import { useMemo, useState } from "react";

import ProjectShell from "@/components/layout/ProjectShell";
import { useProjectSprint } from "@/contexts/ProjectSprintContext";
import ProjectEmptyState from "@/components/projects/ProjectEmptyState";
import BurndownChart from "@/components/sprint/BurndownChart";
import SprintSummaryCard from "@/components/sprint/SprintSummaryCard";
import SprintTasksPanel from "@/components/sprint/SprintTasksPanel";
import {
  buildMockSprintView,
  type Sprint,
} from "../mocks/sprint.mock";
import {
  currentUserProfile,
  mockProjects,
  type Project,
} from "../mocks/projects.mock";

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

function buildPeriodLabel(sprint: Sprint): string {
  return `${formatDate(sprint.startDate)} – ${formatDate(sprint.endDate)}`;
}

const fallbackProject: Project = mockProjects[1] ?? mockProjects[0];

export default function SprintPage({ projectId }: SprintPageProps) {
  const [query, setQuery] = useState("");

  let projectFromParam: Project | undefined;
  if (projectId) {
    projectFromParam = mockProjects.find((project) => project.id === projectId);
  }

  const currentProject: Project = projectFromParam ?? fallbackProject;
  const effectiveProjectId = projectId ?? currentProject.id;
  const { sprints, selectedSprintId } = useProjectSprint(effectiveProjectId);

  if (!sprints.length || !selectedSprintId) {
    return (
      <ProjectShell
        projectId={effectiveProjectId}
        projectName={currentProject.name}
        projectOwner={currentProject.owner}
        projectBadgeLabel={String(currentProject.members.length)}
        activeNavItem="sprint"
        pageTitle="Sprint"
        pageSubtitle="This project does not have any sprints yet."
        currentUser={currentUserProfile}
        mainColumn={
          <ProjectEmptyState
            title="This project does not have any sprints yet."
            description="Create a sprint to start planning scope, tracking progress, and viewing burndown metrics."
            actionLabel="Create sprint"
          />
        }
      />
    );
  }

  const sprintView = buildMockSprintView(effectiveProjectId, selectedSprintId ?? undefined);
  const { sprint, taskViews, burndownPoints, scopeHours, burnedHours, remainingHours } =
    sprintView;

  const periodLabel = buildPeriodLabel(sprint);
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

  return (
    <ProjectShell
      projectId={effectiveProjectId}
      projectName={currentProject.name}
      projectOwner={currentProject.owner}
      projectBadgeLabel={String(currentProject.members.length)}
      activeNavItem="sprint"
      pageTitle="Sprint"
      pageSubtitle={sprint.goal}
      pageContextLabel={`${sprint.name} • ${periodLabel}`}
      currentUser={currentUserProfile}
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
  );
}
