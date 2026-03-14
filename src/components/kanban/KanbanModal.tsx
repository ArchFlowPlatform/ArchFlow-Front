import { useEffect } from "react";
import { X } from "lucide-react";

import type { KanbanCardView } from "../../views/projects/kanban/_mocks/kanban.mock";
import {
  formatKanbanStoryStatus,
  getCardSystemBadges,
} from "../../views/projects/kanban/_mocks/kanban.mock";
import UserAvatar from "../ui/UserAvatar";
import SystemBadge from "./SystemBadge";
import UserLabelBadge from "./UserLabelBadge";

interface KanbanModalProps {
  card: KanbanCardView | null;
  onClose: () => void;
}

export default function KanbanModal({ card, onClose }: KanbanModalProps) {
  useEffect(() => {
    if (!card) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [card, onClose]);

  if (!card) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="af-surface-lg max-h-[90vh] w-full max-w-6xl overflow-hidden bg-[#14121a]/96"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid max-h-[90vh] min-h-0 gap-0 lg:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.85fr)]">
          <section className="min-h-0 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
            <header className="af-separator-b pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-3">
                  <h2 className="text-lg font-semibold text-white">{card.title}</h2>
                  {card.userLabels.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {card.userLabels.map((label) => (
                        <UserLabelBadge
                          key={label.id}
                          name={label.name}
                          color={label.color}
                        />
                      ))}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-1.5">
                    {getCardSystemBadges(card).map((badge) => (
                      <SystemBadge key={badge}>{badge}</SystemBadge>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="af-focus-ring af-accent-hover inline-flex items-center gap-2 px-2 py-2 text-sm text-white/76 transition hover:bg-white/[0.03] hover:text-[var(--accent-soft-35)]"
                >
                  <X className="af-accent-icon h-4 w-4" aria-hidden="true" />
                  <span>Fechar</span>
                </button>
              </div>
            </header>

            <div className="mt-4 space-y-5">
              <section className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Descrição do card
                </p>
                <p className="text-sm leading-relaxed text-white/72">{card.description}</p>
              </section>

              <section className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  User Story
                </p>
                <div className="af-surface-md bg-white/[0.03] px-3 py-3">
                  <div className="space-y-2">
                    {card.userLabels.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {card.userLabels.map((label) => (
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
                        ...card.linkedChips,
                      ].map((badge) => (
                        <SystemBadge key={badge}>{badge}</SystemBadge>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{card.title}</h3>
                  </div>
                  <p className="af-text-tertiary mt-2 text-[11px]">{card.persona}</p>
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
                  {card.acceptanceCriteria.map((criterion) => (
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
                  {card.tasks.map((task) => (
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
                        <p className="af-text-tertiary text-[11px]">{task.assignee.name}</p>
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

          <aside className="af-separator-t min-h-0 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 lg:border-t-0 lg:border-l lg:border-white/8 lg:shadow-[inset_1px_0_0_rgba(255,255,255,0.03)]">
            <div className="space-y-4">
              <section className="af-surface-lg bg-white/[0.02] px-4 py-4">
                <header className="af-separator-b pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Atribuição</h3>
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
                      {card.linkedChips.map((badge) => (
                        <SystemBadge key={badge}>{badge}</SystemBadge>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="af-surface-lg bg-white/[0.02] px-4 py-4">
                <header className="af-separator-b pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Comentários</h3>
                      <p className="af-text-secondary mt-1 text-xs">
                        Discussão do item
                      </p>
                    </div>
                    <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5 text-[10px] text-white/72">
                      {card.comments.length}
                    </span>
                  </div>
                </header>

                <div className="mt-3 space-y-2.5">
                  {card.comments.map((comment) => (
                    <article
                      key={comment.id}
                      className="af-surface-md bg-white/[0.03] px-3 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-2.5">
                          <UserAvatar
                            user={comment.author}
                            className="af-surface-sm h-7 w-7 shrink-0 bg-black/20 text-[10px] font-semibold text-white/80"
                            fallbackClassName="text-[10px] font-semibold"
                          />
                          <div className="min-w-0">
                            <p className="text-sm text-white">{comment.author.name}</p>
                            <p className="af-text-tertiary text-[11px]">
                              {comment.createdAtLabel}
                            </p>
                          </div>
                        </div>
                        <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5 text-[10px] text-white/65">
                          {comment.type}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-white/72">
                        {comment.body}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
