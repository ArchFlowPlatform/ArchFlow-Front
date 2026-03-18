/**
 * Card labels API — integration plan **Step 8** (CardLabelsController).
 */

import { get, post, del } from "@/lib/http-client";
import type { CardLabel, Label } from "@/types/card";
import type { AddLabelToCardRequest } from "@/types/requests";

function cardLabelsBase(projectId: string, cardId: number): string {
  return `/projects/${projectId}/cards/${cardId}/labels`;
}

export async function getCardLabels(
  projectId: string,
  cardId: number
): Promise<(CardLabel & { label?: Label })[]> {
  const response = await get<(CardLabel & { label?: Label })[]>(
    cardLabelsBase(projectId, cardId)
  );
  if (!response.success || !Array.isArray(response.data)) {
    throw new Error(response.message ?? "Failed to fetch card labels");
  }
  return response.data;
}

export async function addLabelToCard(
  projectId: string,
  cardId: number,
  payload: AddLabelToCardRequest
): Promise<CardLabel> {
  const response = await post<CardLabel, AddLabelToCardRequest>(
    cardLabelsBase(projectId, cardId),
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to add label to card");
  }
  return response.data;
}

export async function removeLabelFromCard(
  projectId: string,
  cardId: number,
  cardLabelId: number
): Promise<void> {
  const response = await del<unknown>(
    `${cardLabelsBase(projectId, cardId)}/${cardLabelId}`
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to remove label from card");
  }
}
