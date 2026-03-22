"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import StoryTaskRow from "./StoryTaskRow";
import type { SprintBacklogStoryView } from "@/features/projects/mocks/sprintBacklog.mock";
import type { StoryTaskStatus } from "@/lib/story-task-status";
import UserAvatar from "../ui/UserAvatar";

interface StorySprintCardProps {
  story: SprintBacklogStoryView;
  mutating: boolean;
  onRemoveFromSprint: (sprintItemId: number) => Promise<void>;
  onCreateTask: (sprintItemId: number, title: string) => Promise<void>;
  onUpdateTaskStatus: (
    sprintItemId: number,
    taskId: number,
    status: StoryTaskStatus
  ) => Promise<void>;
  onDeleteTask: (sprintItemId: number, taskId: number) => Promise<void>;
}

export default function StorySprintCard({
  story,
  mutating,
  onRemoveFromSprint,
  onCreateTask,
  onUpdateTaskStatus,
  onDeleteTask,
}: StorySprintCardProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");

  return (
    <article className="af-surface-md bg-white/[0.03] px-4 py-4 sm:px-4 sm:py-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-white">
              {story.title}
            </h3>
            <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/72">
              {story.epicName}
            </span>
          </div>

          <p className="af-text-secondary text-xs">{story.description}</p>
          <p className="af-text-tertiary text-[11px]">Effort: {story.effort}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="af-surface-sm inline-flex items-center gap-2 bg-white/5 px-2.5 py-1 text-[10px] text-white/72">
            <UserAvatar
              user={story.assignee}
              className="af-surface-sm h-5 w-5 bg-black/20 text-[9px] font-semibold text-white/80"
              fallbackClassName="text-[9px] font-semibold"
            />
            <span>{story.assignee.name}</span>
          </div>
          <button
            type="button"
            disabled={mutating}
            onClick={async () => {
              if (
                !globalThis.confirm(
                  "Remover esta user story desta sprint? (As tarefas serão desvinculadas conforme a API.)",
                )
              ) {
                return;
              }
              await onRemoveFromSprint(story.sprintItemId);
            }}
            className="af-focus-ring inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-red-400/90 transition hover:bg-red-500/10 disabled:opacity-40"
          >
            <Trash2 className="h-3 w-3" aria-hidden />
            Remover da sprint
          </button>
        </div>
      </header>

      <div className="mt-3 space-y-2">
        <div className="af-separator-b pb-2">
          <p className="af-text-tertiary text-[11px] font-semibold uppercase tracking-[0.18em]">
            Acceptance Criteria
          </p>
          <p className="af-text-secondary mt-2 whitespace-pre-line text-xs leading-relaxed">
            {story.acceptanceCriteria || "—"}
          </p>
        </div>

        <div className="af-separator-b pb-1">
          <p className="af-text-tertiary text-[11px] font-semibold uppercase tracking-[0.18em]">
            Tarefas
          </p>
        </div>

        <div className="space-y-2">
          {(story.tasks ?? []).map((task) => (
            <StoryTaskRow
              key={task.id}
              task={task}
              sprintItemId={story.sprintItemId}
              mutating={mutating}
              onUpdateTaskStatus={onUpdateTaskStatus}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-2 pt-1">
          <label className="min-w-[12rem] flex-1">
            <span className="sr-only">Nova tarefa</span>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Título da nova tarefa"
              disabled={mutating}
              className="af-surface-md af-focus-ring w-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-white placeholder:text-white/35"
            />
          </label>
          <button
            type="button"
            disabled={mutating || !newTaskTitle.trim()}
            onClick={async () => {
              const title = newTaskTitle.trim();
              if (!title) return;
              await onCreateTask(story.sprintItemId, title);
              setNewTaskTitle("");
            }}
            className="af-surface-md af-focus-ring af-accent-hover shrink-0 px-3 py-2 text-xs font-medium text-white/90"
          >
            Adicionar tarefa
          </button>
        </div>
      </div>
    </article>
  );
}
