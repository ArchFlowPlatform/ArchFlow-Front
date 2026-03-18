/**
 * Board columns API — integration plan **Step 7** (BoardColumnsController).
 */

import { get, post, put, del } from "@/lib/http-client";
import type { BoardColumn } from "@/types/board";
import type {
  CreateBoardColumnRequest,
  UpdateBoardColumnRequest,
} from "@/types/requests";

function columnsBase(projectId: string, sprintId: string): string {
  return `/projects/${projectId}/sprints/${sprintId}/board/columns`;
}

export async function getColumns(
  projectId: string,
  sprintId: string
): Promise<BoardColumn[]> {
  const response = await get<BoardColumn[]>(columnsBase(projectId, sprintId));
  if (!response.success || !Array.isArray(response.data)) {
    throw new Error(response.message ?? "Failed to fetch columns");
  }
  return response.data;
}

export async function createColumn(
  projectId: string,
  sprintId: string,
  payload: CreateBoardColumnRequest
): Promise<BoardColumn> {
  const response = await post<BoardColumn, CreateBoardColumnRequest>(
    columnsBase(projectId, sprintId),
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to create column");
  }
  return response.data;
}

export async function updateColumn(
  projectId: string,
  sprintId: string,
  columnId: number,
  payload: UpdateBoardColumnRequest
): Promise<BoardColumn> {
  const response = await put<BoardColumn, UpdateBoardColumnRequest>(
    `${columnsBase(projectId, sprintId)}/${columnId}`,
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to update column");
  }
  return response.data;
}

export async function deleteColumn(
  projectId: string,
  sprintId: string,
  columnId: number
): Promise<void> {
  const response = await del<unknown>(
    `${columnsBase(projectId, sprintId)}/${columnId}`
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to delete column");
  }
}
