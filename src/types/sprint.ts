/**
 * Sprint, SprintItem, StoryTask entities aligned with backend API.
 */

import type { SprintStatus, StoryTaskStatus } from "./enums";
import type { UserStory } from "./backlog";

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  executionPlan: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  capacityHours: number;
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SprintItem {
  id: number;
  sprintId: string;
  userStoryId: number;
  position: number;
  notes: string;
  addedAt: string;
  userStory?: UserStory;
  tasks?: StoryTask[];
}

export interface StoryTask {
  id: number;
  sprintItemId: number;
  title: string;
  description: string;
  assigneeId: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  priority: number;
  position: number;
  status: StoryTaskStatus;
  createdAt: string;
  updatedAt: string;
}
