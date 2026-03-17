/**
 * Sprint items API — aligns with backend SprintItemsController.
 * GET/POST/PATCH/DELETE /api/projects/{projectId}/sprints/{sprintId}/items
 */

import { get, post, patch, del } from "@/lib/http-client";
import type { SprintItem } from "@/types/sprint";
import type {
  CreateSprintItemRequest,
  UpdateSprintItemRequest,
} from "@/types/requests";

function sprintItemsBase(projectId: string, sprintId: string): string {
  return `/projects/${projectId}/sprints/${sprintId}/items`;
}

export async function getSprintItems(
  projectId: string,
  sprintId: string
): Promise<SprintItem[]> {
  const response = await get<SprintItem[]>(
    sprintItemsBase(projectId, sprintId)
  );
  if (!response.success || !Array.isArray(response.data)) {
    throw new Error(response.message ?? "Failed to fetch sprint items");
  }
  return response.data;
}

export async function getSprintItemById(
  projectId: string,
  sprintId: string,
  itemId: number
): Promise<SprintItem> {
  const response = await get<SprintItem>(
    `${sprintItemsBase(projectId, sprintId)}/${itemId}`
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to fetch sprint item");
  }
  return response.data;
}

export async function createSprintItem(
  projectId: string,
  sprintId: string,
  payload: CreateSprintItemRequest
): Promise<SprintItem> {
  const response = await post<SprintItem, CreateSprintItemRequest>(
    sprintItemsBase(projectId, sprintId),
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to create sprint item");
  }
  return response.data;
}

export async function updateSprintItem(
  projectId: string,
  sprintId: string,
  itemId: number,
  payload: UpdateSprintItemRequest
): Promise<SprintItem> {
  const response = await patch<SprintItem, UpdateSprintItemRequest>(
    `${sprintItemsBase(projectId, sprintId)}/${itemId}`,
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to update sprint item");
  }
  return response.data;
}

export async function deleteSprintItem(
  projectId: string,
  sprintId: string,
  itemId: number
): Promise<void> {
  const response = await del<unknown>(
    `${sprintItemsBase(projectId, sprintId)}/${itemId}`
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to delete sprint item");
  }
}
