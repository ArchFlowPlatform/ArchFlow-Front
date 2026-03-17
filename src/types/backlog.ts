/**
 * ProductBacklog, Epic, UserStory entities aligned with backend API.
 */

import type {
  BusinessValue,
  EpicStatus,
  UserStoryComplexity,
  UserStoryStatus,
} from "./enums";

export interface ProductBacklog {
  id: string;
  projectId: string;
  overview: string;
  createdAt: string;
  updatedAt: string;
  epics?: Epic[];
}

export interface Epic {
  id: number;
  productBacklogId: string;
  name: string;
  description: string;
  businessValue: BusinessValue;
  status: EpicStatus;
  position: number;
  priority: number;
  color: string;
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userStories?: UserStory[];
}

export interface UserStory {
  id: number;
  epicId: number;
  title: string;
  persona: string;
  description: string;
  acceptanceCriteria: string;
  complexity: UserStoryComplexity;
  effort: number | null;
  dependencies: string;
  priority: number;
  businessValue: BusinessValue;
  status: UserStoryStatus;
  backlogPosition: number;
  assigneeId: string | null;
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
