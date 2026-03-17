/**
 * Projects API — aligns with backend ProjectsController.
 * GET/POST /api/projects, members, invites.
 */

import {
  get,
  post,
  put,
  del,
} from "@/lib/http-client";
import type {
  Project,
  ProjectMember,
  ProjectInvite,
} from "@/types/project";
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
  AddMemberRequest,
  CreateInviteRequest,
} from "@/types/requests";

const PROJECTS_BASE = "/projects";

export async function getProjects(): Promise<Project[]> {
  const response = await get<Project[]>(PROJECTS_BASE);
  if (!response.success || !Array.isArray(response.data)) {
    throw new Error(response.message ?? "Failed to fetch projects");
  }
  return response.data;
}

export async function getProjectById(id: string): Promise<Project> {
  const response = await get<Project>(`${PROJECTS_BASE}/${id}`);
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to fetch project");
  }
  return response.data;
}

export async function createProject(
  payload: CreateProjectRequest
): Promise<Project> {
  const response = await post<Project, CreateProjectRequest>(
    PROJECTS_BASE,
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to create project");
  }
  return response.data;
}

export async function updateProject(
  id: string,
  payload: UpdateProjectRequest
): Promise<Project> {
  const response = await put<Project, UpdateProjectRequest>(
    `${PROJECTS_BASE}/${id}`,
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to update project");
  }
  return response.data;
}

export async function archiveProject(id: string): Promise<void> {
  const response = await post<unknown>(`${PROJECTS_BASE}/${id}/archive`);
  if (!response.success) {
    throw new Error(response.message ?? "Failed to archive project");
  }
}

export async function restoreProject(id: string): Promise<void> {
  const response = await post<unknown>(`${PROJECTS_BASE}/${id}/restore`);
  if (!response.success) {
    throw new Error(response.message ?? "Failed to restore project");
  }
}

export async function getMembers(projectId: string): Promise<ProjectMember[]> {
  const response = await get<ProjectMember[]>(
    `${PROJECTS_BASE}/${projectId}/members`
  );
  if (!response.success || !Array.isArray(response.data)) {
    throw new Error(response.message ?? "Failed to fetch members");
  }
  return response.data;
}

export async function addMember(
  projectId: string,
  payload: AddMemberRequest
): Promise<ProjectMember> {
  const response = await post<ProjectMember, AddMemberRequest>(
    `${PROJECTS_BASE}/${projectId}/members`,
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to add member");
  }
  return response.data;
}

export async function removeMember(
  projectId: string,
  userId: string
): Promise<void> {
  const response = await del<unknown>(
    `${PROJECTS_BASE}/${projectId}/members/${userId}`
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to remove member");
  }
}

export async function getInvites(projectId: string): Promise<ProjectInvite[]> {
  const response = await get<ProjectInvite[]>(
    `${PROJECTS_BASE}/${projectId}/invites`
  );
  if (!response.success || !Array.isArray(response.data)) {
    throw new Error(response.message ?? "Failed to fetch invites");
  }
  return response.data;
}

export async function createInvite(
  projectId: string,
  payload: CreateInviteRequest
): Promise<ProjectInvite> {
  const response = await post<ProjectInvite, CreateInviteRequest>(
    `${PROJECTS_BASE}/${projectId}/invites`,
    payload
  );
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to create invite");
  }
  return response.data;
}

export async function acceptInvite(token: string): Promise<void> {
  const response = await put<unknown>(
    `${PROJECTS_BASE}/invites/${token}/accept`
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to accept invite");
  }
}

export async function declineInvite(token: string): Promise<void> {
  const response = await put<unknown>(
    `${PROJECTS_BASE}/invites/${token}/decline`
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to decline invite");
  }
}

export async function revokeInvite(token: string): Promise<void> {
  const response = await put<unknown>(
    `${PROJECTS_BASE}/invites/${token}/revoke`
  );
  if (!response.success) {
    throw new Error(response.message ?? "Failed to revoke invite");
  }
}
