"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import LoadingScreen from "@/components/ui/LoadingScreen";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/signin");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return <LoadingScreen isVisible />;
  }

  if (!user) {
    return <LoadingScreen isVisible />;
  }

  return <>{children}</>;
}
