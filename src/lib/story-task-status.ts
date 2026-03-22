/**
 * StoryTaskStatus — aligns with backend enum:
 * Todo = 0, Doing = 1, Done = 2
 * JSON typically uses numeric values; `normalizeStoryTaskStatus` accepts legacy strings.
 */

export type StoryTaskStatus = 0 | 1 | 2;

export const STORY_TASK_STATUS = {
  Todo: 0,
  Doing: 1,
  Done: 2,
} as const satisfies Record<string, StoryTaskStatus>;

const OPTIONS = [
  {
    value: STORY_TASK_STATUS.Todo,
    label: "A fazer",
    badgeCls: "bg-white/10 text-white/80",
  },
  {
    value: STORY_TASK_STATUS.Doing,
    label: "Em andamento",
    badgeCls: "bg-amber-500/20 text-amber-200",
  },
  {
    value: STORY_TASK_STATUS.Done,
    label: "Concluída",
    badgeCls: "bg-emerald-500/20 text-emerald-200",
  },
] as const;

export function getStoryTaskStatusMeta(status: StoryTaskStatus) {
  return OPTIONS.find((o) => o.value === status) ?? OPTIONS[0];
}

/** SelectDropdown options: value is stringified enum for the control. */
export const STORY_TASK_STATUS_SELECT_OPTIONS = OPTIONS.map(({ value, label }) => ({
  value: String(value),
  label,
}));

export function normalizeStoryTaskStatus(input: unknown): StoryTaskStatus {
  if (input === 0 || input === "0") return 0;
  if (input === 1 || input === "1") return 1;
  if (input === 2 || input === "2") return 2;
  if (typeof input === "string") {
    const s = input.trim().toLowerCase();
    if (s === "todo" || s === "pending") return 0;
    if (s === "doing" || s === "in_progress" || s === "in progress") return 1;
    if (s === "done" || s === "completed" || s === "complete") return 2;
  }
  return 0;
}
