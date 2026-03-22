import type { SprintTaskView } from "@/features/projects/mocks/sprint.mock";
import { getStoryTaskStatusMeta } from "@/lib/story-task-status";
import { cx } from "@/lib/utils/cx";
import TaskRowCard from "./TaskRowCard";

interface SprintTasksPanelProps {
  tasks: SprintTaskView[];
}

export default function SprintTasksPanel({ tasks }: SprintTasksPanelProps) {
  const orderedTasks = [...tasks].sort((a, b) => a.id.localeCompare(b.id));

  return (
    <section className="af-surface-lg bg-[#14121a]/70 px-4 py-4 sm:px-5 sm:py-4">
      <header className="af-separator-b pb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Tarefas do Sprint
            </h2>
            <p className="af-text-secondary mt-1 text-xs">
              Estimativa vs realizado, por responsável.
            </p>
          </div>

          <span className="af-surface-sm af-accent-chip inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
            {tasks.length} tasks
          </span>
        </div>
      </header>

      <div className="mt-3 space-y-2.5">
        {orderedTasks.map((task) => {
          const st = getStoryTaskStatusMeta(task.status);
          return (
            <div key={task.id} className="space-y-1.5">
              <span
                className={cx(
                  "af-surface-sm inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
                  st.badgeCls,
                )}
              >
                {st.label}
              </span>
              <TaskRowCard
                title={task.title}
                priorityLabel={task.priorityLabel}
                subtitle={task.assignee.name}
                doneHours={task.doneHours}
                estimatedHours={task.estimatedHours}
                hoverable
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

