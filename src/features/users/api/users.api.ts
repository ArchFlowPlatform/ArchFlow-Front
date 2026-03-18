/**
 * Users API — integration plan **Step 9** (UsersController).
 * Used for assignee resolution (GET /api/users/{id}) and sign-up (POST /api/users).
 */

import { get, post } from "@/lib/http-client";
import type { User } from "@/types/user";
import type { CreateUserRequest } from "@/types/requests";

const USERS_BASE = "/users";

export async function getUserById(id: string): Promise<User> {
  const response = await get<User>(`${USERS_BASE}/${id}`);
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to fetch user");
  }
  return response.data;
}

export async function createUser(
  payload: CreateUserRequest
): Promise<User> {
  const response = await post<User, CreateUserRequest>(USERS_BASE, payload);
  if (!response.success || !response.data) {
    throw new Error(response.message ?? "Failed to create user");
  }
  return response.data;
}
