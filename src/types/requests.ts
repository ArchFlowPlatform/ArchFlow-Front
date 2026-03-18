/**
 * Request/response DTOs for API calls.
 * Align with backend DTOs when documented. Used by API modules (Step 3+).
 */

import type { MemberRole, ProjectStatus, UserType } from "./enums";

// ----- Users (POST /api/users) — plan §2.2 -----

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  type?: UserType;
}

// ----- Projects -----

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

export interface AddMemberRequest {
  userId: string;
  role: MemberRole;
}

export interface CreateInviteRequest {
  email: string;
  role: MemberRole;
}

// ----- Backlog -----

export interface UpdateBacklogRequest {
  overview?: string;
}

export interface CreateEpicRequest {
  name: string;
  description?: string;
  businessValue?: string;
  priority?: number;
  color?: string;
}

export interface UpdateEpicRequest {
  name?: string;
  description?: string;
  businessValue?: string;
  status?: string;
  priority?: number;
  position?: number;
  color?: string;
}

export interface ReorderEpicsRequest {
  epicIds: number[];
}

export interface CreateStoryRequest {
  epicId: number;
  title: string;
  persona?: string;
  description?: string;
  acceptanceCriteria?: string;
  complexity?: string;
  effort?: number;
  dependencies?: string;
  priority?: number;
  businessValue?: string;
  assigneeId?: string | null;
}

export interface UpdateStoryRequest {
  title?: string;
  persona?: string;
  description?: string;
  acceptanceCriteria?: string;
  complexity?: string;
  effort?: number;
  dependencies?: string;
  priority?: number;
  businessValue?: string;
  status?: string;
  assigneeId?: string | null;
  backlogPosition?: number;
}

export interface ReorderStoriesRequest {
  storyIds: number[];
}

export interface MoveStoryRequest {
  storyId: number;
  targetEpicId: number;
  position?: number;
}

// ----- Sprints -----

export interface CreateSprintRequest {
  name: string;
  goal?: string;
  executionPlan?: string;
  startDate: string;
  endDate: string;
  capacityHours?: number;
}

export interface UpdateSprintRequest {
  name?: string;
  goal?: string;
  executionPlan?: string;
  startDate?: string;
  endDate?: string;
  capacityHours?: number;
}

// ----- Sprint items -----

export interface CreateSprintItemRequest {
  userStoryId: number;
  position?: number;
  notes?: string;
}

export interface UpdateSprintItemRequest {
  position?: number;
  notes?: string;
}

// ----- Board -----

export interface UpdateBoardRequest {
  name?: string;
  description?: string;
  boardType?: string;
}

// ----- Board columns -----

export interface CreateBoardColumnRequest {
  name: string;
  description?: string;
  position?: number;
  wipLimit?: number | null;
  color?: string;
  isDoneColumn?: boolean;
}

export interface UpdateBoardColumnRequest {
  name?: string;
  description?: string;
  position?: number;
  wipLimit?: number | null;
  color?: string;
  isDoneColumn?: boolean;
}

// ----- Board cards -----

export interface CreateBoardCardRequest {
  userStoryId: number;
  position?: number;
}

export interface ReorderCardRequest {
  position: number;
}

export interface MoveCardRequest {
  targetColumnId: number;
  position?: number;
}

// ----- Story tasks -----

export interface CreateStoryTaskRequest {
  title: string;
  description?: string;
  assigneeId?: string | null;
  estimatedHours?: number | null;
  priority?: number;
  position?: number;
}

export interface UpdateStoryTaskRequest {
  title?: string;
  description?: string;
  assigneeId?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  priority?: number;
  position?: number;
  status?: string;
}

export interface ReorderTasksRequest {
  taskIds: number[];
}

export interface ReorderTaskRequest {
  position: number;
}

export interface MoveTaskRequest {
  taskId: number;
  targetSprintItemId: number;
  position?: number;
}

// ----- Labels -----

export interface CreateLabelRequest {
  name: string;
  color: string;
}

export interface UpdateLabelRequest {
  name?: string;
  color?: string;
}

// ----- Card labels (add to card) -----

export interface AddLabelToCardRequest {
  labelId: number;
}

// ----- Card comments -----

export interface CreateCardCommentRequest {
  content: string;
  parentCommentId?: number | null;
}

export interface UpdateCardCommentRequest {
  content: string;
}

// ----- Card attachments (multipart/form-data in API) -----

export interface CreateCardAttachmentRequest {
  file: File;
  fileName?: string;
}

// ----- Card activities -----

export interface CreateCardActivityRequest {
  activityType: string;
  oldValue?: string;
  newValue?: string;
  description: string;
}
