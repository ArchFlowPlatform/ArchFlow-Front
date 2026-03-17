/**
 * Auth-related types aligned with backend AuthController and User entity.
 */

import type { User } from "@/types/user";

export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Current user returned by GET /api/auth/me (and optionally by login).
 * Omits sensitive fields (e.g. passwordHash).
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  type: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response from POST /api/auth/login.
 * With httpOnly cookies, token may be omitted (auth via cookie).
 * Backend may return user in response.
 */
export interface LoginResponse {
  token?: string;
  user?: AuthUser;
}

/**
 * Maps AuthUser to User for components that expect the shared User type.
 * Returns null if user is null.
 */
export function authUserToUser(user: AuthUser | null): User | null {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    type: user.type,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
