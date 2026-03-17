"use client";

import { AuthProvider } from "@/features/auth/context/AuthContext";
import type { ReactNode } from "react";

export default function AuthProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
