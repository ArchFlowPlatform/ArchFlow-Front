import type { Sprint } from "@/types/sprint";

interface SprintSummaryCardProps {
  sprint: Sprint;
  scopeHours: number;
  burnedHours: number;
  remainingHours: number;
  periodLabel: string;
  onCreateSprint?: () => void;
}

function formatHours(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  if (Number.isInteger(rounded)) {
    return `${rounded}h`;
  }
  return `${rounded.toFixed(1)}h`;
}

function formatStatusLabel(status: Sprint["status"]): string {
  if (status === "active") return "active";
  if (status === "completed") return "completed";
  return "planned";
}

export default function SprintSummaryCard({
  sprint,
  scopeHours,
  burnedHours,
  remainingHours,
  periodLabel,
  onCreateSprint,
}: SprintSummaryCardProps) {
  const capacity = sprint.capacityHours;

  const registeredRatio =
    capacity > 0 ? Math.min(burnedHours / capacity, 1) : 0;
  const estimatedRatio =
    capacity > 0 ? Math.min(scopeHours / capacity, 1) : 0;

  const registeredPercent = Math.round(registeredRatio * 100);
  const estimatedPercent = Math.round(estimatedRatio * 100);

  return (
    <section className="af-surface-lg bg-[#14121a]/70 px-4 py-4 sm:px-5 sm:py-4">
      <header className="af-separator-b pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-sm font-semibold text-white">
                {sprint.name}
              </h2>
              <span
                className={`af-surface-sm inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                  sprint.status === "active"
                    ? "af-accent-chip-strong text-white"
                    : "bg-white/5 text-white/72"
                }`}
              >
                {formatStatusLabel(sprint.status)}
              </span>

            {onCreateSprint ? (
              <button
                type="button"
                onClick={onCreateSprint}
                className="af-focus-ring af-surface-sm af-accent-hover inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:text-white/90 disabled:opacity-50"
              >
                Criar Sprint
              </button>
            ) : null}
            </div>
            <p className="af-text-secondary text-xs">{sprint.goal}</p>
          </div>

          <div className="af-surface-sm inline-flex items-center bg-white/5 px-2.5 py-0.5 text-[10px] text-white/72">
            {periodLabel}
          </div>
        </div>
      </header>

      <div className="mt-3 space-y-4">
        <div className="af-text-secondary grid gap-3 text-xs sm:grid-cols-2">
          <div className="space-y-1">
            <p className="af-text-tertiary text-[11px] font-semibold uppercase tracking-[0.18em]">
              Período
            </p>
            <p>{periodLabel}</p>
          </div>
          <div className="space-y-1">
            <p className="af-text-tertiary text-[11px] font-semibold uppercase tracking-[0.18em]">
              Capacidade
            </p>
            <p>{formatHours(capacity)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="af-text-tertiary text-[11px] font-semibold uppercase tracking-[0.18em]">
            Progresso
          </p>

          <div className="space-y-2">
            <div className="space-y-1">
              <div className="af-text-secondary flex items-center justify-between text-[11px]">
                <span>Horas registradas</span>
                <span>
                  {formatHours(burnedHours)} • {registeredPercent}%
                </span>
              </div>
              <div className="af-surface-md bg-black/30">
                <div
                  className="af-accent-progress"
                  style={{
                    width: `${registeredRatio * 100}%`,
                    height: "6px",
                  }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="af-text-secondary flex items-center justify-between text-[11px]">
                <span>Horas estimadas</span>
                <span>
                  {formatHours(scopeHours)} • {estimatedPercent}%
                </span>
              </div>
              <div className="af-surface-md bg-black/30">
                <div
                  className="bg-white/60"
                  style={{
                    width: `${estimatedRatio * 100}%`,
                    height: "6px",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="af-text-secondary grid gap-2 text-[11px] sm:grid-cols-3">
            <div className="af-surface-sm bg-white/5 px-2 py-1.5">
              <p className="af-text-tertiary text-[10px] font-semibold uppercase tracking-[0.16em]">
                Scope
              </p>
              <p className="mt-0.5 text-sm text-white">
                {formatHours(scopeHours)}
              </p>
            </div>
            <div className="af-surface-sm af-accent-panel bg-white/5 px-2 py-1.5">
              <p className="af-text-tertiary text-[10px] font-semibold uppercase tracking-[0.16em]">
                Burned
              </p>
              <p className="mt-0.5 text-sm text-white">
                {formatHours(burnedHours)}
              </p>
            </div>
            <div className="af-surface-sm bg-white/5 px-2 py-1.5">
              <p className="af-text-tertiary text-[10px] font-semibold uppercase tracking-[0.16em]">
                Remaining
              </p>
              <p className="mt-0.5 text-sm text-white">
                {formatHours(remainingHours)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

