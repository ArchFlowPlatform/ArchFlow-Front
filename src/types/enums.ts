/**
 * Domain enums aligned with backend API (FRONTEND_BACKEND_INTEGRATION_PLAN §2.1).
 * Used by entity interfaces and request/response types.
 */

export type UserType = string;

export type ProjectStatus = "active" | "archived" | "deleted";

export type MemberRole =
  | "owner"
  | "scrum_master"
  | "developer"
  | "product_owner";

export type InviteStatus = string;

export type BusinessValue = "high" | "medium" | "low";

export type EpicStatus = "draft" | "active" | "completed";

export type UserStoryStatus = "draft" | "ready" | "in_progress" | "done";

export type UserStoryComplexity =
  | "low"
  | "medium"
  | "high"
  | "very_high";

export type SprintStatus = "planned" | "active" | "completed" | "cancelled";

export type BoardType = "kanban" | "scrum" | "custom";

export type StoryTaskStatus = string;

export type CardActivityType =
  | "moved"
  | "created"
  | "updated"
  | "assigned"
  | "commented";
