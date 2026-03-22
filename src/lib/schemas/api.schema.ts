/**
 * Step 10 — Zod schemas for API response validation.
 * Covers the critical entities. Use `safeParse*` helpers from `@/lib/api-validation`
 * when consuming API responses in the service/hook layer.
 */

import { z } from "zod";
import { normalizeStoryTaskStatus } from "@/lib/story-task-status";

// ── Shared helpers ──────────────────────────────────────────

const isoDateString = z.string();

// ── User ────────────────────────────────────────────────────

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  type: z.string(),
  avatarUrl: z.string().nullable().default(""),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

// ── Project ─────────────────────────────────────────────────

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().default(""),
  status: z.enum(["active", "archived", "deleted"]),
  ownerId: z.string(),
  ownerName: z.string().nullable().default(""),
  createdAt: isoDateString,
});

export const ProjectMemberSchema = z.object({
  id: z.number(),
  projectId: z.string(),
  userId: z.string(),
  role: z.enum(["owner", "scrum_master", "developer", "product_owner"]),
  joinedAt: isoDateString,
  user: UserSchema.optional(),
});

// ── Backlog ─────────────────────────────────────────────────

export const UserStorySchema = z.object({
  id: z.number(),
  epicId: z.number(),
  title: z.string(),
  persona: z.string().nullable().default(""),
  description: z.string().nullable().default(""),
  acceptanceCriteria: z.string().nullable().default(""),
  complexity: z.enum(["low", "medium", "high", "very_high"]),
  effort: z.number().nullable(),
  dependencies: z.string().nullable().default(""),
  priority: z.number(),
  businessValue: z.enum(["high", "medium", "low"]),
  status: z.enum(["draft", "ready", "in_progress", "done"]),
  backlogPosition: z.number(),
  assigneeId: z.string().nullable(),
  isArchived: z.boolean(),
  archivedAt: isoDateString.nullable(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

export const EpicSchema = z.object({
  id: z.number(),
  productBacklogId: z.string(),
  name: z.string(),
  description: z.string().nullable().default(""),
  businessValue: z.enum(["high", "medium", "low"]),
  status: z.enum(["draft", "active", "completed"]),
  position: z.number(),
  priority: z.number(),
  color: z.string().nullable().default(""),
  isArchived: z.boolean(),
  archivedAt: isoDateString.nullable(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
  userStories: z.array(UserStorySchema).optional(),
});

export const ProductBacklogSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  overview: z.string().nullable().default(""),
  createdAt: isoDateString,
  updatedAt: isoDateString,
  epics: z.array(EpicSchema).optional(),
});

// ── Sprint ──────────────────────────────────────────────────

export const SprintSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  goal: z.string().nullable().default(""),
  executionPlan: z.string().nullable().default(""),
  startDate: isoDateString,
  endDate: isoDateString,
  status: z.enum(["planned", "active", "completed", "cancelled"]),
  capacityHours: z.number(),
  isArchived: z.boolean(),
  archivedAt: isoDateString.nullable(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

export const StoryTaskSchema = z.object({
  id: z.number(),
  sprintItemId: z.number(),
  title: z.string(),
  description: z.string().nullable().default(""),
  assigneeId: z.string().nullable(),
  estimatedHours: z.number().nullable(),
  actualHours: z.number().nullable(),
  priority: z.number(),
  position: z.number(),
  status: z.preprocess(
    (v) => normalizeStoryTaskStatus(v),
    z.union([z.literal(0), z.literal(1), z.literal(2)]),
  ),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

export const SprintItemSchema = z.object({
  id: z.number(),
  sprintId: z.string(),
  userStoryId: z.number(),
  position: z.number(),
  notes: z.string().nullable().default(""),
  addedAt: isoDateString,
  userStory: UserStorySchema.optional(),
  tasks: z.array(StoryTaskSchema).optional(),
});

// ── Board ───────────────────────────────────────────────────

export const BoardCardSchema = z.object({
  id: z.number(),
  columnId: z.number(),
  userStoryId: z.number(),
  position: z.number(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
  userStory: UserStorySchema.optional(),
});

export const BoardColumnSchema = z.object({
  id: z.number(),
  boardId: z.string(),
  name: z.string(),
  description: z.string().nullable().default(""),
  position: z.number(),
  wipLimit: z.number().nullable(),
  color: z.string().nullable().default(""),
  isDoneColumn: z.boolean(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
  cards: z.array(BoardCardSchema).optional(),
});

export const BoardSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  sprintId: z.string(),
  name: z.string(),
  description: z.string().nullable().default(""),
  boardType: z.enum(["kanban", "scrum", "custom"]),
  createdAt: isoDateString,
  updatedAt: isoDateString,
  columns: z.array(BoardColumnSchema).optional(),
});

// ── Card sub-resources ──────────────────────────────────────

export const LabelSchema = z.object({
  id: z.number(),
  projectId: z.string(),
  name: z.string(),
  color: z.string(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

export const CardLabelSchema = z.object({
  id: z.number(),
  cardId: z.number(),
  labelId: z.number(),
  createdAt: isoDateString,
  label: LabelSchema.optional(),
});

export const CardCommentSchema: z.ZodTypeAny = z.object({
  id: z.number(),
  cardId: z.number(),
  userId: z.string(),
  content: z.string(),
  parentCommentId: z.number().nullable(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
  replies: z.lazy(() => z.array(CardCommentSchema)).optional(),
});

export const CardAttachmentSchema = z.object({
  id: z.number(),
  cardId: z.number(),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number().nullable(),
  mimeType: z.string(),
  uploadedBy: z.string(),
  createdAt: isoDateString,
});

export const CardActivitySchema = z.object({
  id: z.number(),
  cardId: z.number(),
  userId: z.string(),
  activityType: z.enum(["moved", "created", "updated", "assigned", "commented"]),
  oldValue: z.string().nullable().default(""),
  newValue: z.string().nullable().default(""),
  description: z.string().nullable().default(""),
  createdAt: isoDateString,
});
