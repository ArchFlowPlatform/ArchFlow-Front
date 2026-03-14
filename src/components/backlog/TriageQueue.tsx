import { Eye, EyeOff } from "lucide-react";

export type TriageFilter =
  | "none"
  | "noAssignee"
  | "missingCriteria"
  | "missingEffort"
  | "hasDependencies"
  | "draft";

export interface TriageQueueCounts {
  noAssignee: number;
  missingCriteria: number;
  missingEffort: number;
  hasDependencies: number;
  draft: number;
}

interface TriageQueueProps {
  counts: TriageQueueCounts;
  activeFilter: TriageFilter;
  onSelectFilter: (filter: Exclude<TriageFilter, "none">) => void;
  onClearFilter: () => void;
}

interface TriageItemDefinition {
  id: Exclude<TriageFilter, "none">;
  label: string;
  description: string;
}

const triageItems: TriageItemDefinition[] = [
  {
    id: "noAssignee",
    label: "No assignee",
    description: "Stories sem responsavel definido.",
  },
  {
    id: "missingCriteria",
    label: "Missing acceptance criteria",
    description: "Stories sem criterios de aceitacao preenchidos.",
  },
  {
    id: "missingEffort",
    label: "Missing effort",
    description: "Stories sem estimativa de esforco.",
  },
  {
    id: "hasDependencies",
    label: "Blocked by dependency",
    description: "Stories com dependencias que exigem acompanhamento.",
  },
  {
    id: "draft",
    label: "Draft",
    description: "Stories ainda em estado inicial.",
  },
];

export default function TriageQueue({
  counts,
  activeFilter,
  onSelectFilter,
  onClearFilter,
}: TriageQueueProps) {
  return (
    <section className="af-surface-lg bg-[#14121a]/70 px-4 py-4 sm:px-5 sm:py-4">
      <header className="af-separator-b pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Triage Queue</h2>
            <p className="af-text-secondary mt-1 text-xs">
              Itens que precisam de acao.
            </p>
          </div>

          {activeFilter !== "none" ? (
            <button
              type="button"
              onClick={onClearFilter}
              className="af-focus-ring af-surface-sm af-accent-chip inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80 transition hover:bg-[var(--accent-soft-25)] hover:text-white"
            >
              Clear filter
            </button>
          ) : (
            <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/72">
              Queue
            </span>
          )}
        </div>
      </header>

      <div className="mt-3 space-y-2">
        {triageItems.map((item) => {
          const isActive = activeFilter === item.id;

          return (
            <div
              key={item.id}
              className={`af-surface-md flex items-center justify-between gap-3 bg-white/[0.03] px-3 py-2.5 transition hover:border-[color:var(--accent-soft-15)] hover:bg-white/[0.05] ${
                isActive ? "af-accent-panel text-white" : "text-white/72"
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-inherit">
                  {item.label}
                </p>
                <p className="af-text-tertiary mt-1 text-[11px]">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`af-surface-sm inline-flex min-w-8 items-center justify-center px-2 py-1 text-[10px] font-semibold ${
                    isActive ? "af-accent-chip text-white/80" : "bg-white/5 text-white/72"
                  }`}
                >
                  {counts[item.id]}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectFilter(item.id)}
                  aria-label={`${
                    isActive ? "Disable filter" : "Enable filter"
                  }: ${item.label}`}
                  aria-pressed={isActive}
                  className={`af-focus-ring af-surface-sm inline-flex h-7 w-7 items-center justify-center transition hover:bg-white/[0.08] hover:text-[var(--accent-soft-35)] ${
                    isActive
                      ? "af-accent-chip-strong text-white"
                      : "bg-white/5 text-white/55"
                  }`}
                >
                  {isActive ? (
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
