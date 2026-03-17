/**
 * Labels API — aligns with backend LabelsController.
 * GET/POST/PUT/DELETE /api/projects/{projectId}/labels
 */

import { get, post, put, del } from "@/lib/http-client";
import type { Label } from "@/types/card";
import type { CreateLabelRequest, UpdateLabelRequest } from "@/types/requests";

function labelsBase(projectId: string): string {
  return `/projects/${projectId}/labels`;
}

export async function getLabels(projectId: string): Promise<Label[]> {
  const response = await get<Label[]>(labelsBase(projectId));
  if (!response.success || !Array.isArray(response.data)) {
    throw new Error(response.message ?? "Failed to fetch labels");
  }
  return response.data;
}

export async function getLabelById(
  projectId: string,
  labelId: number
): Promise<Label> {
  const response = await get<Label>(`${labelsBase(projectId)}/${labelId}`);
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to fetch label");
  }
  return response.data;
}

export async function createLabel(
  projectId: string,
  payload: CreateLabelRequest
): Promise<Label> {
  const response = await post<Label, CreateLabelRequest>(
    labelsBase(projectId),
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to create label");
  }
  return response.data;
}

export async function updateLabel(
  projectId: string,
  labelId: number,
  payload: UpdateLabelRequest
): Promise<Label> {
  const response = await put<Label, UpdateLabelRequest>(
    `${labelsBase(projectId)}/${labelId}`,
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to update label");
  }
  return response.data;
}

export async function deleteLabel(
  projectId: string,
  labelId: number
): Promise<void> {
  const response = await del<unknown>(`${labelsBase(projectId)}/${labelId}`);
  if (!response.success) {
    throw new Error(response.message ?? "Failed to delete label");
  }
}
