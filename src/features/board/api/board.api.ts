/**
 * Board API — aligns with backend BoardsController.
 * GET/PATCH /api/projects/{projectId}/sprints/{sprintId}/board
 */

import { get, patch } from "@/lib/http-client";
import type { Board } from "@/types/board";
import type { UpdateBoardRequest } from "@/types/requests";

function boardBase(projectId: string, sprintId: string): string {
  return `/projects/${projectId}/sprints/${sprintId}/board`;
}

export async function getBoard(
  projectId: string,
  sprintId: string
): Promise<Board> {
  const response = await get<Board>(boardBase(projectId, sprintId));
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to fetch board");
  }
  return response.data;
}

export async function updateBoard(
  projectId: string,
  sprintId: string,
  payload: UpdateBoardRequest
): Promise<Board> {
  const response = await patch<Board, UpdateBoardRequest>(
    boardBase(projectId, sprintId),
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to update board");
  }
  return response.data;
}
