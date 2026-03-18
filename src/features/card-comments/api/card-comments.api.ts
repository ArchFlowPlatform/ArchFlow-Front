/**
 * Card comments API — integration plan **Step 8** (CardCommentsController).
 */

import { get, post, put, del } from "@/lib/http-client";
import type { CardComment } from "@/types/card";
import type {
  CreateCardCommentRequest,
  UpdateCardCommentRequest,
} from "@/types/requests";

function commentsBase(projectId: string, cardId: number): string {
  return `/projects/${projectId}/cards/${cardId}/comments`;
}

export async function getComments(
  projectId: string,
  cardId: number
): Promise<CardComment[]> {
  const response = await get<CardComment[]>(
    commentsBase(projectId, cardId)
  );
  if (!response.success || !Array.isArray(response.data)) {
    throw new Error(response.message ?? "Failed to fetch comments");
  }
  return response.data;
}

export async function createComment(
  projectId: string,
  cardId: number,
  payload: CreateCardCommentRequest
): Promise<CardComment> {
  const response = await post<CardComment, CreateCardCommentRequest>(
    commentsBase(projectId, cardId),
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to create comment");
  }
  return response.data;
}

export async function updateComment(
  projectId: string,
  cardId: number,
  commentId: number,
  payload: UpdateCardCommentRequest
): Promise<CardComment> {
  const response = await put<CardComment, UpdateCardCommentRequest>(
    `${commentsBase(projectId, cardId)}/${commentId}`,
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to update comment");
  }
  return response.data;
}

export async function deleteComment(
  projectId: string,
  cardId: number,
  commentId: number
): Promise<void> {
  const response = await del<unknown>(
    `${commentsBase(projectId, cardId)}/${commentId}`
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to delete comment");
  }
}
