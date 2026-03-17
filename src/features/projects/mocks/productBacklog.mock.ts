import {
  getEpicsForProject,
  getUserStoriesForEpic,
  priorityNumberToLabel,
} from "@/mocks/backend/selectors";
import type {
  BusinessValue as StoryBusinessValue,
  UserStoryComplexity as StoryComplexity,
  UserStoryStatus,
} from "@/mocks/backend/schema";

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

export function buildProductBacklogView(projectId: string): ProductBacklog {
  try {
    return {
      projectId,
      epics: getEpicsForProject(projectId).map((epic, index) => ({
        id: epic.id,
        name: epic.name,
        description: epic.description ?? "",
        priority: priorityNumberToLabel(epic.priority),
        position: index + 1,
        businessValue: epic.business_value,
        status: epic.status,
        color: epic.color,
        userStories: getUserStoriesForEpic(epic.id).map((story) => ({
          id: story.id,
          epicId: story.epic_id,
          title: story.title,
          persona: story.persona,
          description: story.description,
          acceptanceCriteria: story.acceptance_criteria ?? "",
          acceptance_criteria: story.acceptance_criteria ?? "",
          effort: story.effort ?? 0,
          dependencies: story.dependencies ?? "",
          priority: story.priority,
          businessValue: story.business_value,
          assigneeId: story.assignee_id ?? "",
          status: story.status,
          complexity: story.complexity,
          createdAt: story.created_at,
          updatedAt: story.updated_at,
        })),
      })),
    };
  } catch {
    return {
      projectId,
      epics: [],
    };
  }
}
