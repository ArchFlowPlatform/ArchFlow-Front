import { Trash2 } from "lucide-react";
import type { StoryTaskRowView } from "@/features/projects/mocks/sprintBacklog.mock";
import type { StoryTaskStatus } from "@/lib/story-task-status";
import TaskStatusSelect from "@/components/tasks/TaskStatusSelect";
import TaskRowCard from "../sprint/TaskRowCard";

interface StoryTaskRowProps {
  task: StoryTaskRowView;
  sprintItemId: number;
  mutating: boolean;
  onUpdateTaskStatus: (
    sprintItemId: number,
    taskId: number,
    status: StoryTaskStatus
  ) => Promise<void>;
  onDeleteTask: (sprintItemId: number, taskId: number) => Promise<void>;
}

export default function StoryTaskRow({
  task,
  sprintItemId,
  mutating,
  onUpdateTaskStatus,
  onDeleteTask,
}: StoryTaskRowProps) {
  return (
    <div className="group flex flex-col gap-2 sm:flex-row sm:items-start">
      <div className="w-full shrink-0 sm:w-44">
        <TaskStatusSelect
          value={task.status}
          disabled={mutating}
          onChange={(next) =>
            void onUpdateTaskStatus(sprintItemId, task.numericTaskId, next)
          }
        />
      </div>
      <div className="relative min-w-0 flex-1">
        <TaskRowCard
          title={task.title}
          priorityLabel={task.priorityLabel}
          subtitle={task.description}
          metaLabel={task.assignee.name}
          doneHours={task.doneHours}
          estimatedHours={task.estimatedHours}
        />
        <button
          type="button"
          disabled={mutating}
          aria-label={`Remover tarefa ${task.title}`}
          onClick={async () => {
            if (
              !globalThis.confirm(
                "Remover esta tarefa desta sprint?",
              )
            ) {
              return;
            }
            await onDeleteTask(sprintItemId, task.numericTaskId);
          }}
          className="af-focus-ring absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-white/40 opacity-0 transition hover:bg-red-500/15 hover:text-red-400 group-hover:opacity-100 disabled:opacity-30"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
