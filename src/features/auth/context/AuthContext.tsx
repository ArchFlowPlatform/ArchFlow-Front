"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { me as fetchMe } from "../api/auth.api";
import type { AuthUser } from "../types/auth.types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth state is derived from GET /auth/me.
 * With httpOnly cookies, the browser sends the cookie automatically.
 * No client-side token access.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUser = useCallback((value: AuthUser | null) => {
    setUserState(value);
  }, []);

  const refetchUser = useCallback(async () => {
    try {
      const response = await fetchMe();
      if (response.success && response.data) {
        setUserState(response.data);
      } else {
        setUserState(null);
      }
    } catch {
      setUserState(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchMe()
      .then((response) => {
        if (cancelled) return;
        if (response.success && response.data) {
          setUserState(response.data);
        } else {
          setUserState(null);
        }
      })
      .catch(() => {
        if (!cancelled) setUserState(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      setUser,
      refetchUser,
    }),
    [user, isLoading, setUser, refetchUser]
  );

  if (isLoading) {
    return (
      <AuthContext.Provider value={value}>
        <LoadingScreen isVisible />
        <span className="sr-only">Loading authentication…</span>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
