import { type ReactNode } from "react";
import { ProjectSprintProvider } from "@/contexts/ProjectSprintContext";

export default function ProjectLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ProjectSprintProvider>{children}</ProjectSprintProvider>;
}
