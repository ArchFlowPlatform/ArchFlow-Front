"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Paperclip, Plus, Tag, Trash2, X } from "lucide-react";

import type { KanbanCardView } from "@/features/projects/mocks/kanban.mock";
import { getCardSystemBadges } from "@/features/projects/mocks/kanban.mock";
import EnumBadge from "@/components/ui/EnumBadge";
import { BUSINESS_VALUE_OPTIONS, STORY_STATUS_OPTIONS } from "@/lib/enum-labels";
import { useCardComments } from "@/features/card-comments/hooks/useCardComments";
import { useCardLabels } from "@/features/card-labels/hooks/useCardLabels";
import { useCardAttachments } from "@/features/card-attachments/hooks/useCardAttachments";
import { useCardActivities } from "@/features/card-activities/hooks/useCardActivities";
import { useLabels } from "@/features/labels/hooks/useLabels";
import { createComment, deleteComment } from "@/features/card-comments/api/card-comments.api";
import { addLabelToCard, removeLabelFromCard } from "@/features/card-labels/api/card-labels.api";
import { createAttachment, deleteAttachment } from "@/features/card-attachments/api/card-attachments.api";
import { createLabel } from "@/features/labels/api/labels.api";
import {
  createTask,
  deleteTask,
  updateTask,
} from "@/features/story-tasks/api/story-tasks.api";
import { useStoryTasks } from "@/features/story-tasks/hooks/useStoryTasks";
import { useProject } from "@/features/projects/hooks/useProject";
import type { User } from "@/types/user";
import UserAvatar from "../ui/UserAvatar";
import SystemBadge from "./SystemBadge";
import UserLabelBadge from "./UserLabelBadge";
import TaskStatusSelect from "@/components/tasks/TaskStatusSelect";
import {
  normalizeStoryTaskStatus,
  type StoryTaskStatus,
} from "@/lib/story-task-status";

function formatDateTime(dateISO: string): string {
  return new Date(dateISO).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resolveUser(userId: string, members: { user?: User }[]): User {
  const m = members.find((x) => x.user?.id === userId);
  if (m?.user) return m.user;
  return {
    id: userId,
    name: "—",
    email: "",
    type: "",
    avatarUrl: "",
    createdAt: "",
    updatedAt: "",
  } as User;
}

interface KanbanModalProps {
  projectId?: string;
  /** Current sprint (board scope); required for sprint-item tasks. */
  sprintId?: string | null;
  card: KanbanCardView | null;
  onClose: () => void;
  onRefetch?: () => void;
}

export default function KanbanModal({
  projectId,
  sprintId,
  card,
  onClose,
  onRefetch,
}: KanbanModalProps) {
  const cardId = card ? Number(card.id) : null;
  const pid = projectId || null;
  const { project } = useProject(pid);
  const members = project?.members ?? [];

  const {
    comments: apiComments,
    loading: commentsLoading,
    refetch: refetchComments,
  } = useCardComments(pid, cardId);
  const {
    cardLabels: apiCardLabels,
    loading: cardLabelsLoading,
    refetch: refetchCardLabels,
  } = useCardLabels(pid, cardId);
  const {
    attachments: apiAttachments,
    refetch: refetchAttachments,
  } = useCardAttachments(pid, cardId);
  const { activities: apiActivities } = useCardActivities(pid, cardId);
  const { labels: projectLabels, refetch: refetchProjectLabels } = useLabels(pid);

  const sprintItemIdForTasks = card?.sprintItemId ?? null;
  const {
    tasks: storyTasks,
    loading: storyTasksLoading,
    refetch: refetchStoryTasks,
  } = useStoryTasks(pid, sprintId ?? null, sprintItemIdForTasks);

  const [newCommentContent, setNewCommentContent] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#8b5cf6");
  const [labelComposerOpen, setLabelComposerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUserLabels = useMemo(() => {
    const fromApi = apiCardLabels.map((cl) => {
      const pl = projectLabels.find((l) => l.id === cl.labelId);
      return {
        id: String(cl.id),
        labelId: cl.labelId,
        name: cl.label?.name ?? pl?.name ?? "—",
        color: cl.label?.color ?? pl?.color ?? "#666",
        removable: true as const,
      };
    });
    if (fromApi.length > 0) return fromApi;
    const fromBoard = (card?.userLabels ?? []).map((l) => ({
      id: l.id,
      labelId: Number.NaN,
      name: l.name,
      color: l.color,
      removable: false as const,
    }));
    if (cardLabelsLoading) return fromBoard;
    return fromBoard;
  }, [apiCardLabels, projectLabels, card?.userLabels, cardLabelsLoading]);

  const attachedLabelIds = new Set(apiCardLabels.map((cl) => cl.labelId));
  const availableLabels = projectLabels.filter(
    (l) => !attachedLabelIds.has(l.id)
  );

  const displayComments = apiComments.map((c) => ({
    id: c.id,
    author: resolveUser(c.userId, members),
    body: c.content,
    type: (c.parentCommentId != null ? "note" : "comment") as
      | "comment"
      | "note",
    createdAt: c.createdAt,
    createdAtLabel: formatDateTime(c.createdAt),
  }));

  const handleAddComment = useCallback(async () => {
    if (!projectId || cardId == null || !newCommentContent.trim()) return;
    setCommentSubmitting(true);
    try {
      await createComment(projectId, cardId, {
        content: newCommentContent.trim(),
      });
      setNewCommentContent("");
      await refetchComments();
      onRefetch?.();
    } catch {
      // silent
    } finally {
      setCommentSubmitting(false);
    }
  }, [projectId, cardId, newCommentContent, refetchComments, onRefetch]);

  const handleDeleteComment = useCallback(
    async (commentId: number) => {
      if (!projectId || cardId == null) return;
      setMutating(true);
      try {
        await deleteComment(projectId, cardId, commentId);
        await refetchComments();
      } catch {
        // silent
      } finally {
        setMutating(false);
      }
    },
    [projectId, cardId, refetchComments]
  );

  const handleAddLabel = useCallback(
    async (labelId: number) => {
      if (!projectId || cardId == null) return;
      setMutating(true);
      try {
        await addLabelToCard(projectId, cardId, { labelId });
        await refetchCardLabels();
        onRefetch?.();
      } catch {
        // silent
      } finally {
        setMutating(false);
      }
    },
    [projectId, cardId, refetchCardLabels, onRefetch]
  );

  const handleRemoveLabel = useCallback(
    async (cardLabelId: number) => {
      if (!projectId || cardId == null) return;
      setMutating(true);
      try {
        await removeLabelFromCard(projectId, cardId, cardLabelId);
        await refetchCardLabels();
        onRefetch?.();
      } catch {
        // silent
      } finally {
        setMutating(false);
      }
    },
    [projectId, cardId, refetchCardLabels, onRefetch]
  );

  const handleUploadAttachment = useCallback(
    async (file: File) => {
      if (!projectId || cardId == null) return;
      setMutating(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        await createAttachment(projectId, cardId, formData);
        await refetchAttachments();
      } catch {
        // silent
      } finally {
        setMutating(false);
      }
    },
    [projectId, cardId, refetchAttachments]
  );

  const handleDeleteAttachment = useCallback(
    async (attachmentId: number) => {
      if (!projectId || cardId == null) return;
      setMutating(true);
      try {
        await deleteAttachment(projectId, cardId, attachmentId);
        await refetchAttachments();
      } catch {
        // silent
      } finally {
        setMutating(false);
      }
    },
    [projectId, cardId, refetchAttachments]
  );

  const handleAddStoryTask = useCallback(async () => {
    if (!projectId || !sprintId || sprintItemIdForTasks == null) return;
    const t = newTaskTitle.trim();
    if (!t) return;
    setMutating(true);
    try {
      await createTask(projectId, sprintId, sprintItemIdForTasks, { title: t });
      setNewTaskTitle("");
      await refetchStoryTasks();
      onRefetch?.();
    } catch {
      // silent
    } finally {
      setMutating(false);
    }
  }, [
    projectId,
    sprintId,
    sprintItemIdForTasks,
    newTaskTitle,
    refetchStoryTasks,
    onRefetch,
  ]);

  const handleStoryTaskStatusChange = useCallback(
    async (taskId: number, next: StoryTaskStatus) => {
      if (!projectId || !sprintId || sprintItemIdForTasks == null) return;
      setMutating(true);
      try {
        await updateTask(projectId, sprintId, sprintItemIdForTasks, taskId, {
          status: next,
        });
        await refetchStoryTasks();
        onRefetch?.();
      } catch {
        // silent
      } finally {
        setMutating(false);
      }
    },
    [projectId, sprintId, sprintItemIdForTasks, refetchStoryTasks, onRefetch]
  );

  const handleDeleteStoryTask = useCallback(
    async (taskId: number) => {
      if (!projectId || !sprintId || sprintItemIdForTasks == null) return;
      setMutating(true);
      try {
        await deleteTask(projectId, sprintId, sprintItemIdForTasks, taskId);
        await refetchStoryTasks();
        onRefetch?.();
      } catch {
        // silent
      } finally {
        setMutating(false);
      }
    },
    [projectId, sprintId, sprintItemIdForTasks, refetchStoryTasks, onRefetch]
  );

  const handleCreateAndAttachLabel = useCallback(async () => {
    if (!projectId || cardId == null) return;
    const name = newLabelName.trim();
    if (!name) return;
    setMutating(true);
    try {
      const created = await createLabel(projectId, { name, color: newLabelColor });
      await addLabelToCard(projectId, cardId, { labelId: created.id });
      setNewLabelName("");
      setLabelComposerOpen(false);
      await refetchProjectLabels();
      await refetchCardLabels();
      onRefetch?.();
    } catch {
      // silent
    } finally {
      setMutating(false);
    }
  }, [
    projectId,
    cardId,
    newLabelName,
    newLabelColor,
    refetchProjectLabels,
    refetchCardLabels,
    onRefetch,
  ]);

  useEffect(() => {
    setLabelComposerOpen(false);
    setNewLabelName("");
  }, [card?.id]);

  useEffect(() => {
    if (!card) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [card, onClose]);

  if (!card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-[2px]">
      <div className="af-surface-lg flex max-h-[min(92dvh,900px)] w-full max-w-6xl flex-col overflow-hidden bg-[#14121a]/96">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.85fr)]">
          {/* ───── LEFT: card detail ───── */}
          <section className="flex min-h-0 flex-col overflow-hidden border-b border-white/8 lg:border-b-0 lg:border-r">
            <header className="shrink-0 px-4 pb-4 pt-4 sm:px-5 sm:pt-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-3">
                  <h2 className="text-lg font-semibold text-white">
                    {card.title}
                  </h2>
                  {displayUserLabels.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {displayUserLabels.map((label) =>
                        label.removable ? (
                          <button
                            key={label.id}
                            type="button"
                            disabled={mutating}
                            onClick={() =>
                              void handleRemoveLabel(Number(label.id))
                            }
                            className="group relative"
                            title="Remover label"
                          >
                            <UserLabelBadge
                              name={label.name}
                              color={label.color}
                            />
                            <span className="absolute -right-1 -top-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] text-white group-hover:inline-flex">
                              ×
                            </span>
                          </button>
                        ) : (
                          <UserLabelBadge
                            key={label.id}
                            name={label.name}
                            color={label.color}
                          />
                        ),
                      )}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-1.5">
                    {(getCardSystemBadges(card) ?? []).map((badge) => (
                      <SystemBadge key={badge}>{badge}</SystemBadge>
                    ))}
                    <EnumBadge options={BUSINESS_VALUE_OPTIONS} value={card.businessValue} />
                    <EnumBadge options={STORY_STATUS_OPTIONS} value={card.status} />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="af-focus-ring af-accent-hover inline-flex items-center gap-2 px-2 py-2 text-sm text-white/76 transition hover:bg-white/[0.03] hover:text-[var(--accent-soft-35)]"
                >
                  <X
                    className="af-accent-icon h-4 w-4"
                    aria-hidden="true"
                  />
                  <span>Fechar</span>
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-5 sm:pb-5">
            <div className="space-y-5">
              <section className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Descrição do card
                </p>
                <p className="text-sm leading-relaxed text-white/72">
                  {card.description}
                </p>
              </section>

              <section className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  User Story
                </p>
                <div className="af-surface-md bg-white/[0.03] px-3 py-3">
                  <div className="space-y-2">
                    {displayUserLabels.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {displayUserLabels.map((label) => (
                          <UserLabelBadge
                            key={label.id}
                            name={label.name}
                            color={label.color}
                          />
                        ))}
                      </div>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2">
                      <SystemBadge>{`Effort: ${card.effort}`}</SystemBadge>
                      <EnumBadge options={BUSINESS_VALUE_OPTIONS} value={card.businessValue} />
                      <EnumBadge options={STORY_STATUS_OPTIONS} value={card.status} />
                      <SystemBadge>{card.dueDateLabel}</SystemBadge>
                      {(card.linkedChips ?? []).map((chip) => (
                        <SystemBadge key={chip}>{chip}</SystemBadge>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">
                      {card.title}
                    </h3>
                  </div>
                  <p className="af-text-tertiary mt-2 text-[11px]">
                    {card.persona}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/72">
                    {card.description}
                  </p>
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Critérios de aceitação
                </p>
                  <div className="space-y-2">
                    {(Array.isArray(card.acceptanceCriteria)
                      ? card.acceptanceCriteria
                      : typeof card.acceptanceCriteria === "string"
                        ? [card.acceptanceCriteria]
                        : []
                    ).map((criterion, i) => (
                      <div
                        key={i}
                        className="af-surface-md bg-white/[0.03] px-3 py-2 text-sm text-white/70"
                      >
                        {criterion}
                      </div>
                    ))}
                  </div>
              </section>

              <section className="space-y-2">
                <div className="af-separator-b pb-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                    Tasks (sprint item)
                  </p>
                </div>
                {!sprintId || sprintItemIdForTasks == null ? (
                  <p className="af-text-tertiary text-[11px] leading-relaxed">
                    Inclua esta user story como item da sprint atual no sprint
                    backlog para criar e acompanhar tarefas (mesma API do sprint
                    item).
                  </p>
                ) : storyTasksLoading ? (
                  <p className="af-text-tertiary text-[11px]">Carregando tarefas…</p>
                ) : (
                  <div className="flex max-h-[min(40vh,280px)] flex-col gap-2">
                    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-0.5">
                    {storyTasks.length === 0 ? (
                      <p className="af-text-tertiary text-[11px]">
                        Nenhuma tarefa ainda. Adicione abaixo (mesmas tarefas do
                        sprint backlog).
                      </p>
                    ) : null}
                    {storyTasks.map((task) => {
                      const assignee = resolveUser(
                        task.assigneeId ?? "",
                        members,
                      );
                      const status = normalizeStoryTaskStatus(task.status);
                      return (
                        <div
                          key={task.id}
                          className="af-surface-md flex flex-col gap-3 bg-white/[0.03] px-3 py-3 sm:flex-row sm:items-center"
                        >
                          <TaskStatusSelect
                            value={status}
                            disabled={mutating}
                            onChange={(next) =>
                              void handleStoryTaskStatusChange(task.id, next)
                            }
                          />
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4
                                className={`text-sm ${
                                  status === 2
                                    ? "text-white/45 line-through"
                                    : status === 1
                                      ? "text-amber-100/95"
                                      : "text-white"
                                }`}
                              >
                                {task.title}
                              </h4>
                            </div>
                            <p className="af-text-tertiary text-[11px]">
                              {assignee.name}
                              {task.estimatedHours != null
                                ? ` · ${task.estimatedHours}h`
                                : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={mutating}
                            aria-label="Excluir tarefa"
                            onClick={() => void handleDeleteStoryTask(task.id)}
                            className="af-focus-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/35 transition hover:bg-red-500/15 hover:text-red-400 disabled:opacity-30"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </div>
                      );
                    })}
                    </div>
                    <div className="shrink-0 flex flex-col gap-2 border-t border-white/8 pt-2 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void handleAddStoryTask();
                        }}
                        disabled={mutating}
                        placeholder="Nova tarefa…"
                        className="af-focus-ring min-w-0 flex-1 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30"
                      />
                      <button
                        type="button"
                        disabled={mutating || !newTaskTitle.trim()}
                        onClick={() => void handleAddStoryTask()}
                        className="af-focus-ring af-surface-md shrink-0 px-3 py-2 text-xs font-medium text-white/85 transition hover:bg-white/[0.06] disabled:opacity-40"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </div>
            </div>
          </section>

          {/* ───── RIGHT: sidebar (comments, labels, attachments, activity) ───── */}
          <aside className="af-separator-t flex min-h-0 flex-col overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5 lg:border-t-0 lg:border-l lg:border-white/8 lg:shadow-[inset_1px_0_0_rgba(255,255,255,0.03)]">
            <div className="space-y-4">
              {/* Assignee / meta */}
              <section className="af-surface-lg bg-white/[0.02] px-4 py-4">
                <header className="af-separator-b pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Atribuição
                      </h3>
                      <p className="af-text-secondary mt-1 text-xs">
                        Responsável e metadados
                      </p>
                    </div>
                    <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5 text-[10px] text-white/72">
                      Card
                    </span>
                  </div>
                </header>
                <div className="af-text-secondary mt-3 space-y-2.5 text-[11px]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5 text-[10px] text-white/65">
                      Assignee
                    </span>
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        user={card.assignee}
                        className="af-surface-sm h-7 w-7 bg-black/20 text-[10px] font-semibold text-white/80"
                        fallbackClassName="text-[10px] font-semibold"
                      />
                      <span>{card.assignee.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5 text-[10px] text-white/65">
                      Created
                    </span>
                    <span>{card.createdAtLabel}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5 text-[10px] text-white/65">
                      Updated
                    </span>
                    <span>{card.updatedAtLabel}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5 text-[10px] text-white/65">
                      Linked
                    </span>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {(card.linkedChips ?? []).map((badge) => (
                        <SystemBadge key={badge}>{badge}</SystemBadge>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Labels */}
              <section className="af-surface-lg bg-white/[0.02] px-4 py-4">
                <header className="af-separator-b pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white">Labels</h3>
                    <Tag className="h-3.5 w-3.5 text-white/40" aria-hidden />
                  </div>
                </header>
                <div className="mt-3 space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {displayUserLabels.length > 0 ? (
                      displayUserLabels.map((label) =>
                        label.removable ? (
                          <button
                            key={label.id}
                            type="button"
                            disabled={mutating}
                            onClick={() =>
                              void handleRemoveLabel(Number(label.id))
                            }
                            className="group relative"
                            title="Remover label"
                          >
                            <UserLabelBadge
                              name={label.name}
                              color={label.color}
                            />
                            <span className="absolute -right-1 -top-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] text-white group-hover:inline-flex">
                              ×
                            </span>
                          </button>
                        ) : (
                          <UserLabelBadge
                            key={label.id}
                            name={label.name}
                            color={label.color}
                          />
                        ),
                      )
                    ) : (
                      <p className="af-text-tertiary text-[11px]">
                        Nenhuma label adicionada.
                      </p>
                    )}
                    {projectId ? (
                      <button
                        type="button"
                        disabled={mutating}
                        onClick={() => setLabelComposerOpen((o) => !o)}
                        className="af-focus-ring inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-dashed border-white/20 text-white/55 transition hover:border-white/35 hover:text-white/85 disabled:opacity-40"
                        title="Nova label"
                        aria-expanded={labelComposerOpen}
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    ) : null}
                  </div>
                  {availableLabels.length > 0 ? (
                    <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto overscroll-contain pt-1">
                      {availableLabels.map((label) => (
                        <button
                          key={label.id}
                          type="button"
                          disabled={mutating}
                          onClick={() => void handleAddLabel(label.id)}
                          className="af-focus-ring inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/60 transition hover:border-white/20 hover:text-white/80 disabled:opacity-40"
                        >
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: label.color }}
                          />
                          {label.name}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {projectId && labelComposerOpen ? (
                    <div className="af-separator-t border-white/8 pt-3">
                      <div className="flex flex-wrap items-end gap-2">
                        <input
                          type="text"
                          value={newLabelName}
                          onChange={(e) => setNewLabelName(e.target.value)}
                          disabled={mutating}
                          placeholder="Nome da label"
                          className="af-focus-ring min-w-[8rem] flex-1 rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white placeholder:text-white/30"
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setLabelComposerOpen(false);
                              setNewLabelName("");
                            }
                          }}
                        />
                        <input
                          type="color"
                          value={newLabelColor}
                          onChange={(e) => setNewLabelColor(e.target.value)}
                          disabled={mutating}
                          className="h-9 w-11 shrink-0 cursor-pointer rounded border border-white/10 bg-transparent"
                          aria-label="Cor da label"
                        />
                        <button
                          type="button"
                          disabled={mutating || !newLabelName.trim()}
                          onClick={() => void handleCreateAndAttachLabel()}
                          className="af-focus-ring af-surface-md shrink-0 px-3 py-1.5 text-xs font-medium text-white/85 transition hover:bg-white/[0.06] disabled:opacity-40"
                        >
                          Criar
                        </button>
                        <button
                          type="button"
                          disabled={mutating}
                          onClick={() => {
                            setLabelComposerOpen(false);
                            setNewLabelName("");
                          }}
                          className="af-focus-ring shrink-0 px-2 py-1.5 text-xs text-white/50 transition hover:text-white/80"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>

              {/* Comments */}
              <section className="af-surface-lg bg-white/[0.02] px-4 py-4">
                <header className="af-separator-b pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Comentários
                      </h3>
                      <p className="af-text-secondary mt-1 text-xs">
                        Discussão do item
                      </p>
                    </div>
                    <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5 text-[10px] text-white/72">
                      {displayComments.length}
                    </span>
                  </div>
                </header>

                <div className="mt-3 space-y-2.5">
                  {commentsLoading && displayComments.length === 0 ? (
                    <p className="af-text-tertiary text-[11px]">Carregando…</p>
                  ) : null}

                  <div className="max-h-56 space-y-2.5 overflow-y-auto overscroll-contain pr-0.5">
                  {displayComments.map((comment) => (
                    <article
                      key={comment.id}
                      className="group af-surface-md bg-white/[0.03] px-3 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-2.5">
                          <UserAvatar
                            user={comment.author}
                            className="af-surface-sm h-7 w-7 shrink-0 bg-black/20 text-[10px] font-semibold text-white/80"
                            fallbackClassName="text-[10px] font-semibold"
                          />
                          <div className="min-w-0">
                            <p className="text-sm text-white">
                              {comment.author.name}
                            </p>
                            <p className="af-text-tertiary text-[11px]">
                              {comment.createdAtLabel}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5 text-[10px] text-white/65">
                            {comment.type}
                          </span>
                          <button
                            type="button"
                            disabled={mutating}
                            onClick={() => handleDeleteComment(comment.id)}
                            className="af-focus-ring inline-flex h-6 w-6 items-center justify-center rounded text-white/30 opacity-0 transition hover:bg-red-500/15 hover:text-red-400 group-hover:opacity-100 disabled:opacity-30"
                            title="Excluir comentário"
                          >
                            <Trash2 className="h-3 w-3" aria-hidden />
                          </button>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-white/72">
                        {comment.body}
                      </p>
                    </article>
                  ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleAddComment();
                    }}
                    className="mt-3 shrink-0 space-y-2"
                  >
                    <textarea
                      value={newCommentContent}
                      onChange={(e) => setNewCommentContent(e.target.value)}
                      placeholder="Adicionar comentário..."
                      rows={2}
                      className="af-surface-md w-full resize-y rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus:border-white/20 focus:outline-none"
                      disabled={commentSubmitting}
                    />
                    <button
                      type="submit"
                      disabled={commentSubmitting || !newCommentContent.trim()}
                      className="af-focus-ring af-accent-hover inline-flex h-8 items-center px-3 text-sm text-white/80 disabled:opacity-50"
                    >
                      {commentSubmitting ? "Enviando…" : "Enviar"}
                    </button>
                  </form>
                </div>
              </section>

              {/* Attachments */}
              <section className="af-surface-lg bg-white/[0.02] px-4 py-4">
                <header className="af-separator-b pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white">Anexos</h3>
                    <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5 text-[10px] text-white/72">
                      {apiAttachments.length}
                    </span>
                  </div>
                </header>
                <div className="mt-3 space-y-1.5">
                  {apiAttachments.map((a) => (
                    <div
                      key={a.id}
                      className="group flex items-center justify-between gap-2 text-xs text-white/70"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Paperclip
                          className="h-3 w-3 shrink-0 text-white/40"
                          aria-hidden
                        />
                        <span className="truncate">{a.fileName}</span>
                        {a.fileSize ? (
                          <span className="af-text-tertiary shrink-0 text-[10px]">
                            ({Math.round(a.fileSize / 1024)} KB)
                          </span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        disabled={mutating}
                        onClick={() => handleDeleteAttachment(a.id)}
                        className="af-focus-ring inline-flex h-5 w-5 items-center justify-center rounded text-white/30 opacity-0 transition hover:text-red-400 group-hover:opacity-100 disabled:opacity-30"
                        title="Excluir anexo"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden />
                      </button>
                    </div>
                  ))}
                  <div className="pt-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleUploadAttachment(file);
                        e.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      disabled={mutating}
                      onClick={() => fileInputRef.current?.click()}
                      className="af-focus-ring af-accent-hover inline-flex items-center gap-1.5 px-2 py-1 text-[11px] text-white/60 transition hover:text-white/80 disabled:opacity-40"
                    >
                      <Paperclip className="h-3 w-3" aria-hidden />
                      Adicionar anexo
                    </button>
                  </div>
                </div>
              </section>

              {/* Activity */}
              {apiActivities.length > 0 ? (
                <section className="af-surface-lg bg-white/[0.02] px-4 py-4">
                  <header className="af-separator-b pb-3">
                    <h3 className="text-sm font-semibold text-white">
                      Atividade
                    </h3>
                  </header>
                  <ul className="af-text-secondary mt-3 space-y-1.5 text-xs">
                    {apiActivities.slice(0, 10).map((a) => (
                      <li key={a.id}>
                        {a.description || a.activityType}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
