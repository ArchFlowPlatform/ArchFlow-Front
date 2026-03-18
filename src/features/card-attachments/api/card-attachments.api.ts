/**
 * Card attachments API — integration plan **Step 8** (CardAttachmentsController).
 * POST uses `multipart/form-data` (file upload).
 */

import { get, del } from "@/lib/http-client";
import { httpClient } from "@/lib/http-client";
import type { ApiResponse } from "@/types/api";
import type { CardAttachment } from "@/types/card";

function attachmentsBase(projectId: string, cardId: number): string {
  return `/projects/${projectId}/cards/${cardId}/attachments`;
}

export async function getAttachments(
  projectId: string,
  cardId: number
): Promise<CardAttachment[]> {
  const response = await get<CardAttachment[]>(
    attachmentsBase(projectId, cardId)
  );
  if (!response.success || !Array.isArray(response.data)) {
    throw new Error(response.message ?? "Failed to fetch attachments");
  }
  return response.data;
}

export async function createAttachment(
  projectId: string,
  cardId: number,
  formData: FormData
): Promise<CardAttachment> {
  const response = await httpClient.post<ApiResponse<CardAttachment>>(
    attachmentsBase(projectId, cardId),
    formData,
    {
      headers: {
        "Content-Type": undefined as unknown as string,
      },
    }
  );
  const data = response.data;
  if (!data.success || !data.data) {
    throw new Error(data.message ?? "Failed to upload attachment");
  }
  return data.data;
}

export async function deleteAttachment(
  projectId: string,
  cardId: number,
  attachmentId: number
): Promise<void> {
  const response = await del<unknown>(
    `${attachmentsBase(projectId, cardId)}/${attachmentId}`
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to delete attachment");
  }
}
