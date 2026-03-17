/**
 * Backlog API — aligns with backend BacklogController.
 * GET/PATCH /api/projects/{projectId}/backlog, epics, stories.
 */

import { get, post, patch } from "@/lib/http-client";
import type { ProductBacklog, Epic, UserStory } from "@/types/backlog";
import type {
  UpdateBacklogRequest,
  CreateEpicRequest,
  UpdateEpicRequest,
  ReorderEpicsRequest,
  CreateStoryRequest,
  UpdateStoryRequest,
  ReorderStoriesRequest,
  MoveStoryRequest,
} from "@/types/requests";

function backlogBase(projectId: string): string {
  return `/projects/${projectId}/backlog`;
}

export async function getBacklog(projectId: string): Promise<ProductBacklog> {
  const response = await get<ProductBacklog>(backlogBase(projectId));
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to fetch backlog");
  }
  return response.data;
}

export async function updateBacklogOverview(
  projectId: string,
  payload: UpdateBacklogRequest
): Promise<ProductBacklog> {
  const response = await patch<ProductBacklog, UpdateBacklogRequest>(
    backlogBase(projectId),
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to update backlog");
  }
  return response.data;
}

export async function createEpic(
  projectId: string,
  payload: CreateEpicRequest
): Promise<Epic> {
  const response = await post<Epic, CreateEpicRequest>(
    `${backlogBase(projectId)}/epics`,
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to create epic");
  }
  return response.data;
}

export async function updateEpic(
  projectId: string,
  epicId: number,
  payload: UpdateEpicRequest
): Promise<Epic> {
  const response = await patch<Epic, UpdateEpicRequest>(
    `${backlogBase(projectId)}/epics/${epicId}`,
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to update epic");
  }
  return response.data;
}

export async function reorderEpics(
  projectId: string,
  payload: ReorderEpicsRequest
): Promise<void> {
  const response = await patch<unknown, ReorderEpicsRequest>(
    `${backlogBase(projectId)}/epics/reorder`,
    payload
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to reorder epics");
  }
}

export async function archiveEpic(
  projectId: string,
  epicId: number
): Promise<void> {
  const response = await patch<unknown>(
    `${backlogBase(projectId)}/epics/${epicId}/archive`
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to archive epic");
  }
}

export async function restoreEpic(
  projectId: string,
  epicId: number
): Promise<void> {
  const response = await patch<unknown>(
    `${backlogBase(projectId)}/epics/${epicId}/restore`
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to restore epic");
  }
}

export async function createStory(
  projectId: string,
  epicId: number,
  payload: CreateStoryRequest
): Promise<UserStory> {
  const response = await post<UserStory, CreateStoryRequest>(
    `${backlogBase(projectId)}/epics/${epicId}/stories`,
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to create story");
  }
  return response.data;
}

export async function updateStory(
  projectId: string,
  storyId: number,
  payload: UpdateStoryRequest
): Promise<UserStory> {
  const response = await patch<UserStory, UpdateStoryRequest>(
    `${backlogBase(projectId)}/stories/${storyId}`,
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to update story");
  }
  return response.data;
}

export async function reorderStories(
  projectId: string,
  payload: ReorderStoriesRequest
): Promise<void> {
  const response = await patch<unknown, ReorderStoriesRequest>(
    `${backlogBase(projectId)}/stories/reorder`,
    payload
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to reorder stories");
  }
}

export async function moveStory(
  projectId: string,
  payload: MoveStoryRequest
): Promise<void> {
  const response = await patch<unknown, MoveStoryRequest>(
    `${backlogBase(projectId)}/stories/move`,
    payload
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to move story");
  }
}

export async function archiveStory(
  projectId: string,
  storyId: number
): Promise<void> {
  const response = await patch<unknown>(
    `${backlogBase(projectId)}/stories/${storyId}/archive`
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to archive story");
  }
}

export async function restoreStory(
  projectId: string,
  storyId: number
): Promise<void> {
  const response = await patch<unknown>(
    `${backlogBase(projectId)}/stories/${storyId}/restore`
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to restore story");
  }
}
