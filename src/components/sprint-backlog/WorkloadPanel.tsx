import AssigneeWorkloadCard from "./AssigneeWorkloadCard";
import type { AssigneeWorkloadView } from "@/features/projects/mocks/sprintBacklog.mock";

interface WorkloadPanelProps {
  assignees: AssigneeWorkloadView[];
  storyCount: number;
  taskCount: number;
  estimatedHours: number;
  doneHours: number;
  remainingHours: number;
}

export default function WorkloadPanel({
  assignees,
  storyCount,
  taskCount,
  estimatedHours,
  doneHours,
  remainingHours,
}: WorkloadPanelProps) {
  return (
    <section className="af-surface-lg bg-[#14121a]/70 px-4 py-4 sm:px-5 sm:py-4">
      <header className="af-separator-b pb-3">
        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Workload por responsável
            </h2>
            <p className="af-text-secondary mt-1 text-xs">
              Distribuição de esforço por pessoa no sprint.
            </p>
          </div>

          <div className="af-text-secondary flex flex-wrap items-center gap-1.5 text-[10px]">
            <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5">
              Stories: {storyCount}
            </span>
            <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5">
              Tasks: {taskCount}
            </span>
            <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5">
              Est: {estimatedHours}h
            </span>
            <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5">
              Act: {doneHours}h
            </span>
            <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5">
              Remaining: {remainingHours}h
            </span>
          </div>
        </div>
      </header>

      <div className="mt-3 space-y-2.5">
        {assignees.map((assignee) => (
          <AssigneeWorkloadCard key={assignee.assigneeId} assignee={assignee} />
        ))}
      </div>
    </section>
  );
}
