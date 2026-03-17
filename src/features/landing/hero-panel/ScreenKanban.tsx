import { cx } from "@/lib/utils/cx";
import type { ScreenProps } from "../types/landing.types";

interface KanbanCard {
  t: string;
  tag: string;
  focus?: boolean;
}

interface KanbanColumn {
  name: string;
  count: number;
  cards: KanbanCard[];
}

export default function ScreenKanban({ active }: ScreenProps) {
  const columns: KanbanColumn[] = [
    {
      name: "To Do",
      count: 4,
      cards: [
        { t: "Implement CQRS Handler", tag: "ADR" },
        { t: "Update Container Diagram", tag: "C4" },
        { t: "Add idempotency keys", tag: "ADR" },
        { t: "Define retry policy", tag: "ADR" },
      ],
    },
    {
      name: "In Progress",
      count: 2,
      cards: [
        { t: "Create orders_events table", tag: "ERD", focus: true },
        { t: "Wire gateway routes", tag: "C4" },
      ],
    },
    {
      name: "Review",
      count: 2,
      cards: [
        { t: "Validate projections lag", tag: "ERD" },
        { t: "ADR impact sign-off", tag: "ADR" },
      ],
    },
    {
      name: "Done",
      count: 4,
      cards: [
        { t: "Define Auth boundaries", tag: "ADR" },
        { t: "Schema v1 migration", tag: "ERD" },
        { t: "Add health checks", tag: "C4" },
        { t: "Baseline dashboard", tag: "ERD" },
      ],
    },
  ];

  const cardDelay = (columnIndex: number, cardIndex: number) => {
    let index = 0;
    for (let column = 0; column < columnIndex; column += 1) {
      index += columns[column].cards.length;
    }
    index += cardIndex;
    return index * 150;
  };

  return (
    <div className="h-full min-h-0">
      <div className="af-surface-lg h-full min-h-0 bg-black/40 p-3 flex flex-col">
        <div className="flex items-center justify-between px-2 py-1">
          <p className="text-[10px] font-semibold text-white/70">
            Board (scrumban)
          </p>
          <span className="text-[10px] text-white/40">Sprint 12</span>
        </div>

        <div
          className={cx(
            "mt-3 flex-1 min-h-0 flex gap-2.5 transition-opacity duration-500",
            active ? "opacity-100" : "opacity-0",
          )}
        >
          {columns.map((column, columnIndex) => (
            <div key={column.name} className="w-[84px] flex flex-col min-h-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-white/60">
                  {column.name}
                </span>
                <span className="af-surface-sm inline-flex items-center bg-white/10 px-1.5 text-[9px] text-white/60">
                  {column.count}
                </span>
              </div>

              <div className="mt-2 space-y-2 min-h-0 overflow-hidden">
                {column.cards.map((card, cardIndex) => {
                  const isFocus = !!card.focus;
                  const delay = cardDelay(columnIndex, cardIndex);

                  return (
                    <div
                      key={`${column.name}-${cardIndex}`}
                      className={cx(
                        "af-surface-sm relative bg-white/5 p-2.5 text-[9px] text-white/75",
                        isFocus && "pl-[11px]",
                      )}
                      style={{
                        opacity: 0,
                        transform: "translateY(-10px)",
                        animation: active
                          ? `kbCardIn 450ms ease ${delay}ms forwards`
                          : "none",
                        boxShadow: isFocus
                          ? "inset 1px 0 0 rgba(255,255,255,0.14), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.22)"
                          : undefined,
                      }}
                    >
                      <div className="truncate">{card.t}</div>
                      <div className="mt-2">
                        <span className="af-surface-sm inline-flex items-center bg-[var(--af-pin)]/20 px-1.5 py-[2px] text-[8px] font-semibold text-[var(--af-pin)]">
                          {card.tag}
                        </span>
                      </div>

                      {isFocus && (
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{
                            animation: active
                              ? "afPulse 2s ease-in-out infinite"
                              : "none",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
