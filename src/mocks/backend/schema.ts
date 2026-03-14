export type ProjectStatus = "active" | "archived" | "deleted";
export type ProjectMemberRole =
  | "owner"
  | "scrum_master"
  | "developer"
  | "product_owner";
export type BusinessValue = "high" | "medium" | "low";
export type EpicStatus = "draft" | "active" | "completed";
export type UserStoryComplexity = "low" | "medium" | "high" | "very_high";
export type UserStoryStatus = "draft" | "ready" | "in_progress" | "done";
export type SprintStatus = "planned" | "active" | "completed";
export type BoardType = "kanban" | "scrum" | "custom";
export type CardPriority = "low" | "medium" | "high" | "urgent";
export type CardActivityType =
  | "moved"
  | "created"
  | "updated"
  | "assigned"
  | "commented";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  type: string | null;
  password_hash: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectMemberRow {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectMemberRole;
  joined_at: string;
}

export interface ProductBacklogRow {
  id: string;
  project_id: string;
  overview: string | null;
  created_at: string;
  updated_at: string;
}

export interface EpicRow {
  id: string;
  product_backlog_id: string;
  name: string;
  description: string | null;
  business_value: BusinessValue;
  status: EpicStatus;
  priority: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface UserStoryRow {
  id: string;
  epic_id: string;
  title: string;
  persona: string;
  description: string;
  acceptance_criteria: string | null;
  complexity: UserStoryComplexity;
  effort: number | null;
  dependencies: string | null;
  priority: number;
  business_value: BusinessValue;
  status: UserStoryStatus;
  assignee_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SprintRow {
  id: string;
  project_id: string;
  name: string;
  goal: string | null;
  start_date: string;
  end_date: string;
  status: SprintStatus;
  capacity_hours: number | null;
  created_at: string;
  updated_at: string;
}

export interface SprintItemRow {
  id: string;
  sprint_id: string;
  user_story_id: string;
  added_at: string;
}

export interface TaskRow {
  id: string;
  user_story_id: string;
  title: string;
  description: string | null;
  assignee_id: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface BoardRow {
  id: string;
  project_id: string;
  sprint_id: string | null;
  name: string;
  description: string | null;
  board_type: BoardType;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface BoardColumnRow {
  id: string;
  board_id: string;
  name: string;
  description: string | null;
  position: number;
  wip_limit: number | null;
  color: string;
  is_done_column: boolean;
  created_at: string;
  updated_at: string;
}

export interface CardRow {
  id: string;
  column_id: string;
  user_story_id: string | null;
  task_id: string | null;
  title: string;
  description: string | null;
  assignee_id: string | null;
  position: number;
  priority: CardPriority;
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface LabelRow {
  id: string;
  project_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface CardLabelRow {
  id: string;
  card_id: string;
  label_id: string;
  created_at: string;
}

export interface CardCommentRow {
  id: string;
  card_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CardActivityRow {
  id: string;
  card_id: string;
  user_id: string;
  activity_type: CardActivityType;
  old_value: unknown | null;
  new_value: unknown | null;
  description: string | null;
  created_at: string;
}
