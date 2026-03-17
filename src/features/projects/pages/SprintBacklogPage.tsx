"use client";

import { useMemo, useState } from "react";

import ProjectShell from "@/components/layout/ProjectShell";
import { useProjectSprint } from "@/contexts/ProjectSprintContext";
import ProjectEmptyState from "@/components/projects/ProjectEmptyState";
import StorySprintCard from "@/components/sprint-backlog/StorySprintCard";
import WorkloadPanel from "@/components/sprint-backlog/WorkloadPanel";
import {
  currentUserProfile,
  mockProjects,
  type Project,
} from "../mocks/projects.mock";
import {
  buildSprintBacklogView,
  type AssigneeWorkloadView,
  type StoryTaskRowView,
} from "../mocks/sprintBacklog.mock";

interface SprintBacklogPageProps {
  projectId?: string;
}

const fallbackProject: Project = mockProjects[1] ?? mockProjects[0];

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
        activeNavItem="sprint-backlog"
        pageTitle="Sprint Backlog"
        pageSubtitle="This project does not have any sprints yet."
        currentUser={currentUserProfile}
        mainColumn={
          <ProjectEmptyState
            title="This project does not have any sprints yet."
            description="Create a sprint before planning user stories and tasks for execution."
            actionLabel="Create sprint"
          />
        }
      />
    );
  }

  const sprintBacklogView = buildSprintBacklogView(
    effectiveProjectId,
    selectedSprintId ?? undefined,
  );
  const {
    sprint,
    stories,
  } = sprintBacklogView;
  const periodLabel = buildPeriodLabel(sprint.startDate, sprint.endDate);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredStories = useMemo(
    () =>
      stories.filter((story) =>
        !normalizedQuery ||
        [
          story.title,
          story.description,
          story.acceptanceCriteria,
          story.epicName,
          story.assignee.name,
          ...story.tasks.flatMap((task) => [
            task.title,
            task.description,
            task.assignee.name,
          ]),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      ),
    [normalizedQuery, stories],
  );
  const filteredAssignees = useMemo(() => {
    const allTasks = filteredStories.flatMap((story) => story.tasks);
    const totalEstimatedHours = allTasks.reduce(
      (sum, task) => sum + task.estimatedHours,
      0,
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
        >(),
      ),
    )
      .map(([assigneeId, entry]) => {
        const estimatedHours = entry.tasks.reduce(
          (sum, task) => sum + task.estimatedHours,
          0,
        );
        const doneHours = entry.tasks.reduce((sum, task) => sum + task.doneHours, 0);
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
          statusChips: [doneHours <= estimatedHours ? "OK" : "Risco", "assignee"],
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
              .includes(normalizedQuery),
          ),
      )
      .sort((left, right) => right.estimatedHours - left.estimatedHours);
  }, [filteredStories, normalizedQuery]);
  const filteredTaskCount = filteredStories.reduce(
    (sum, story) => sum + story.tasks.length,
    0,
  );
  const filteredEstimatedHours = filteredStories.reduce(
    (sum, story) =>
      sum +
      story.tasks.reduce((taskSum, task) => taskSum + task.estimatedHours, 0),
    0,
  );
  const filteredDoneHours = filteredStories.reduce(
    (sum, story) =>
      sum +
      story.tasks.reduce((taskSum, task) => taskSum + task.doneHours, 0),
    0,
  );
  const filteredRemainingHours = Math.max(
    filteredEstimatedHours - filteredDoneHours,
    0,
  );

  return (
    <ProjectShell
      projectId={effectiveProjectId}
      projectName={currentProject.name}
      projectOwner={currentProject.owner}
      projectBadgeLabel={String(currentProject.members.length)}
      activeNavItem="sprint-backlog"
      pageTitle="Sprint Backlog"
      pageSubtitle="Stories planejadas para entrega nesta sprint, com tarefas e distribuição por responsável."
      pageContextLabel={`${sprint.name} - itens planejados`}
      currentUser={currentUserProfile}
      showSearch
      searchPlaceholder="Buscar stories, tarefas ou responsáveis..."
      searchValue={query}
      onSearchChange={setQuery}
      mainColumn={
        stories.length === 0 ? (
          <ProjectEmptyState
            title="No items in this sprint."
            description="This sprint has not received any backlog items yet. Add stories to start planning work."
            actionLabel="Add item to sprint"
          />
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

                <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/72">
                  {filteredStories.length} stories
                </span>
              </div>
            </header>

            <div className="mt-3 space-y-3">
              {filteredStories.map((story) => (
                <StorySprintCard key={story.id} story={story} />
              ))}
            </div>
          </section>
        )
      }
      sideColumn={stories.length === 0 ? undefined : (
        <WorkloadPanel
          assignees={filteredAssignees}
          storyCount={filteredStories.length}
          taskCount={filteredTaskCount}
          estimatedHours={filteredEstimatedHours}
          doneHours={filteredDoneHours}
          remainingHours={filteredRemainingHours}
        />
      )}
    />
  );
}
