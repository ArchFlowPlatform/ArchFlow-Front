"use client";

import SelectDropdown from "@/components/ui/SelectDropdown";
import {
  STORY_TASK_STATUS_SELECT_OPTIONS,
  type StoryTaskStatus,
} from "@/lib/story-task-status";

interface TaskStatusSelectProps {
  value: StoryTaskStatus;
  onChange: (next: StoryTaskStatus) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Inline task status (Todo / Doing) using the shared portaled SelectDropdown.
 */
export default function TaskStatusSelect({
  value,
  onChange,
  disabled,
  className = "",
  size = "sm",
}: TaskStatusSelectProps) {
  return (
    <SelectDropdown
      value={String(value)}
      options={STORY_TASK_STATUS_SELECT_OPTIONS}
      onChange={(v) => onChange(Number(v) as StoryTaskStatus)}
      disabled={disabled}
      size={size}
      className={`min-w-[9.5rem] ${className}`.trim()}
      align="left"
      panelLabel="Status da tarefa"
    />
  );
}
