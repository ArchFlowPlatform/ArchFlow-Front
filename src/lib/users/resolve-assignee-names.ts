import { getUserById } from "@/features/users/api/users.api";
import type { User } from "@/types/user";

const USER_CACHE = new Map<string, Promise<User>>();

const FALLBACK_NAME = "Sem responsável";

function createFallbackUser(id: string, name: string = FALLBACK_NAME): User {
  return {
    id,
    name,
    email: "",
    type: "",
    avatarUrl: "",
    createdAt: "",
    updatedAt: "",
  } as User;
}

async function resolveUserByIdCachedInternal(userId: string): Promise<User> {
  const id = userId.trim();
  if (!id) return createFallbackUser(userId, FALLBACK_NAME);

  if (!USER_CACHE.has(id)) {
    const promise = getUserById(id).catch(() => createFallbackUser(id, FALLBACK_NAME));
    USER_CACHE.set(id, promise);
  }

  return await USER_CACHE.get(id)!;
}

/**
 * Resolves user IDs -> `User` (name included) with an in-memory cache.
 *
 * Notes:
 * - Never rejects: failures map to a fallback "Sem responsável".
 * - Keeps fetch out of render: use from `useEffect`/async loaders.
 */
export async function resolveUsersByIdCached(
  userIds: readonly string[],
): Promise<Record<string, User>> {
  const uniqueIds = Array.from(
    new Set(
      userIds
        .map((id) => id.trim())
        .filter((id) => Boolean(id)),
    ),
  );

  if (uniqueIds.length === 0) return {};

  const entries = await Promise.all(
    uniqueIds.map(async (id) => {
      const user = await resolveUserByIdCachedInternal(id);
      return [id, user] as const;
    }),
  );

  return Object.fromEntries(entries);
}

