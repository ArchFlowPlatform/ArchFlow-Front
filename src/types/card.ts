/**
 * Label, CardLabel, CardComment, CardAttachment, CardActivity
 * (card sub-resources) aligned with backend API.
 */

import type { CardActivityType } from "./enums";

export interface Label {
  id: number;
  projectId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardLabel {
  id: number;
  cardId: number;
  labelId: number;
  createdAt: string;
}

export interface CardComment {
  id: number;
  cardId: number;
  userId: string;
  content: string;
  parentCommentId: number | null;
  createdAt: string;
  updatedAt: string;
  replies?: CardComment[];
}

export interface CardAttachment {
  id: number;
  cardId: number;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  mimeType: string;
  uploadedBy: string;
  createdAt: string;
}

export interface CardActivity {
  id: number;
  cardId: number;
  userId: string;
  activityType: CardActivityType;
  oldValue: string;
  newValue: string;
  description: string;
  createdAt: string;
}
