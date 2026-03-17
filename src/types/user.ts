/**
 * User entity aligned with backend API.
 * Use for API responses; omit sensitive fields (e.g. passwordHash).
 */

import type { UserType } from "./enums";

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}
