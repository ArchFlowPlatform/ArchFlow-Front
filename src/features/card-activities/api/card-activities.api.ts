/**
 * Card activities API — integration plan **Step 8** (CardActivitiesController).
 */

import { get, post } from "@/lib/http-client";
import type { CardActivity } from "@/types/card";
import type { CreateCardActivityRequest } from "@/types/requests";

function activitiesBase(projectId: string, cardId: number): string {
  return `/projects/${projectId}/cards/${cardId}/activities`;
}

export async function getActivities(
  projectId: string,
  cardId: number
): Promise<CardActivity[]> {
  const response = await get<CardActivity[]>(
    activitiesBase(projectId, cardId)
  );
  if (!response.success || !Array.isArray(response.data)) {
    throw new Error(response.message ?? "Failed to fetch activities");
  }
  return response.data;
}

export async function createActivity(
  projectId: string,
  cardId: number,
  payload: CreateCardActivityRequest
): Promise<CardActivity> {
  const response = await post<CardActivity, CreateCardActivityRequest>(
    activitiesBase(projectId, cardId),
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to create activity");
  }
  return response.data;
}
