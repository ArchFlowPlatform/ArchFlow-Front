import { useState } from "react";
import { Plus } from "lucide-react";

import type { KanbanColumnView } from "@/features/projects/mocks/kanban.mock";
import KanbanCard from "./KanbanCard";
import SystemBadge from "./SystemBadge";

interface KanbanColumnProps {
  column: KanbanColumnView;
  onOpenCard: (cardId: string) => void;
  draggingCardId: string | null;
  onDragStartCard: (cardId: string) => void;
  onDragEndCard: () => void;
  onDropCard: (cardId: string, columnId: KanbanColumnView["id"]) => void;
  /** Open create-card flow for this column (uses backend column id). */
  onRequestAddCard?: (backendColumnId: number) => void;
}

export default function KanbanColumn({
  column,
  onOpenCard,
  draggingCardId,
  onDragStartCard,
  onDragEndCard,
  onDropCard,
  onRequestAddCard,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);

  return (
    <section
      className={`af-surface-lg flex h-full min-h-0 w-[19rem] shrink-0 flex-col bg-[#14121a]/70 transition ${
        isOver ? "af-accent-panel bg-white/[0.04]" : ""
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        const cardId = event.dataTransfer.getData("text/plain");
        setIsOver(false);
        if (cardId) {
          onDropCard(cardId, column.id);
        }
      }}
    >
      <header className="af-separator-b px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0" title={column.helpText}>
            <h2 className="text-sm font-semibold text-white">{column.title}</h2>
            <p className="af-text-tertiary mt-1 text-[11px]">{column.wipLabel}</p>
          </div>

          <SystemBadge>{String((column.cards ?? []).length)}</SystemBadge>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
        <div className="space-y-2.5">
          {(column.cards ?? []).map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onOpen={onOpenCard}
              isDragging={draggingCardId === card.id}
              onDragStart={onDragStartCard}
              onDragEnd={onDragEndCard}
            />
          ))}

          {!(column.cards ?? []).length ? (
            <div className="af-surface-md af-text-tertiary bg-black/10 px-3 py-6 text-center text-[11px]">
              Arraste um card para cá
            </div>
          ) : null}
        </div>
      </div>

      <footer className="af-separator-t px-3 py-3">
        <button
          type="button"
          disabled={!onRequestAddCard || column.backendColumnId == null}
          onClick={() => {
            if (column.backendColumnId != null) {
              onRequestAddCard?.(column.backendColumnId);
            }
          }}
          className="af-focus-ring af-accent-hover af-text-secondary inline-flex w-full items-center gap-2 px-2 py-2 text-[11px] transition hover:bg-white/[0.03] hover:text-[var(--accent-soft-35)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="af-accent-icon h-3.5 w-3.5" aria-hidden="true" />
          <span>Adicionar card</span>
        </button>
      </footer>
    </section>
  );
}
