/**
 * Sprints API — integration plan **Step 5** (SprintsController).
 * List/detail CRUD + activate, close, cancel, archive, restore.
 */

import { get, post, patch } from "@/lib/http-client";
import { safeParseArray, safeParseObject } from "@/lib/api-validation";
import { SprintSchema } from "@/lib/schemas/api.schema";
import type { Sprint } from "@/types/sprint";
import type {
  CreateSprintRequest,
  UpdateSprintRequest,
} from "@/types/requests";

function sprintsBase(projectId: string): string {
  return `/projects/${projectId}/sprints`;
}

export async function getSprints(projectId: string): Promise<Sprint[]> {
  const response = await get<Sprint[]>(sprintsBase(projectId));
  if (!response.success || !Array.isArray(response.data)) {
    throw new Error(response.message ?? "Failed to fetch sprints");
  }
  return safeParseArray<Sprint>(SprintSchema, response.data, "getSprints");
}

export async function getSprintById(
  projectId: string,
  sprintId: string
): Promise<Sprint> {
  const response = await get<Sprint>(
    `${sprintsBase(projectId)}/${sprintId}`
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to fetch sprint");
  }
  return safeParseObject<Sprint>(SprintSchema, response.data, "getSprintById");
}

export async function createSprint(
  projectId: string,
  payload: CreateSprintRequest
): Promise<Sprint> {
  const response = await post<Sprint, CreateSprintRequest>(
    sprintsBase(projectId),
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to create sprint");
  }
  return response.data;
}

export async function updateSprint(
  projectId: string,
  sprintId: string,
  payload: UpdateSprintRequest
): Promise<Sprint> {
  const response = await patch<Sprint, UpdateSprintRequest>(
    `${sprintsBase(projectId)}/${sprintId}`,
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to update sprint");
  }
  return response.data;
}

export async function activateSprint(
  projectId: string,
  sprintId: string
): Promise<void> {
  const response = await post<unknown>(
    `${sprintsBase(projectId)}/${sprintId}/activate`
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to activate sprint");
  }
}

export async function closeSprint(
  projectId: string,
  sprintId: string
): Promise<void> {
  const response = await post<unknown>(
    `${sprintsBase(projectId)}/${sprintId}/close`
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to close sprint");
  }
}

export async function cancelSprint(
  projectId: string,
  sprintId: string
): Promise<void> {
  const response = await post<unknown>(
    `${sprintsBase(projectId)}/${sprintId}/cancel`
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to cancel sprint");
  }
}

export async function archiveSprint(
  projectId: string,
  sprintId: string
): Promise<void> {
  const response = await patch<unknown>(
    `${sprintsBase(projectId)}/${sprintId}/archive`
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to archive sprint");
  }
}

export async function restoreSprint(
  projectId: string,
  sprintId: string
): Promise<void> {
  const response = await patch<unknown>(
    `${sprintsBase(projectId)}/${sprintId}/restore`
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to restore sprint");
  }
}
