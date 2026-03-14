"use client";

import type { CSSProperties } from "react";
import { FolderKanban, Layers2 } from "lucide-react";

import AddProjectCard from "../../components/projects/AddProjectCard";
import AppSidebar from "../../components/layout/AppSidebar";
import ProjectCard from "../../components/projects/ProjectCard";
import ProjectsHeader from "../../components/projects/ProjectsHeader";
import SectionBlock from "../../components/projects/SectionBlock";
import { SidebarInset, SidebarProvider } from "../../components/ui/sidebar";
import {
  currentUserId,
  currentUserProfile,
  mockProjects,
} from "./_mocks/projects.mock";

const pageStyle: CSSProperties = {
  fontFamily:
    'Satoshi, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, monospace',
};

export default function ProjectsHubPage() {
  const ownerProjects = mockProjects.filter(
    (project) => project.ownerId === currentUserId,
  );

  const projectsAsMember = mockProjects.filter(
    (project) =>
      project.ownerId !== currentUserId &&
      project.members.some((member) => member.user.id === currentUserId),
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
          header={{
            title: "ArchFlow Platform",
            subtitle: "Projects Hub",
            icon: <Layers2 className="h-4 w-4" aria-hidden="true" />,
          }}
          userSummary={{
            user: currentUserProfile,
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

                <div className="mt-4 space-y-6">
                  <SectionBlock
                    title="Projetos que voce e dono"
                    description="Projetos sob sua responsabilidade principal."
                    count={ownerProjects.length}
                  >
                    {ownerProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                    <AddProjectCard />
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
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
