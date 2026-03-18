"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Paperclip, Tag, Trash2, X } from "lucide-react";

import type { KanbanCardView } from "@/features/projects/mocks/kanban.mock";
import {
  formatKanbanStoryStatus,
  getCardSystemBadges,
} from "@/features/projects/mocks/kanban.mock";
import { useCardComments } from "@/features/card-comments/hooks/useCardComments";
import { useCardLabels } from "@/features/card-labels/hooks/useCardLabels";
import { useCardAttachments } from "@/features/card-attachments/hooks/useCardAttachments";
import { useCardActivities } from "@/features/card-activities/hooks/useCardActivities";
import { useLabels } from "@/features/labels/hooks/useLabels";
import { createComment, deleteComment } from "@/features/card-comments/api/card-comments.api";
import { addLabelToCard, removeLabelFromCard } from "@/features/card-labels/api/card-labels.api";
import { createAttachment, deleteAttachment } from "@/features/card-attachments/api/card-attachments.api";
import { useProject } from "@/features/projects/hooks/useProject";
import type { User } from "@/types/user";
import UserAvatar from "../ui/UserAvatar";
import SystemBadge from "./SystemBadge";
import UserLabelBadge from "./UserLabelBadge";

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
  card: KanbanCardView | null;
  onClose: () => void;
  onRefetch?: () => void;
}

export default function KanbanModal({
  projectId,
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
    refetch: refetchCardLabels,
  } = useCardLabels(pid, cardId);
  const {
    attachments: apiAttachments,
    refetch: refetchAttachments,
  } = useCardAttachments(pid, cardId);
  const { activities: apiActivities } = useCardActivities(pid, cardId);
  const { labels: projectLabels } = useLabels(pid);

  const [newCommentContent, setNewCommentContent] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [mutating, setMutating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUserLabels =
    apiCardLabels.length > 0
      ? apiCardLabels.map((cl) => ({
          id: String(cl.id),
          labelId: cl.labelId,
          name: cl.label?.name ?? "—",
          color: cl.label?.color ?? "#666",
        }))
      : (card?.userLabels ?? []).map((l) => ({
          ...l,
          labelId: Number(l.id),
        }));

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
      } catch {
        // silent
      } finally {
        setMutating(false);
      }
    },
    [projectId, cardId, refetchCardLabels]
  );

  const handleRemoveLabel = useCallback(
    async (cardLabelId: number) => {
      if (!projectId || cardId == null) return;
      setMutating(true);
      try {
        await removeLabelFromCard(projectId, cardId, cardLabelId);
        await refetchCardLabels();
      } catch {
        // silent
      } finally {
        setMutating(false);
      }
    },
    [projectId, cardId, refetchCardLabels]
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="af-surface-lg max-h-[90vh] w-full max-w-6xl overflow-hidden bg-[#14121a]/96"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid max-h-[90vh] min-h-0 gap-0 lg:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.85fr)]">
          {/* ───── LEFT: card detail ───── */}
          <section className="min-h-0 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
            <header className="af-separator-b pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-3">
                  <h2 className="text-lg font-semibold text-white">
                    {card.title}
                  </h2>
                  {displayUserLabels.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {displayUserLabels.map((label) => (
                        <button
                          key={label.id}
                          type="button"
                          disabled={mutating}
                          onClick={() =>
                            handleRemoveLabel(Number(label.id))
                          }
                          className="group relative"
                          title="Click to remove"
                        >
                          <UserLabelBadge
                            name={label.name}
                            color={label.color}
                          />
                          <span className="absolute -right-1 -top-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] text-white group-hover:inline-flex">
                            ×
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-1.5">
                    {(getCardSystemBadges(card) ?? []).map((badge) => (
                      <SystemBadge key={badge}>{badge}</SystemBadge>
                    ))}
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

            <div className="mt-4 space-y-5">
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
                      {[
                        `Effort: ${card.effort}`,
                        `BV ${card.businessValue}`,
                        formatKanbanStoryStatus(card.status),
                        card.dueDateLabel,
                        ...(card.linkedChips ?? []),
                      ].map((badge) => (
                        <SystemBadge key={badge}>{badge}</SystemBadge>
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
                  ).map((criterion) => (
                    <div
                      key={criterion}
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
                    Tasks
                  </p>
                </div>
                <div className="space-y-2">
                  {(card.tasks ?? []).map((task) => (
                    <div
                      key={task.id}
                      className="af-surface-md flex items-start justify-between gap-3 bg-white/[0.03] px-3 py-3"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm text-white">{task.title}</h4>
                          <SystemBadge className="h-6 py-0 leading-none">
                            {task.priority}
                          </SystemBadge>
                        </div>
                        <p className="af-text-tertiary text-[11px]">
                          {task.assignee.name}
                        </p>
                      </div>
                      <span className="af-surface-sm inline-flex h-6 shrink-0 items-center bg-black/30 px-2 py-0 text-[10px] leading-none text-white/72">
                        {task.doneHours}h / {task.estimatedHours}h
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </section>

          {/* ───── RIGHT: sidebar (comments, labels, attachments, activity) ───── */}
          <aside className="af-separator-t min-h-0 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 lg:border-t-0 lg:border-l lg:border-white/8 lg:shadow-[inset_1px_0_0_rgba(255,255,255,0.03)]">
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
                  {displayUserLabels.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {displayUserLabels.map((label) => (
                        <button
                          key={label.id}
                          type="button"
                          disabled={mutating}
                          onClick={() =>
                            handleRemoveLabel(Number(label.id))
                          }
                          className="group relative"
                          title="Click to remove label"
                        >
                          <UserLabelBadge
                            name={label.name}
                            color={label.color}
                          />
                          <span className="absolute -right-1 -top-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] text-white group-hover:inline-flex">
                            ×
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="af-text-tertiary text-[11px]">
                      Nenhuma label adicionada.
                    </p>
                  )}
                  {availableLabels.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {availableLabels.map((label) => (
                        <button
                          key={label.id}
                          type="button"
                          disabled={mutating}
                          onClick={() => handleAddLabel(label.id)}
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

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleAddComment();
                    }}
                    className="mt-3 space-y-2"
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
