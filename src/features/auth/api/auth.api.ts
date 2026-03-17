import { get, post } from "@/lib/http-client";
import type { ApiResponse } from "@/types/api";
import type { AuthUser, LoginRequest, LoginResponse } from "../types/auth.types";

const AUTH_BASE = "/auth";

/**
 * Login with email and password.
 * On success, the backend sets an httpOnly cookie — no manual token storage.
 */
export async function login(
  credentials: LoginRequest
): Promise<ApiResponse<LoginResponse>> {
  return post<LoginResponse, LoginRequest>(`${AUTH_BASE}/login`, credentials);
}

/**
 * Logout: call backend logout endpoint.
 * Backend clears the httpOnly cookie.
 */
export async function logout(): Promise<ApiResponse<unknown>> {
  try {
    await post<unknown>(`${AUTH_BASE}/logout`);
  } finally {
    // Cookie is cleared by backend response; no client-side cleanup needed
  }
  return {
    success: true,
    message: "Logged out",
    data: null,
    errors: [],
  };
}

/**
 * Get current authenticated user (GET /api/auth/me).
 * Returns null if not authenticated or request fails.
 */
export async function me(): Promise<ApiResponse<AuthUser | null>> {
  const response = await get<AuthUser | null>(`${AUTH_BASE}/me`);
  return response;
}
