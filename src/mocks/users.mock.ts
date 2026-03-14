import type { User } from "../types/user";
import { toCamelUser } from "./backend/selectors";
import { usersTable } from "./backend/rawData";

export const mockUsers: User[] = usersTable.map(toCamelUser);

const userById = new Map(mockUsers.map((user) => [user.id, user]));

export const currentUserId = "96cd4b95-acdf-4a62-9063-53292716b656";
export const currentUserProfile = getUserById(currentUserId);

export function getUserById(userId: string): User {
  const user = userById.get(userId);

  if (!user) {
    throw new Error(`Missing user mock for userId: ${userId}`);
  }

  return user;
}
