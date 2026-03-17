import type { AssigneeWorkloadView } from "@/features/projects/mocks/sprintBacklog.mock";
import UserAvatar from "../ui/UserAvatar";

interface AssigneeWorkloadCardProps {
  assignee: AssigneeWorkloadView;
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export default function AssigneeWorkloadCard({
  assignee,
}: AssigneeWorkloadCardProps) {
  return (
    <article className="af-surface-md bg-white/[0.03] px-3 py-3">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar
              user={assignee.assignee}
              className="af-surface-sm h-9 w-9 shrink-0 bg-white/5 text-xs font-semibold text-white/80"
              fallbackClassName="text-xs font-semibold"
            />

            <div className="min-w-0">
              <p className="text-sm font-semibold leading-5 text-white">
                {assignee.assignee.name}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
            {assignee.statusChips.map((chip) => (
              <span
                key={chip}
                className="af-surface-sm af-text-secondary inline-flex h-6 items-center bg-white/5 px-2 py-1 text-[10px] leading-none"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="af-text-secondary flex flex-wrap gap-1.5 text-[10px]">
          <span className="af-surface-sm inline-flex h-6 shrink-0 items-center bg-white/5 px-2 py-1 leading-none">
            {assignee.storyCount} stories
          </span>
          <span className="af-surface-sm inline-flex h-6 shrink-0 items-center bg-white/5 px-2 py-1 leading-none">
            {assignee.taskCount} tasks
          </span>
          <span className="af-surface-sm inline-flex h-6 shrink-0 items-center bg-white/5 px-2 py-1 leading-none">
            Est {assignee.estimatedHours}h
          </span>
          <span className="af-surface-sm inline-flex h-6 shrink-0 items-center bg-white/5 px-2 py-1 leading-none">
            Act {assignee.doneHours}h
          </span>
          <span className="af-surface-sm inline-flex h-6 shrink-0 items-center bg-white/5 px-2 py-1 leading-none">
            Rem {assignee.remainingHours}h
          </span>
        </div>
      </header>

      <div className="mt-3 space-y-3">
        <div className="af-text-secondary space-y-1 text-[11px]">
          <p>Carga: {assignee.loadLabel}</p>
          <p>Média por task: {assignee.averageTaskHours}h</p>
        </div>

        <div className="space-y-2">
          <div className="space-y-1">
            <div className="af-text-secondary flex items-center justify-between gap-2 text-[11px]">
              <span>Progresso</span>
              <span>{formatPercent(assignee.progressRatio)}</span>
            </div>
            <div className="af-surface-md bg-black/30">
              <div
                className="af-accent-progress"
                style={{
                  width: `${assignee.progressRatio * 100}%`,
                  height: "6px",
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="af-text-secondary flex items-center justify-between gap-2 text-[11px]">
              <span>Peso no sprint</span>
              <span>{formatPercent(assignee.sprintWeightRatio)}</span>
            </div>
            <div className="af-surface-md bg-black/30">
              <div
                className="bg-white/55"
                style={{
                  width: `${assignee.sprintWeightRatio * 100}%`,
                  height: "6px",
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="af-separator-b pb-1">
            <p className="af-text-tertiary text-[11px] font-semibold uppercase tracking-[0.18em]">
              Top tasks (maior estimativa)
            </p>
          </div>

          <div className="space-y-1.5">
            {assignee.topTasks.map((task) => (
              <div
                key={task.id}
                className="af-surface-sm af-text-secondary flex items-center justify-between gap-3 bg-black/20 px-2.5 py-2 text-[11px]"
              >
                <div className="min-w-0">
                  <p className="truncate text-white/80">{task.title}</p>
                  <p className="af-text-tertiary truncate">{task.priorityLabel}</p>
                </div>

                <span className="af-text-secondary shrink-0">
                  Rem {Math.max(task.estimatedHours - task.doneHours, 0)}h
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
