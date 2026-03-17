/**
 * Board, BoardColumn, BoardCard entities aligned with backend API.
 */

import type { BoardType } from "./enums";
import type { UserStory } from "./backlog";

export interface Board {
  id: string;
  projectId: string;
  sprintId: string;
  name: string;
  description: string;
  boardType: BoardType;
  createdAt: string;
  updatedAt: string;
  columns?: BoardColumn[];
}

export interface BoardColumn {
  id: number;
  boardId: string;
  name: string;
  description: string;
  position: number;
  wipLimit: number | null;
  color: string;
  isDoneColumn: boolean;
  createdAt: string;
  updatedAt: string;
  cards?: BoardCard[];
}

export interface BoardCard {
  id: number;
  columnId: number;
  userStoryId: number;
  position: number;
  createdAt: string;
  updatedAt: string;
  userStory?: UserStory;
}
