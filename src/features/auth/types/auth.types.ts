/**
 * Auth-related types aligned with backend AuthController and User entity.
 */

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
 * Backend may return token and optionally the user.
 */
export interface LoginResponse {
  token: string;
  user?: AuthUser;
}
