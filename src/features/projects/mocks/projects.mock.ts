import { USE_MOCKS } from "@/lib/env";
import type { User } from "@/types/user";

type ProjectMemberRole = "owner" | "scrum_master" | "developer" | "product_owner";
type ProjectStatus = "active" | "archived" | "deleted";

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

export type { User };

// ── Mock-only exports (gated behind NEXT_PUBLIC_USE_MOCKS) ──

function getMockUserExports() {
  if (!USE_MOCKS) {
    throw new Error(
      "Mock user data requires NEXT_PUBLIC_USE_MOCKS=true. " +
        "Production code should use real API hooks instead.",
    );
  }
  /* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
  const usersMock = require("@/mocks/users.mock") as {
    currentUserId: string;
    currentUserProfile: User;
    mockUsers: User[];
  };
  /* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
  return usersMock;
}

export function getCurrentUserId(): string {
  return getMockUserExports().currentUserId;
}
export function getCurrentUserProfile(): User {
  return getMockUserExports().currentUserProfile;
}
export function getMockUsers(): User[] {
  return getMockUserExports().mockUsers;
}

export function buildMockProjects(): Project[] {
  if (!USE_MOCKS) {
    throw new Error(
      "buildMockProjects() requires NEXT_PUBLIC_USE_MOCKS=true. " +
        "Production code should use real API hooks instead.",
    );
  }
  /* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
  const sel = require("@/mocks/backend/selectors") as Record<string, (...args: unknown[]) => unknown>;
  const { projectsTable } = require("@/mocks/backend/rawData") as {
    projectsTable: Array<Record<string, unknown>>;
  };
  /* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */

  const getUser = sel.getUserById as (id: string) => User;
  const projectsById = sel.projectsById as unknown as Map<string, unknown>;

  type RawItem = Record<string, unknown>;

  return projectsTable
    .filter((p) => projectsById.has(p.id as string))
    .map((p) => {
      const owner = getUser(p.owner_id as string);
      const rawMembers = (sel.getProjectMembers(p.id as string) as RawItem[])
        .map((m) => ({
          userId: m.user_id as string,
          user: getUser(m.user_id as string),
          role: m.role as ProjectMemberRole,
          joinedAt: m.joined_at as string,
        }))
        .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
      return {
        id: p.id as string,
        name: p.name as string,
        description: (p.description as string) ?? "",
        ownerId: p.owner_id as string,
        ownerName: owner.name,
        members: rawMembers,
        status: p.status as ProjectStatus,
        createdAt: p.created_at as string,
        updatedAt: p.updated_at as string,
      };
    });
}
