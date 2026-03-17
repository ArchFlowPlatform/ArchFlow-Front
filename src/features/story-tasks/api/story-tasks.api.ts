/**
 * Story tasks API — aligns with backend StoryTasksController.
 * GET/POST/PUT/DELETE/PATCH /api/projects/{projectId}/sprints/{sprintId}/items/{sprintItemId}/tasks.
 */

import { get, post, put, del, patch } from "@/lib/http-client";
import type { StoryTask } from "@/types/sprint";
import type {
  CreateStoryTaskRequest,
  UpdateStoryTaskRequest,
  ReorderTaskRequest,
  MoveTaskRequest,
} from "@/types/requests";

function tasksBase(
  projectId: string,
  sprintId: string,
  sprintItemId: number
): string {
  return `/projects/${projectId}/sprints/${sprintId}/items/${sprintItemId}/tasks`;
}

export async function getTasks(
  projectId: string,
  sprintId: string,
  sprintItemId: number
): Promise<StoryTask[]> {
  const response = await get<StoryTask[]>(
    tasksBase(projectId, sprintId, sprintItemId)
  );
  if (!response.success || !Array.isArray(response.data)) {
    throw new Error(response.message ?? "Failed to fetch tasks");
  }
  return response.data;
}

export async function createTask(
  projectId: string,
  sprintId: string,
  sprintItemId: number,
  payload: CreateStoryTaskRequest
): Promise<StoryTask> {
  const response = await post<StoryTask, CreateStoryTaskRequest>(
    tasksBase(projectId, sprintId, sprintItemId),
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to create task");
  }
  return response.data;
}

export async function updateTask(
  projectId: string,
  sprintId: string,
  sprintItemId: number,
  taskId: number,
  payload: UpdateStoryTaskRequest
): Promise<StoryTask> {
  const response = await put<StoryTask, UpdateStoryTaskRequest>(
    `${tasksBase(projectId, sprintId, sprintItemId)}/${taskId}`,
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to update task");
  }
  return response.data;
}

export async function deleteTask(
  projectId: string,
  sprintId: string,
  sprintItemId: number,
  taskId: number
): Promise<void> {
  const response = await del<unknown>(
    `${tasksBase(projectId, sprintId, sprintItemId)}/${taskId}`
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to delete task");
  }
}

export async function reorderTask(
  projectId: string,
  sprintId: string,
  sprintItemId: number,
  taskId: number,
  payload: ReorderTaskRequest
): Promise<void> {
  const response = await patch<unknown, ReorderTaskRequest>(
    `${tasksBase(projectId, sprintId, sprintItemId)}/${taskId}/reorder`,
    payload
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to reorder task");
  }
}

export async function moveTask(
  projectId: string,
  sprintId: string,
  sprintItemId: number,
  taskId: number,
  payload: MoveTaskRequest
): Promise<void> {
  const response = await patch<unknown, MoveTaskRequest>(
    `${tasksBase(projectId, sprintId, sprintItemId)}/${taskId}/move`,
    payload
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to move task");
  }
}
