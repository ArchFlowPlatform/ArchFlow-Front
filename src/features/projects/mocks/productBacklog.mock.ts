import { USE_MOCKS } from "@/lib/env";

type StoryBusinessValue = "high" | "medium" | "low";
type StoryComplexity = "low" | "medium" | "high" | "very_high";
type UserStoryStatus = "draft" | "ready" | "in_progress" | "done";

export interface UserStory {
  id: string;
  epicId: string;
  title: string;
  persona: string;
  description: string;
  acceptanceCriteria: string;
  acceptance_criteria: string;
  effort: number;
  dependencies: string;
  priority: number;
  businessValue: StoryBusinessValue;
  assigneeId: string;
  status: UserStoryStatus;
  complexity: StoryComplexity;
  createdAt: string;
  updatedAt: string;
}

export type EpicPriority = "P1" | "P2" | "P3";

export interface Epic {
  id: string;
  name: string;
  description: string;
  priority: EpicPriority;
  position: number;
  businessValue: StoryBusinessValue;
  status: "draft" | "active" | "completed";
  color: string;
  userStories: UserStory[];
}

export interface ProductBacklog {
  projectId: string;
  epics: Epic[];
}

// ── Mock-only builder (gated behind NEXT_PUBLIC_USE_MOCKS) ──

export function buildProductBacklogView(projectId: string): ProductBacklog {
  if (!USE_MOCKS) {
    throw new Error(
      "buildProductBacklogView() requires NEXT_PUBLIC_USE_MOCKS=true. " +
        "Production code should use real API hooks instead.",
    );
  }

  /* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
  const sel = require("@/mocks/backend/selectors") as Record<string, (...args: unknown[]) => unknown>;
  /* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */

  type RawItem = Record<string, unknown>;
  const prioLabel = sel.priorityNumberToLabel as (n: number) => EpicPriority;

  try {
    return {
      projectId,
      epics: (sel.getEpicsForProject(projectId) as RawItem[]).map((epic, index) => ({
        id: epic.id as string,
        name: epic.name as string,
        description: (epic.description as string) ?? "",
        priority: prioLabel(epic.priority as number),
        position: index + 1,
        businessValue: epic.business_value as StoryBusinessValue,
        status: epic.status as "draft" | "active" | "completed",
        color: epic.color as string,
        userStories: (sel.getUserStoriesForEpic(epic.id as string) as RawItem[]).map((s) => ({
          id: s.id as string,
          epicId: s.epic_id as string,
          title: s.title as string,
          persona: s.persona as string,
          description: s.description as string,
          acceptanceCriteria: (s.acceptance_criteria as string) ?? "",
          acceptance_criteria: (s.acceptance_criteria as string) ?? "",
          effort: (s.effort as number) ?? 0,
          dependencies: (s.dependencies as string) ?? "",
          priority: s.priority as number,
          businessValue: s.business_value as StoryBusinessValue,
          assigneeId: (s.assignee_id as string) ?? "",
          status: s.status as UserStoryStatus,
          complexity: s.complexity as StoryComplexity,
          createdAt: s.created_at as string,
          updatedAt: s.updated_at as string,
        })),
      })),
    };
  } catch {
    return { projectId, epics: [] };
  }
}
