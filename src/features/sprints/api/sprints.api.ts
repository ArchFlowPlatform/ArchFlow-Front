/**
 * Sprints API — integration plan **Step 5** (SprintsController).
 * List/detail CRUD + activate, close, cancel, archive, restore.
 *
 * Lifecycle (ASP.NET-API-Domain-Analysis-Report §SprintsController):
 * - `active` → POST `.../sprints/{id}/activate`
 * - `completed` → POST `.../sprints/{id}/close`
 * - `cancelled` → POST `.../sprints/{id}/cancel`
 * - `planned` → PATCH `.../sprints/{id}` with `{ status: "planned" }` (no dedicated POST in report)
 */

import { get, post, patch } from "@/lib/http-client";
import { safeParseArray, safeParseObject } from "@/lib/api-validation";
import { SprintSchema } from "@/lib/schemas/api.schema";
import type { Sprint } from "@/types/sprint";
import type { SprintStatus } from "@/types/enums";
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

async function postSprintLifecycleCommand(
  projectId: string,
  sprintId: string,
  action: "activate" | "close" | "cancel"
): Promise<Sprint> {
  const url = `${sprintsBase(projectId)}/${sprintId}/${action}`;
  const response = await post<Sprint>(url);
  if (!response.success) {
    const fallback =
      action === "activate"
        ? "Failed to activate sprint"
        : action === "close"
          ? "Failed to close sprint"
          : "Failed to cancel sprint";
    throw new Error(response.message ?? fallback);
  }
  const raw = response.data;
  if (
    raw &&
    typeof raw === "object" &&
    "id" in raw &&
    typeof (raw as { id?: unknown }).id === "string"
  ) {
    return safeParseObject<Sprint>(
      SprintSchema,
      raw,
      `postSprintLifecycleCommand:${action}`
    );
  }
  return getSprintById(projectId, sprintId);
}

/**
 * Apply a sprint status using the HTTP verbs and routes from SprintsController
 * (POST activate/close/cancel; PATCH only for `planned`).
 */
export async function transitionSprintStatus(
  projectId: string,
  sprintId: string,
  next: SprintStatus
): Promise<Sprint> {
  switch (next) {
    case "active":
      return postSprintLifecycleCommand(projectId, sprintId, "activate");
    case "completed":
      return postSprintLifecycleCommand(projectId, sprintId, "close");
    case "cancelled":
      return postSprintLifecycleCommand(projectId, sprintId, "cancel");
    case "planned": {
      const response = await patch<Sprint, { status: "planned" }>(
        `${sprintsBase(projectId)}/${sprintId}`,
        { status: "planned" }
      );
      if (!response.success || !response.data) {
        throw new Error(response.message ?? "Failed to set sprint to planned");
      }
      return safeParseObject<Sprint>(
        SprintSchema,
        response.data,
        "transitionSprintStatus:planned"
      );
    }
    default: {
      const _exhaustive: never = next;
      throw new Error(`Unsupported sprint status: ${String(_exhaustive)}`);
    }
  }
}

export async function activateSprint(
  projectId: string,
  sprintId: string
): Promise<Sprint> {
  return postSprintLifecycleCommand(projectId, sprintId, "activate");
}

export async function closeSprint(
  projectId: string,
  sprintId: string
): Promise<Sprint> {
  return postSprintLifecycleCommand(projectId, sprintId, "close");
}

export async function cancelSprint(
  projectId: string,
  sprintId: string
): Promise<Sprint> {
  return postSprintLifecycleCommand(projectId, sprintId, "cancel");
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
