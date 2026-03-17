import type { CSSProperties, ReactNode } from "react";
import {
  KanbanSquare,
  ListChecks,
  ListTodo,
  Timer,
} from "lucide-react";

import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import type { User } from "../../types/user";
import SprintSelector from "../sprint/SprintSelector";
import ProjectHeader from "./ProjectHeader";
import ProjectSidebar, {
  type ProjectSidebarNavItemId,
} from "./ProjectSidebar";

const pageStyle: CSSProperties = {
  fontFamily:
    'Satoshi, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, monospace',
};

interface ProjectShellProps {
  projectId: string;
  projectName: string;
  projectOwnerName: string;
  /** Optional badge in project summary (e.g. member count). Shown when provided. */
  projectBadgeLabel?: string;
  activeNavItem: ProjectSidebarNavItemId;
  pageTitle: string;
  pageSubtitle: string;
  pageContextLabel?: string;
  currentUser: User;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  mainColumn: ReactNode;
  sideColumn?: ReactNode;
  headerRightSlot?: ReactNode;
  fullWidthMain?: boolean;
}

export default function ProjectShell({
  projectId,
  projectName,
  projectOwnerName,
  projectBadgeLabel,
  activeNavItem,
  pageTitle,
  pageSubtitle,
  pageContextLabel,
  currentUser,
  showSearch = false,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  mainColumn,
  sideColumn,
  headerRightSlot,
  fullWidthMain = false,
}: ProjectShellProps) {
  const shouldShowSprintSelector =
    activeNavItem === "sprint" ||
    activeNavItem === "sprint-backlog" ||
    activeNavItem === "kanban";

  return (
    <div
      className="h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-[var(--site-bg,#16171d)] text-white"
      style={pageStyle}
    >
      <SidebarProvider className="h-full min-h-[100dvh] w-full">
        <ProjectSidebar
          className="w-[17.5rem] shrink-0"
          projectName={projectName}
          projectOwnerName={projectOwnerName}
          projectBadgeLabel={projectBadgeLabel}
          activeItem={activeNavItem}
          navItems={[
            {
              id: "backlog",
              label: "Backlog",
              icon: ListTodo,
              href: `/projects/${projectId}/backlog`,
            },
            {
              id: "sprint",
              label: "Sprint",
              icon: Timer,
              href: `/projects/${projectId}/sprint`,
            },
            {
              id: "sprint-backlog",
              label: "Sprint Backlog",
              icon: ListChecks,
              href: `/projects/${projectId}/sprint-backlog`,
            },
            {
              id: "kanban",
              label: "Kanban",
              icon: KanbanSquare,
              href: `/projects/${projectId}/kanban`,
            },
          ]}
        />

        <SidebarInset className="h-full min-h-0">
          <main className="h-full min-h-0 min-w-0 overflow-hidden">
            <div className="af-surface-lg flex h-full min-h-0 flex-col bg-[#14121a]/40">
              <ProjectHeader
                title={pageTitle}
                subtitleChip={pageContextLabel}
                description={pageSubtitle}
                showSearch={showSearch}
                searchPlaceholder={searchPlaceholder}
                searchValue={searchValue}
                onSearchChange={onSearchChange}
                user={currentUser}
                rightSlot={
                  shouldShowSprintSelector ? (
                    <div className="flex items-center gap-2">
                      <SprintSelector projectId={projectId} />
                      {headerRightSlot}
                    </div>
                  ) : (
                    headerRightSlot
                  )
                }
              />

              <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
                {fullWidthMain ? (
                  <section className="min-w-0">{mainColumn}</section>
                ) : (
                  <div className="grid min-h-0 gap-4 lg:gap-5 xl:gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
                    <section aria-label="Project main content" className="min-w-0">
                      {mainColumn}
                    </section>

                    <aside
                      aria-label="Project side content"
                      className="min-w-0 space-y-4 lg:space-y-5"
                    >
                      {sideColumn}
                    </aside>
                  </div>
                )}
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

