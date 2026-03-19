"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Archive, ChevronDown, ChevronRight, Plus } from "lucide-react";

import TriageQueue, {
  type TriageFilter,
  type TriageQueueCounts,
} from "@/components/backlog/TriageQueue";
import CreateEpicModal from "@/components/backlog/CreateEpicModal";
import CreateStoryModal from "@/components/backlog/CreateStoryModal";
import {
  InlineText,
  InlineSelect,
  InlineNumber,
  InlineColor,
  InlineMemberSelect,
} from "@/components/backlog/InlineEditField";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import InlineToast from "@/components/ui/InlineToast";
import ProjectShell from "@/components/layout/ProjectShell";
import { authUserToUser } from "@/features/auth/types/auth.types";
import { useAuth } from "@/features/auth/context/AuthContext";
import ProjectEmptyState from "@/components/projects/ProjectEmptyState";
import { useBacklog } from "@/features/backlog/hooks/useBacklog";
import {
  createEpic,
  createStory,
  updateEpic,
  updateStory,
  archiveEpic,
  archiveStory,
} from "@/features/backlog/api/backlog.api";
import { useProject } from "@/features/projects/hooks/useProject";
import { useToast } from "@/hooks/useToast";
import EnumBadge from "@/components/ui/EnumBadge";
import {
  getLabelFor,
  getBadgeFor,
  BUSINESS_VALUE_OPTIONS,
  EPIC_STATUS_OPTIONS,
  STORY_STATUS_OPTIONS,
  COMPLEXITY_OPTIONS,
} from "@/lib/enum-labels";
import type { UserStory } from "@/types/backlog";
import type { User } from "@/types/user";
import type { CreateEpicRequest, CreateStoryRequest } from "@/types/requests";
import { resolveUsersByIdCached } from "@/lib/users/resolve-assignee-names";

interface ProductBacklogPageProps {
  projectId?: string;
}

type StoryWithLegacyCriteria = UserStory & {
  acceptance_criteria?: string | null;
};

function getAssigneeName(
  assigneeId: string,
  members: { userId?: string; user?: { id: string; name: string } }[],
  resolvedUsersById: Record<string, User>,
): string {
  if (!assigneeId?.trim()) return "Sem responsável";
  const resolved = resolvedUsersById[assigneeId];
  if (resolved?.name) return resolved.name;
  const member = members.find(
    (m) => m.user?.id === assigneeId || m.userId === assigneeId,
  );
  return member?.user?.name ?? "Sem responsável";
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
      return (story.effort ?? 0) <= 0;
    case "hasDependencies":
      return story.dependencies.trim().length > 0;
    case "draft":
      return story.status === "draft";
    case "none":
    default:
      return true;
  }
}

interface ArchiveTarget {
  kind: "epic" | "story";
  id: number;
  label: string;
}

export default function ProductBacklogPage({
  projectId,
}: ProductBacklogPageProps) {
  const [query, setQuery] = useState("");
  const [expandedStoryIds, setExpandedStoryIds] = useState<Set<string>>(new Set());
  const [triageFilter, setTriageFilter] = useState<TriageFilter>("none");
  const [epicModalOpen, setEpicModalOpen] = useState(false);
  const [storyModal, setStoryModal] = useState<{ epicId: number; epicName: string } | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<ArchiveTarget | null>(null);
  const [archiving, setArchiving] = useState(false);
  const { toast, showError, showSuccess } = useToast();

  const effectiveProjectId = projectId ?? "";
  const { user } = useAuth();
  const { project, loading: projectLoading } = useProject(
    effectiveProjectId || null,
  );
  const { backlog, loading: backlogLoading, error: backlogError, refetch } = useBacklog(
    effectiveProjectId || null,
  );

  const members = project?.members ?? [];
  const memberOptionsLegacy = useMemo(
    () =>
      members.map((m) => ({
        userId: m.userId ?? m.user?.id ?? "",
        name: m.user?.name ?? "—",
      })),
    [members],
  );

  const [resolvedAssigneesById, setResolvedAssigneesById] = useState<Record<string, User>>({});
  const [assigneesLoading, setAssigneesLoading] = useState(false);

  const memberOptions = useMemo(
    () =>
      memberOptionsLegacy
        .map((m) => ({
          ...m,
          name: resolvedAssigneesById[m.userId]?.name ?? m.name,
        }))
        .filter((m) => Boolean(m.userId?.trim())),
    [memberOptionsLegacy, resolvedAssigneesById],
  );
  const placeholderUser = authUserToUser(user) ?? {
    id: "",
    name: "—",
    email: "",
    type: "",
    avatarUrl: "",
    createdAt: "",
    updatedAt: "",
  };
  const projectName = project?.name ?? "…";
  const projectOwnerName = project?.ownerName ?? "—";
  const projectBadgeLabel = project ? String(project.members.length) : "0";

  const epics = backlog?.epics ?? [];
  const normalizedQuery = query.trim().toLowerCase();
  const allStories = useMemo(
    () => epics.flatMap((epic) => epic.userStories ?? []),
    [epics],
  );

  const assigneeIdsToResolve = useMemo(() => {
    const ids = new Set<string>();

    for (const member of members) {
      const id = member.userId ?? member.user?.id ?? "";
      if (id.trim()) ids.add(id);
    }

    for (const story of allStories) {
      const id = story.assigneeId;
      if (id?.trim()) ids.add(id);
    }

    return Array.from(ids);
  }, [allStories, members]);

  const assigneeIdsKey = useMemo(() => {
    return [...assigneeIdsToResolve].sort().join("|");
  }, [assigneeIdsToResolve]);

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
        setResolvedAssigneesById((prev) => ({ ...prev, ...resolved }));
      } finally {
        if (!cancelled) setAssigneesLoading(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [assigneeIdsKey, assigneeIdsToResolve]);
  const triageCounts = useMemo<TriageQueueCounts>(
    () => ({
      noAssignee: allStories.filter((s) => matchesTriageFilter(s, "noAssignee")).length,
      missingCriteria: allStories.filter((s) => matchesTriageFilter(s, "missingCriteria")).length,
      missingEffort: allStories.filter((s) => matchesTriageFilter(s, "missingEffort")).length,
      hasDependencies: allStories.filter((s) => matchesTriageFilter(s, "hasDependencies")).length,
      draft: allStories.filter((s) => matchesTriageFilter(s, "draft")).length,
    }),
    [allStories],
  );

  const filteredEpics = useMemo(
    () =>
      epics
        .map((epic) => {
          const epicMatches =
            !normalizedQuery ||
            [epic.name, epic.description].some((v) =>
              v.toLowerCase().includes(normalizedQuery),
            );
          const userStories = (epic.userStories ?? []).filter((story) => {
            const assigneeName = getAssigneeName(
              story.assigneeId ?? "",
              members,
              resolvedAssigneesById,
            );
            const statusLabel = getLabelFor(STORY_STATUS_OPTIONS, story.status);
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
          return { ...epic, userStories };
        })
        .filter(
          (epic) =>
            epic.userStories.length > 0 ||
            (!normalizedQuery && triageFilter === "none"),
        ),
    [epics, normalizedQuery, triageFilter, members, resolvedAssigneesById],
  );

  const totalStories = filteredEpics.reduce(
    (sum, epic) => sum + epic.userStories.length,
    0,
  );

  function toggleStoryExpanded(storyId: string) {
    setExpandedStoryIds((current) => {
      const next = new Set(current);
      if (next.has(storyId)) next.delete(storyId);
      else next.add(storyId);
      return next;
    });
  }

  function handleSelectTriageFilter(filter: Exclude<TriageFilter, "none">) {
    setTriageFilter((current) => (current === filter ? "none" : filter));
  }

  function handleClearTriageFilter() {
    setTriageFilter("none");
  }

  // ── Create handlers ──

  const handleCreateEpic = useCallback(
    async (data: CreateEpicRequest) => {
      if (!effectiveProjectId) return;
      try {
        await createEpic(effectiveProjectId, data);
        await refetch();
      } catch (e) {
        showError(e instanceof Error ? e.message : String(e));
        throw e;
      }
    },
    [effectiveProjectId, refetch, showError],
  );

  const handleCreateStory = useCallback(
    async (data: CreateStoryRequest) => {
      if (!effectiveProjectId || !storyModal) return;
      try {
        await createStory(effectiveProjectId, storyModal.epicId, data);
        await refetch();
      } catch (e) {
        showError(e instanceof Error ? e.message : String(e));
        throw e;
      }
    },
    [effectiveProjectId, storyModal, refetch, showError],
  );

  // ── Inline update handlers ──

  const handleUpdateEpic = useCallback(
    async (epicId: number, field: string, value: unknown) => {
      if (!effectiveProjectId) return;
      try {
        await updateEpic(effectiveProjectId, epicId, { [field]: value });
        await refetch();
      } catch (e) {
        showError(e instanceof Error ? e.message : String(e));
      }
    },
    [effectiveProjectId, refetch, showError],
  );

  const handleUpdateStory = useCallback(
    async (storyId: number, field: string, value: unknown) => {
      if (!effectiveProjectId) return;
      try {
        await updateStory(effectiveProjectId, storyId, { [field]: value });
        await refetch();
      } catch (e) {
        showError(e instanceof Error ? e.message : String(e));
      }
    },
    [effectiveProjectId, refetch, showError],
  );

  // ── Archive handler ──

  const handleConfirmArchive = useCallback(async () => {
    if (!effectiveProjectId || !archiveTarget) return;
    setArchiving(true);
    try {
      if (archiveTarget.kind === "epic") {
        await archiveEpic(effectiveProjectId, archiveTarget.id);
      } else {
        await archiveStory(effectiveProjectId, archiveTarget.id);
      }
      await refetch();
      showSuccess("Arquivado", `${archiveTarget.label} foi arquivado.`);
    } catch (e) {
      showError(e instanceof Error ? e.message : String(e));
    } finally {
      setArchiving(false);
      setArchiveTarget(null);
    }
  }, [effectiveProjectId, archiveTarget, refetch, showError, showSuccess]);

  const loading = projectLoading || backlogLoading || assigneesLoading;

  return (
    <>
      <InlineToast toast={toast} />

      <CreateEpicModal
        open={epicModalOpen}
        onClose={() => setEpicModalOpen(false)}
        onSubmit={handleCreateEpic}
      />

      <CreateStoryModal
        open={storyModal !== null}
        epicId={storyModal?.epicId ?? 0}
        epicName={storyModal?.epicName ?? ""}
        members={members}
        onClose={() => setStoryModal(null)}
        onSubmit={handleCreateStory}
      />

      <ConfirmDialog
        open={archiveTarget !== null}
        onConfirm={() => void handleConfirmArchive()}
        onCancel={() => setArchiveTarget(null)}
        title={`Arquivar ${archiveTarget?.kind === "epic" ? "Epic" : "User Story"}`}
        description={
          archiveTarget?.kind === "epic"
            ? `Tem certeza que deseja arquivar o epic "${archiveTarget.label}" e todas as suas user stories?`
            : `Tem certeza que deseja arquivar a story "${archiveTarget?.label}"?`
        }
        confirmLabel="Arquivar"
        variant="danger"
        loading={archiving}
      />

      <ProjectShell
        projectId={effectiveProjectId}
        projectName={projectName}
        projectOwnerName={projectOwnerName}
        projectBadgeLabel={projectBadgeLabel}
        activeNavItem="backlog"
        pageTitle="Product Backlog"
        pageSubtitle="Epics e User Stories do projeto, organizados por prioridade e prontidão."
        pageContextLabel="Backlog do produto"
        currentUser={placeholderUser}
        showSearch
        searchPlaceholder="Buscar por epic, story, responsável, status..."
        searchValue={query}
        onSearchChange={setQuery}
        mainColumn={
          loading ? (
            <div className="af-text-secondary text-sm">Carregando backlog…</div>
          ) : backlogError ? (
            <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {backlogError.message}
            </div>
          ) : epics.length === 0 ? (
            <ProjectEmptyState
              title="Nenhum epic cadastrado."
              description="Crie seu primeiro epic para começar a organizar as user stories do projeto."
              actionLabel="Criar Epic"
              onAction={() => setEpicModalOpen(true)}
            />
          ) : (
            <div className="space-y-4 lg:space-y-5">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setEpicModalOpen(true)}
                  className="af-focus-ring af-surface-md af-accent-hover inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white/80 transition"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Criar Epic
                </button>
              </div>

              {filteredEpics.map((epic) => {
                const storyCount = epic.userStories.length;
                const epicColor = epic.color || "#3498db";

                return (
                  <article
                    key={epic.id}
                    className="af-surface-lg bg-[#14121a]/70 px-4 py-4 sm:px-5 sm:py-4"
                    style={{ borderLeft: `3px solid ${epicColor}` }}
                  >
                    <header className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                            Epic
                          </p>
                          <InlineColor
                            value={epic.color}
                            className="group/inline inline-flex cursor-pointer items-center gap-1 rounded transition hover:bg-white/[0.06]"
                            onSave={(v) => handleUpdateEpic(epic.id, "color", v)}
                          />
                        </div>

                        {/* Line 1 — Title + metadata badges, all inline */}
                        <div className="flex flex-wrap items-center gap-2">
                          <InlineText
                            value={epic.name}
                            className="group/inline inline-flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 transition hover:bg-white/[0.06]"
                            textClassName="truncate text-sm font-semibold text-white"
                            onSave={(v) => handleUpdateEpic(epic.id, "name", v)}
                          />

                          <InlineNumber
                            value={epic.priority}
                            displayValue={`P${epic.priority}`}
                            className="group/inline af-surface-sm af-accent-chip inline-flex cursor-pointer items-center gap-1 px-2.5 py-0.5 transition hover:bg-white/[0.08]"
                            textClassName="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80"
                            onSave={(v) => handleUpdateEpic(epic.id, "priority", v)}
                          />

                          <InlineSelect
                            value={epic.businessValue}
                            displayLabel={getBadgeFor(BUSINESS_VALUE_OPTIONS, epic.businessValue).label}
                            options={BUSINESS_VALUE_OPTIONS}
                            className="group/inline inline-flex cursor-pointer items-center gap-1 transition hover:opacity-80"
                            badgeCls={getBadgeFor(BUSINESS_VALUE_OPTIONS, epic.businessValue).cls}
                            onSave={(v) => handleUpdateEpic(epic.id, "businessValue", v)}
                          />

                          <InlineSelect
                            value={epic.status}
                            displayLabel={getBadgeFor(EPIC_STATUS_OPTIONS, epic.status).label}
                            options={EPIC_STATUS_OPTIONS}
                            className="group/inline inline-flex cursor-pointer items-center gap-1 transition hover:opacity-80"
                            badgeCls={getBadgeFor(EPIC_STATUS_OPTIONS, epic.status).cls}
                            onSave={(v) => handleUpdateEpic(epic.id, "status", v)}
                          />
                        </div>

                        {/* Line 2 — Description, muted secondary text */}
                        <InlineText
                          value={epic.description}
                          placeholder="Sem descrição"
                          multiline
                          className="group/inline inline-flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 transition hover:bg-white/[0.06]"
                          textClassName="af-text-secondary text-xs line-clamp-2"
                          onSave={(v) => handleUpdateEpic(epic.id, "description", v)}
                        />
                      </div>

                      <div className="af-text-tertiary flex shrink-0 items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() =>
                            setStoryModal({ epicId: epic.id, epicName: epic.name })
                          }
                          className="af-focus-ring af-accent-hover inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-white/60 transition hover:text-white/90"
                        >
                          <Plus className="h-3 w-3" aria-hidden />
                          Story
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setArchiveTarget({
                              kind: "epic",
                              id: epic.id,
                              label: epic.name,
                            })
                          }
                          className="af-focus-ring inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-white/40 transition hover:text-red-400"
                        >
                          <Archive className="h-3 w-3" aria-hidden />
                          Arquivar
                        </button>
                        <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-1 text-[10px] text-white/70">
                          {storyCount} stories
                        </span>
                      </div>
                    </header>

                    {storyCount > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="af-separator-b flex items-center justify-between gap-3 pb-1">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                            User Story
                          </p>
                        </div>

                        <div className="af-surface-md overflow-hidden bg-black/20 px-3 py-2.5">
                          <table className="w-full table-fixed border-separate border-spacing-y-1.5">
                            <thead>
                              <tr className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/44">
                                <th className="w-[5%] px-2 py-1 text-left font-semibold" />
                                <th className="w-[33%] px-2 py-1 text-left font-semibold">Story</th>
                                <th className="w-[16%] px-2 py-1 text-left font-semibold">Assignee</th>
                                <th className="w-[14%] px-2 py-1 text-left font-semibold">Status</th>
                                <th className="w-[12%] px-2 py-1 text-left font-semibold">Value</th>
                                <th className="w-[14%] px-2 py-1 text-left font-semibold">Complexity</th>
                                <th className="w-[6%] px-2 py-1 text-left font-semibold" />
                              </tr>
                            </thead>

                            <tbody>
                              {(epic.userStories ?? []).map((story) => {
                                const storyIdStr = String(story.id);
                                const isExpanded = expandedStoryIds.has(storyIdStr);
                                const assigneeName = getAssigneeName(
                                  story.assigneeId ?? "",
                                  members,
                                  resolvedAssigneesById,
                                );

                                return (
                                  <Fragment key={story.id}>
                                    <tr className="text-[11px] text-white/76">
                                      {/* Expand toggle */}
                                      <td className="bg-white/[0.02] px-2 py-1.5 align-middle">
                                        <button
                                          type="button"
                                          aria-expanded={isExpanded}
                                          aria-label={
                                            isExpanded
                                              ? `Ocultar detalhes de ${story.title}`
                                              : `Mostrar detalhes de ${story.title}`
                                          }
                                          onClick={() => toggleStoryExpanded(storyIdStr)}
                                          className="af-focus-ring af-accent-hover inline-flex h-7 w-7 items-center justify-center text-white/60 transition hover:bg-white/[0.03] hover:text-[var(--accent-soft-35)]"
                                        >
                                          {isExpanded ? (
                                            <ChevronDown className="h-4 w-4" aria-hidden="true" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                          )}
                                        </button>
                                      </td>

                                      {/* Title (inline editable) */}
                                      <td className="bg-white/[0.02] px-2 py-1.5 align-middle break-words">
                                        <div className="min-w-0">
                                          <InlineText
                                            value={story.title}
                                            onSave={(v) => handleUpdateStory(story.id, "title", v)}
                                          />
                                          {story.persona && (
                                            <p className="mt-0.5 text-[10px] text-white/40">
                                              Como {story.persona}
                                            </p>
                                          )}
                                        </div>
                                      </td>

                                      {/* Assignee (inline editable) */}
                                      <td className="bg-white/[0.02] px-2 py-1.5 align-middle break-words">
                                        <InlineMemberSelect
                                          value={story.assigneeId}
                                          displayLabel={assigneeName}
                                          members={memberOptions}
                                          onSave={(v) => handleUpdateStory(story.id, "assigneeId", v)}
                                        />
                                      </td>

                                      {/* Status (inline editable) */}
                                      <td className="bg-white/[0.02] px-2 py-1.5 align-middle break-words">
                                        <InlineSelect
                                          value={story.status}
                                          displayLabel={getBadgeFor(STORY_STATUS_OPTIONS, story.status).label}
                                          options={STORY_STATUS_OPTIONS}
                                          badgeCls={getBadgeFor(STORY_STATUS_OPTIONS, story.status).cls}
                                          onSave={(v) => handleUpdateStory(story.id, "status", v)}
                                        />
                                      </td>

                                      {/* Business Value (inline editable) */}
                                      <td className="bg-white/[0.02] px-2 py-1.5 align-middle break-words">
                                        <InlineSelect
                                          value={story.businessValue}
                                          displayLabel={getBadgeFor(BUSINESS_VALUE_OPTIONS, story.businessValue).label}
                                          options={BUSINESS_VALUE_OPTIONS}
                                          badgeCls={getBadgeFor(BUSINESS_VALUE_OPTIONS, story.businessValue).cls}
                                          onSave={(v) => handleUpdateStory(story.id, "businessValue", v)}
                                        />
                                      </td>

                                      {/* Complexity (inline editable) */}
                                      <td className="bg-white/[0.02] px-2 py-1.5 align-middle break-words">
                                        <InlineSelect
                                          value={story.complexity}
                                          displayLabel={getBadgeFor(COMPLEXITY_OPTIONS, story.complexity).label}
                                          options={COMPLEXITY_OPTIONS}
                                          badgeCls={getBadgeFor(COMPLEXITY_OPTIONS, story.complexity).cls}
                                          onSave={(v) => handleUpdateStory(story.id, "complexity", v)}
                                        />
                                      </td>

                                      {/* Archive action */}
                                      <td className="bg-white/[0.02] px-2 py-1.5 align-middle">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setArchiveTarget({
                                              kind: "story",
                                              id: story.id,
                                              label: story.title,
                                            })
                                          }
                                          className="af-focus-ring inline-flex h-7 w-7 items-center justify-center text-white/30 transition hover:text-red-400"
                                          title="Arquivar story"
                                        >
                                          <Archive className="h-3.5 w-3.5" aria-hidden />
                                        </button>
                                      </td>
                                    </tr>

                                    {isExpanded && (
                                      <tr>
                                        <td colSpan={7} className="px-0 pt-0.5">
                                          <div className="af-surface-md bg-transparent px-3 py-3">
                                            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
                                              <div className="space-y-3">
                                                <div>
                                                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                                                    Persona
                                                  </p>
                                                  <div className="mt-1 text-xs">
                                                    <InlineText
                                                      value={story.persona}
                                                      placeholder="Sem persona"
                                                      onSave={(v) => handleUpdateStory(story.id, "persona", v)}
                                                    />
                                                  </div>
                                                </div>

                                                <div>
                                                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                                                    Descrição
                                                  </p>
                                                  <div className="mt-1 text-xs">
                                                    <InlineText
                                                      value={story.description}
                                                      placeholder="Sem descrição"
                                                      multiline
                                                      onSave={(v) => handleUpdateStory(story.id, "description", v)}
                                                    />
                                                  </div>
                                                </div>

                                                <div>
                                                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                                                    Critérios de Aceite
                                                  </p>
                                                  <div className="mt-1 text-xs">
                                                    <InlineText
                                                      value={getAcceptanceCriteriaValue(story)}
                                                      placeholder="—"
                                                      multiline
                                                      onSave={(v) => handleUpdateStory(story.id, "acceptanceCriteria", v)}
                                                    />
                                                  </div>
                                                </div>

                                                <div>
                                                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                                                    Dependências
                                                  </p>
                                                  <div className="mt-1 text-xs">
                                                    <InlineText
                                                      value={story.dependencies}
                                                      placeholder="—"
                                                      onSave={(v) => handleUpdateStory(story.id, "dependencies", v)}
                                                    />
                                                  </div>
                                                </div>
                                              </div>

                                              <div className="space-y-2">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                                                  Detalhes
                                                </p>
                                                <div className="flex flex-wrap gap-1.5 text-[10px] text-white/72">
                                                  <span className="af-surface-sm inline-flex h-6 items-center bg-white/5 px-2 py-0 leading-none">
                                                    Effort{" "}
                                                    <InlineNumber
                                                      value={story.effort}
                                                      displayValue={String(story.effort ?? 0)}
                                                      onSave={(v) => handleUpdateStory(story.id, "effort", v)}
                                                    />
                                                  </span>
                                                  <span className="af-surface-sm inline-flex h-6 items-center bg-white/5 px-2 py-0 leading-none">
                                                    <InlineNumber
                                                      value={story.priority}
                                                      displayValue={`P${story.priority}`}
                                                      onSave={(v) => handleUpdateStory(story.id, "priority", v)}
                                                    />
                                                  </span>
                                                  <EnumBadge options={BUSINESS_VALUE_OPTIONS} value={story.businessValue} />
                                                  <EnumBadge options={COMPLEXITY_OPTIONS} value={story.complexity} />
                                                  <EnumBadge options={STORY_STATUS_OPTIONS} value={story.status} />
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )
        }
        sideColumn={
          loading || backlogError || epics.length === 0
            ? undefined
            : (
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
                        {epics.length}
                      </dd>
                    </div>
                  </dl>
                </section>
              </>
            )
        }
      />
    </>
  );
}
