/**
 * Board cards API — integration plan **Step 7** (BoardCardsController).
 * Drag between columns → `moveCard`; same column order → `reorderCard`.
 */

import { get, post, patch, del } from "@/lib/http-client";
import type { BoardCard } from "@/types/board";
import type {
  CreateBoardCardRequest,
  ReorderCardRequest,
  MoveCardRequest,
} from "@/types/requests";

function cardsBase(
  projectId: string,
  sprintId: string,
  columnId: number
): string {
  return `/projects/${projectId}/sprints/${sprintId}/board/columns/${columnId}/cards`;
}

export async function getCards(
  projectId: string,
  sprintId: string,
  columnId: number
): Promise<BoardCard[]> {
  const response = await get<BoardCard[]>(
    cardsBase(projectId, sprintId, columnId)
  );
  if (!response.success || !Array.isArray(response.data)) {
    throw new Error(response.message ?? "Failed to fetch cards");
  }
  return response.data;
}

export async function createCard(
  projectId: string,
  sprintId: string,
  columnId: number,
  payload: CreateBoardCardRequest
): Promise<BoardCard> {
  const response = await post<BoardCard, CreateBoardCardRequest>(
    cardsBase(projectId, sprintId, columnId),
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to create card");
  }
  return response.data;
}

export async function reorderCard(
  projectId: string,
  sprintId: string,
  columnId: number,
  cardId: number,
  payload: ReorderCardRequest
): Promise<void> {
  const response = await patch<unknown, ReorderCardRequest>(
    `${cardsBase(projectId, sprintId, columnId)}/${cardId}/reorder`,
    payload
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to reorder card");
  }
}

export async function moveCard(
  projectId: string,
  sprintId: string,
  sourceColumnId: number,
  cardId: number,
  payload: MoveCardRequest
): Promise<void> {
  const response = await patch<unknown, MoveCardRequest>(
    `${cardsBase(projectId, sprintId, sourceColumnId)}/${cardId}/move`,
    payload
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to move card");
  }
}

export async function deleteCard(
  projectId: string,
  sprintId: string,
  columnId: number,
  cardId: number
): Promise<void> {
  const response = await del<unknown>(
    `${cardsBase(projectId, sprintId, columnId)}/${cardId}`
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to delete card");
  }
}
