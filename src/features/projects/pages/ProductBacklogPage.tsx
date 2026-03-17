"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import TriageQueue, {
  type TriageFilter,
  type TriageQueueCounts,
} from "@/components/backlog/TriageQueue";
import ProjectShell from "@/components/layout/ProjectShell";
import { getUserById } from "@/mocks/users.mock";
import {
  currentUserProfile,
  mockProjects,
  type Project,
} from "../mocks/projects.mock";
import ProjectEmptyState from "@/components/projects/ProjectEmptyState";
import {
  buildProductBacklogView,
  type UserStory,
} from "../mocks/productBacklog.mock";

interface ProductBacklogPageProps {
  projectId?: string;
}

const fallbackProject: Project = mockProjects[1] ?? mockProjects[0];

type StoryWithLegacyCriteria = UserStory & {
  acceptance_criteria?: string | null;
};

function formatStatusLabel(status: string): string {
  if (status === "in_progress") return "Em andamento";
  if (status === "ready") return "Pronta";
  if (status === "done") return "Concluída";
  return "Rascunho";
}

function formatValueLabel(value: string): string {
  if (value === "high") return "alto";
  if (value === "medium") return "médio";
  return "baixo";
}

function formatPriorityLabel(priority: number): string {
  return `P${priority}`;
}

function formatComplexityLabel(complexity: string): string {
  if (complexity === "very_high") return "muito alta";
  if (complexity === "high") return "alta";
  if (complexity === "medium") return "média";
  return "baixa";
}

function getAssigneeName(assigneeId: string): string {
  if (!assigneeId?.trim()) {
    return "Sem responsável";
  }

  try {
    return getUserById(assigneeId).name;
  } catch {
    return "Sem responsável";
  }
}

function getAcceptanceCriteriaValue(story: StoryWithLegacyCriteria): string {
  const acceptanceCriteria =
    typeof story.acceptanceCriteria === "string" ? story.acceptanceCriteria : "";
  const legacyAcceptanceCriteria =
    typeof story.acceptance_criteria === "string" ? story.acceptance_criteria : "";

  return acceptanceCriteria || legacyAcceptanceCriteria;
}

function matchesTriageFilter(
  story: StoryWithLegacyCriteria,
  triageFilter: TriageFilter,
): boolean {
  const acceptanceCriteria = getAcceptanceCriteriaValue(story).trim();

  switch (triageFilter) {
    case "noAssignee":
      return !story.assigneeId?.trim();
    case "missingCriteria":
      return acceptanceCriteria.length === 0;
    case "missingEffort":
      return story.effort <= 0;
    case "hasDependencies":
      return story.dependencies.trim().length > 0;
    case "draft":
      return story.status === "draft";
    case "none":
    default:
      return true;
  }
}

export default function ProductBacklogPage({
  projectId,
}: ProductBacklogPageProps) {
  const [query, setQuery] = useState("");
  const [expandedStoryIds, setExpandedStoryIds] = useState<Set<string>>(new Set());
  const [triageFilter, setTriageFilter] = useState<TriageFilter>("none");

  let projectFromParam: Project | undefined;
  if (projectId) {
    projectFromParam = mockProjects.find((project) => project.id === projectId);
  }

  const currentProject: Project = projectFromParam ?? fallbackProject;
  const effectiveProjectId = projectId ?? currentProject.id;
  const backlog = buildProductBacklogView(effectiveProjectId);

  const normalizedQuery = query.trim().toLowerCase();
  const allStories = useMemo(
    () => backlog.epics.flatMap((epic) => epic.userStories),
    [backlog.epics],
  );
  const triageCounts = useMemo<TriageQueueCounts>(
    () => ({
      noAssignee: allStories.filter((story) =>
        matchesTriageFilter(story, "noAssignee"),
      ).length,
      missingCriteria: allStories.filter((story) =>
        matchesTriageFilter(story, "missingCriteria"),
      ).length,
      missingEffort: allStories.filter((story) =>
        matchesTriageFilter(story, "missingEffort"),
      ).length,
      hasDependencies: allStories.filter((story) =>
        matchesTriageFilter(story, "hasDependencies"),
      ).length,
      draft: allStories.filter((story) => matchesTriageFilter(story, "draft"))
        .length,
    }),
    [allStories],
  );
  const filteredEpics = useMemo(
    () =>
      backlog.epics
        .map((epic) => {
          const epicMatches =
            !normalizedQuery ||
            [epic.name, epic.description].some((value) =>
              value.toLowerCase().includes(normalizedQuery),
            );
          const userStories = epic.userStories.filter((story) => {
            const assigneeName = getAssigneeName(story.assigneeId);
            const statusLabel = formatStatusLabel(story.status);
            const matchesSearch =
              epicMatches ||
              [
                story.title,
                story.persona,
                story.description,
                getAcceptanceCriteriaValue(story),
                story.dependencies,
                assigneeName,
                statusLabel,
                story.businessValue,
              ]
                .join(" ")
                .toLowerCase()
                .includes(normalizedQuery);
            const matchesTriage = matchesTriageFilter(story, triageFilter);

            return matchesSearch && matchesTriage;
          });

          return {
            ...epic,
            userStories,
          };
        })
        .filter((epic) =>
          epic.userStories.length > 0 ||
          (!normalizedQuery && triageFilter === "none"),
        ),
    [backlog.epics, normalizedQuery, triageFilter],
  );

  const totalStories = filteredEpics.reduce(
    (sum, epic) => sum + epic.userStories.length,
    0,
  );

  function toggleStoryExpanded(storyId: string) {
    setExpandedStoryIds((current) => {
      const next = new Set(current);
      if (next.has(storyId)) {
        next.delete(storyId);
      } else {
        next.add(storyId);
      }
      return next;
    });
  }

  function handleSelectTriageFilter(filter: Exclude<TriageFilter, "none">) {
    setTriageFilter((current) => (current === filter ? "none" : filter));
  }

  function handleClearTriageFilter() {
    setTriageFilter("none");
  }

  return (
    <ProjectShell
      projectId={effectiveProjectId}
      projectName={currentProject.name}
      projectOwner={currentProject.owner}
      projectBadgeLabel={String(currentProject.members.length)}
      activeNavItem="backlog"
      pageTitle="Product Backlog"
      pageSubtitle="Epics e User Stories do projeto, organizados por prioridade e prontidão."
      pageContextLabel="Backlog do produto"
      currentUser={currentUserProfile}
      showSearch
      searchPlaceholder="Buscar por epic, story, responsável, status..."
      searchValue={query}
      onSearchChange={setQuery}
      mainColumn={
        backlog.epics.length === 0 ? (
          <ProjectEmptyState
            title="No user stories have been added yet."
            description="This project is still empty. Add backlog items to start planning epics, stories, and sprint candidates."
            actionLabel="Add User Story"
          />
        ) : (
          <div className="space-y-4 lg:space-y-5">
            {filteredEpics.map((epic) => {
              const storyCount = epic.userStories.length;

              return (
                <article
                  key={epic.id}
                  className="af-surface-lg bg-[#14121a]/70 px-4 py-4 sm:px-5 sm:py-4"
                >
                  <header className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                        Epic
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-sm font-semibold text-white">
                          {epic.name}
                        </h2>

                        <span className="af-surface-sm af-accent-chip inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
                          {epic.priority}
                        </span>
                      </div>

                      <p className="af-text-secondary text-xs">{epic.description}</p>
                    </div>

                    <div className="af-text-tertiary flex items-center gap-2 text-xs">
                      <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-1 text-[10px] text-white/70">
                        {storyCount} stories
                      </span>
                    </div>
                  </header>

                  <div className="mt-3 space-y-2">
                    <div className="af-separator-b flex items-center justify-between gap-3 pb-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                        User Story
                      </p>
                    </div>

                    <div className="af-surface-md overflow-x-auto bg-black/20 px-3 py-2.5">
                      <table className="w-full min-w-[42rem] border-separate border-spacing-y-1.5">
                        <thead>
                          <tr className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/44">
                            <th className="w-10 px-2 py-1 text-left font-semibold" />
                            <th className="px-2 py-1 text-left font-semibold">Story</th>
                            <th className="px-2 py-1 text-left font-semibold">Assignee</th>
                            <th className="px-2 py-1 text-left font-semibold">Status</th>
                            <th className="px-2 py-1 text-left font-semibold">Value</th>
                            <th className="px-2 py-1 text-left font-semibold">Complexity</th>
                          </tr>
                        </thead>

                        <tbody>
                          {epic.userStories.map((story) => {
                            const isExpanded = expandedStoryIds.has(story.id);
                            const assigneeName = getAssigneeName(story.assigneeId);

                            return (
                              <Fragment key={story.id}>
                                <tr className="text-[11px] text-white/76">
                                  <td className="bg-white/[0.02] px-2 py-1.5 align-middle">
                                    <button
                                      type="button"
                                      aria-expanded={isExpanded}
                                      aria-label={
                                        isExpanded
                                          ? `Ocultar detalhes de ${story.title}`
                                          : `Mostrar detalhes de ${story.title}`
                                      }
                                      onClick={() => toggleStoryExpanded(story.id)}
                                      className="af-focus-ring af-accent-hover inline-flex h-7 w-7 items-center justify-center text-white/60 transition hover:bg-white/[0.03] hover:text-[var(--accent-soft-35)]"
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                      )}
                                    </button>
                                  </td>
                                  <td className="bg-white/[0.02] px-2 py-1.5 align-middle">
                                    <span className="block truncate">{story.title}</span>
                                  </td>
                                  <td className="bg-white/[0.02] px-2 py-1.5 align-middle">
                                    <span className="af-text-secondary block truncate">
                                      {assigneeName}
                                    </span>
                                  </td>
                                  <td className="bg-white/[0.02] px-2 py-1.5 align-middle text-white/70">
                                    {formatStatusLabel(story.status)}
                                  </td>
                                  <td className="bg-white/[0.02] px-2 py-1.5 align-middle text-white/70">
                                    {formatValueLabel(story.businessValue)}
                                  </td>
                                  <td className="bg-white/[0.02] px-2 py-1.5 align-middle text-white/70">
                                    {formatComplexityLabel(story.complexity)}
                                  </td>
                                </tr>

                                {isExpanded ? (
                                  <tr>
                                    <td colSpan={6} className="px-0 pt-0.5">
                                      <div className="af-surface-md bg-transparent px-3 py-3">
                                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
                                          <div className="space-y-3">
                                            <div>
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                                                Persona
                                              </p>
                                              <p className="af-text-secondary mt-1 text-xs">
                                                {story.persona}
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                                                Description
                                              </p>
                                              <p className="af-text-secondary mt-1 text-xs leading-relaxed">
                                                {story.description}
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                                                Acceptance Criteria
                                              </p>
                                              <p className="af-text-secondary mt-1 whitespace-pre-line text-xs leading-relaxed">
                                                {story.acceptanceCriteria}
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                                                Dependencies
                                              </p>
                                              <p className="af-text-secondary mt-1 text-xs leading-relaxed">
                                                {story.dependencies}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="space-y-2">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                                              Story Details
                                            </p>
                                            <div className="flex flex-wrap gap-1.5 text-[10px] text-white/72">
                                              <span className="af-surface-sm inline-flex h-6 items-center bg-white/5 px-2 py-0 leading-none">
                                                Effort {story.effort}
                                              </span>
                                              <span className="af-surface-sm inline-flex h-6 items-center bg-white/5 px-2 py-0 leading-none">
                                                {formatPriorityLabel(story.priority)}
                                              </span>
                                              <span className="af-surface-sm inline-flex h-6 items-center bg-white/5 px-2 py-0 leading-none">
                                                BV {formatValueLabel(story.businessValue)}
                                              </span>
                                              <span className="af-surface-sm inline-flex h-6 items-center bg-white/5 px-2 py-0 leading-none">
                                                {formatComplexityLabel(story.complexity)}
                                              </span>
                                              <span className="af-surface-sm inline-flex h-6 items-center bg-white/5 px-2 py-0 leading-none">
                                                {formatStatusLabel(story.status)}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                ) : null}
                              </Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )
      }
      sideColumn={backlog.epics.length === 0 ? undefined : (
        <>
          <TriageQueue
            counts={triageCounts}
            activeFilter={triageFilter}
            onSelectFilter={handleSelectTriageFilter}
            onClearFilter={handleClearTriageFilter}
          />

          <section className="af-surface-lg bg-[#14121a]/70 px-4 py-4 sm:px-5 sm:py-4">
            <header className="af-separator-b pb-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-white">Métricas</h2>
                  <p className="af-text-secondary mt-1 text-xs">
                    Visão rápida do backlog.
                  </p>
                </div>

                <span className="af-surface-sm af-accent-chip inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
                  Snapshot
                </span>
              </div>
            </header>

            <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="af-surface-md af-accent-panel bg-white/5 px-3 py-2.5">
                <dt className="af-text-tertiary text-[10px] font-semibold uppercase tracking-[0.16em]">
                  Stories
                </dt>
                <dd className="mt-1 text-lg font-semibold text-white">
                  {totalStories}
                </dd>
              </div>

              <div className="af-surface-md bg-white/5 px-3 py-2.5">
                <dt className="af-text-tertiary text-[10px] font-semibold uppercase tracking-[0.16em]">
                  Epics
                </dt>
                <dd className="mt-1 text-lg font-semibold text-white">
                  {backlog.epics.length}
                </dd>
              </div>
            </dl>
          </section>
        </>
      )}
    />
  );
}
