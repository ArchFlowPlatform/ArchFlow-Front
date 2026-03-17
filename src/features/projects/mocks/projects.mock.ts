import {
  currentUserId,
  currentUserProfile,
  mockUsers,
} from "@/mocks/users.mock";
import {
  getProjectMembers,
  getProjectRowById,
  getUserById,
  projectsById,
} from "@/mocks/backend/selectors";
import { projectsTable } from "@/mocks/backend/rawData";
import type {
  ProjectMemberRole,
  ProjectStatus,
} from "@/mocks/backend/schema";
import type { User } from "@/types/user";

export interface ProjectMember {
  userId: string;
  user: User;
  role: ProjectMemberRole;
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  members: ProjectMember[];
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export { currentUserId, currentUserProfile, mockUsers };
export type { User };

function buildProjectView(projectId: string): Project {
  const project = getProjectRowById(projectId);
  const owner = getUserById(project.owner_id);
  const members = getProjectMembers(project.id)
    .map((member) => ({
      userId: member.user_id,
      user: getUserById(member.user_id),
      role: member.role,
      joinedAt: member.joined_at,
    }))
    .sort((left, right) => left.joinedAt.localeCompare(right.joinedAt));

  return {
    id: project.id,
    name: project.name,
    description: project.description ?? "",
    ownerId: project.owner_id,
    ownerName: owner.name,
    members,
    status: project.status,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
  };
}

export const mockProjects: Project[] = projectsTable
  .filter((project) => projectsById.has(project.id))
  .map((project) => buildProjectView(project.id));
