"use client";

import { useState, type CSSProperties } from "react";
import { FolderKanban, Layers2 } from "lucide-react";

import AddProjectCard from "@/components/projects/AddProjectCard";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import AppSidebar from "@/components/layout/AppSidebar";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectsHeader from "@/components/projects/ProjectsHeader";
import SectionBlock from "@/components/projects/SectionBlock";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { authUserToUser } from "@/features/auth/types/auth.types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { logout } from "@/features/auth/api/auth.api";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import {
  DEFAULT_LOADING_DURATION_MS,
  startTimedGlobalLoading,
} from "@/hooks/useGlobalLoading";
import { useProjects } from "../hooks/useProjects";

const pageStyle: CSSProperties = {
  fontFamily:
    'Satoshi, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, monospace',
};

const PLACEHOLDER_USER = {
  id: "",
  name: "Carregando…",
  email: "",
  type: "",
  avatarUrl: "",
  createdAt: "",
  updatedAt: "",
} as const;

export default function ProjectsHubPage() {
  const { user, setUser } = useAuth();
  const { navigate } = useAppNavigate();
  const { projects, loading, error, refetch } = useProjects();
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const currentUserId = user?.id ?? "";

  const ownerProjects = projects.filter(
    (project) => project.ownerId === currentUserId,
  );
  const projectsAsMember = projects.filter(
    (project) =>
      project.ownerId !== currentUserId &&
      project.members.some((member) => member.userId === currentUserId),
  );
  const totalProjects = ownerProjects.length + projectsAsMember.length;

  return (
    <div
      className="h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-[var(--site-bg,#16171d)] text-white"
      style={pageStyle}
    >
      <SidebarProvider className="h-full min-h-[100dvh] w-full">
        <AppSidebar
          className="w-[17.5rem] shrink-0"
          activeItem="projects"
          signOutLabel="Sair"
          onSignOut={async () => {
            await logout();
            setUser(null);
            navigate("/");
          }}
          header={{
            title: "ArchFlow Platform",
            subtitle: "Projects Hub",
            icon: <Layers2 className="h-4 w-4" aria-hidden="true" />,
          }}
          userSummary={{
            user: authUserToUser(user) ?? PLACEHOLDER_USER,
            badgeLabel: `${totalProjects} projetos`,
          }}
          items={[
            {
              id: "projects",
              label: "Projetos",
              icon: FolderKanban,
              badge: totalProjects,
              href: "/projects",
            },
          ]}
        />

        <SidebarInset className="h-full min-h-0">
          <main className="h-full min-h-0 min-w-0 overflow-y-auto">
            <div className="af-surface-lg min-h-full bg-[#14121a]/40 p-3 sm:p-4 lg:p-5">
              <ProjectsHeader
                title="Seus projetos"
                description="Projetos que voce possui e projetos em que voce colabora."
              />

              {loading ? (
                <div className="af-text-secondary mt-4 text-sm">
                  Carregando projetos…
                </div>
              ) : error ? (
                <div className="mt-4 rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error.message}
                </div>
              ) : (
                <div className="mt-4 space-y-6">
                  <SectionBlock
                    title="Projetos que voce e dono"
                    description="Projetos sob sua responsabilidade principal."
                    count={ownerProjects.length}
                  >
                    {ownerProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                    <AddProjectCard
                      onAdd={() => setCreateProjectOpen(true)}
                    />
                  </SectionBlock>

                  <SectionBlock
                    title="Projetos que voce participa"
                    description="Projetos com colaboracao ativa em outros times."
                    count={projectsAsMember.length}
                  >
                    {projectsAsMember.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </SectionBlock>
                </div>
              )}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>

      <CreateProjectModal
        open={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        onCreated={async (project) => {
          await refetch();
          startTimedGlobalLoading(
            "project-created",
            DEFAULT_LOADING_DURATION_MS + 120,
          );
          navigate(`/projects/${project.id}/backlog`, { withLoading: false });
        }}
      />
    </div>
  );
}
