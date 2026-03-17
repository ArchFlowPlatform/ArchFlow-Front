import { get, post } from "@/lib/http-client";
import { setToken, clearToken } from "@/lib/auth-token";
import type { ApiResponse } from "@/types/api";
import type { AuthUser, LoginRequest, LoginResponse } from "../types/auth.types";

const AUTH_BASE = "/auth";

/**
 * Login with email and password.
 * On success, stores the token and returns the response data.
 */
export async function login(
  credentials: LoginRequest
): Promise<ApiResponse<LoginResponse>> {
  const response = await post<LoginResponse, LoginRequest>(
    `${AUTH_BASE}/login`,
    credentials
  );
  if (response.success && response.data?.token) {
    setToken(response.data.token);
  }
  return response;
}

/**
 * Logout: call backend logout endpoint and clear local token.
 */
export async function logout(): Promise<ApiResponse<unknown>> {
  try {
    await post<unknown>(`${AUTH_BASE}/logout`);
  } finally {
    clearToken();
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
