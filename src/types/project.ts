/**
 * Project, ProjectMember, ProjectInvite entities aligned with backend API.
 */

import type { MemberRole, ProjectStatus } from "./enums";
import type { User } from "./user";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  ownerId: string;
  createdAt: string;
}

/**
 * Optional view: project with owner and members resolved.
 * Built from Project + getMembers + getOwner when needed by UI.
 */
export interface ProjectWithDetails extends Project {
  owner: User;
  members: ProjectMember[];
}

export interface ProjectMember {
  id: number;
  projectId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  user?: User;
}

export interface ProjectInvite {
  id: string;
  projectId: string;
  email: string;
  role: MemberRole;
  token: string;
  expiresAt: string;
  createdAt: string;
  status: string;
}
