"use client";

import { useState, useEffect, useCallback } from "react";
import type { User } from "@/types/user";
import { getUserById } from "../api/users.api";

/** Step 9: resolve a single user by id. Use for assignee names, comment authors, etc. */
export interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useUser(userId: string | null): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getUserById(userId);
      setUser(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser };
}
