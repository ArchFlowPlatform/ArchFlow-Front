"use client";

import type { LucideIcon } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  ArrowLeftFromLine,
  Blocks,
  ChevronDown,
  ChevronRight,
  Layers2,
} from "lucide-react";

import { cx } from "@/lib/utils/cx";
import type { User } from "@/types/user";
import UserAvatar from "../ui/UserAvatar";
import { useAppNavigate, shouldHandleNavigationClick } from "@/hooks/useAppNavigate";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "../ui/sidebar";

export type ProjectSidebarNavItemId =
  | "backlog"
  | "sprint"
  | "sprint-backlog"
  | "kanban";

export interface ProjectSidebarNavItem {
  id: ProjectSidebarNavItemId;
  label: string;
  icon?: LucideIcon;
  href?: string;
  badge?: number | string;
}

export interface ProjectSidebarProps {
  projectName: string;
  projectOwner: User;
  /** Optional badge for project summary (e.g. member count). Same style as Projects hub user summary badge. */
  projectBadgeLabel?: string;
  navItems: ProjectSidebarNavItem[];
  activeItem: ProjectSidebarNavItemId;
  className?: string;
  footer?: ReactNode;
}

export default function ProjectSidebar({
  projectName,
  projectOwner,
  projectBadgeLabel,
  navItems,
  activeItem,
  className,
  footer,
}: ProjectSidebarProps) {
  const { navigate } = useAppNavigate();
  const ownerLabel = `owner: ${projectOwner.name}`;
  const scrumItemIds: ProjectSidebarNavItemId[] = [
    "backlog",
    "sprint",
    "sprint-backlog",
  ];
  const scrumItems = navItems.filter((item) => scrumItemIds.includes(item.id));
  const topLevelItems = navItems.filter((item) => !scrumItemIds.includes(item.id));
  const isScrumActive = scrumItemIds.includes(activeItem);
  const [isScrumExpanded, setIsScrumExpanded] = useState(isScrumActive);

  useEffect(() => {
    if (isScrumActive) {
      setIsScrumExpanded(true);
    }
  }, [isScrumActive]);

  function handleNavigation(
    event: MouseEvent<HTMLAnchorElement>,
    href?: string,
  ): void {
    if (!href || !shouldHandleNavigationClick(event)) {
      return;
    }

    event.preventDefault();
    navigate(href);
  }

  function getNavRowClassName(isActive: boolean, options?: { indented?: boolean }) {
    return cx(
      "af-focus-ring af-nav-item flex w-full items-center justify-between gap-3 px-3 py-2 text-sm transition",
      options?.indented ? "pl-4" : undefined,
      isActive
        ? "af-nav-item-active text-white"
        : "text-white/72 hover:bg-white/[0.03] hover:text-white",
    );
  }

  function renderNavItem(
    item: ProjectSidebarNavItem,
    options?: { indented?: boolean },
  ) {
    const Icon = item.icon;
    const isActive = item.id === activeItem;

    const content = (
      <>
        <span className="inline-flex min-w-0 items-center gap-2.5">
          {Icon ? (
            <Icon
              className={cx(
                "af-nav-icon h-4 w-4",
                isActive ? "text-[var(--accent-soft-35)]" : "text-white/52",
              )}
              aria-hidden="true"
            />
          ) : null}
          <span className="truncate">{item.label}</span>
        </span>

        {item.badge !== undefined ? (
          <span
            className={cx(
              "af-surface-sm inline-flex min-w-6 shrink-0 items-center justify-center px-1.5 py-0.5 text-[10px]",
              isActive ? "af-accent-chip text-white/80" : "bg-white/5 text-white/60",
            )}
          >
            {item.badge}
          </span>
        ) : null}
      </>
    );

    if (item.href) {
      return (
        <a
          key={item.id}
          href={item.href}
          onClick={(event) => handleNavigation(event, item.href)}
          className={getNavRowClassName(isActive, options)}
          aria-current={isActive ? "page" : undefined}
        >
          {content}
        </a>
      );
    }

    return (
      <div
        key={item.id}
        className={getNavRowClassName(isActive, options)}
        aria-current={isActive ? "page" : undefined}
      >
        {content}
      </div>
    );
  }

  return (
    <Sidebar
      collapsible="none"
      className={cx(
        "af-surface-lg h-[100dvh] min-h-[100dvh] w-[17.5rem] overflow-hidden bg-[#14121a] backdrop-blur-md",
        className,
      )}
    >
      <SidebarHeader className="bg-[#14121a]">
        {/* Brand block (same as ProjectsHub top block) */}
        <header className="af-separator-b shrink-0 p-4">
          <div className="af-surface-md flex items-center gap-3 bg-white/[0.03] px-3 py-3">
            <span className="af-surface-sm inline-flex h-8 w-8 shrink-0 items-center justify-center bg-white/5 text-white/80">
              <Layers2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                ArchFlow Platform
              </p>
              <p className="af-text-tertiary truncate text-[11px]">
                Workspace
              </p>
            </div>
          </div>
        </header>

        {/* Project summary block (same visual style as user summary in ProjectsHub) */}
        <div className="af-separator-b shrink-0 px-4 py-4">
          <div className="af-surface-md bg-white/[0.02] px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex items-center gap-3">
                <UserAvatar
                  user={projectOwner}
                  className="af-surface-sm h-9 w-9 shrink-0 bg-white/5 text-sm font-semibold text-white/80"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">
                    {projectName}
                  </p>
                  <p className="af-text-tertiary truncate text-[11px]">
                    {ownerLabel}
                  </p>
                </div>
              </div>

              {projectBadgeLabel ? (
                <span className="af-surface-sm inline-flex shrink-0 items-center bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white/70">
                  {projectBadgeLabel}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <nav className="px-4 py-3">
          <div className="space-y-3">
            <div>
              <button
                type="button"
                onClick={() => setIsScrumExpanded((current) => !current)}
                aria-expanded={isScrumExpanded}
                className={getNavRowClassName(isScrumActive)}
              >
                <span className="inline-flex min-w-0 items-center gap-2.5">
                  <Blocks
                    className={cx(
                      "af-nav-icon h-4 w-4",
                      isScrumActive ? "text-[var(--accent-soft-35)]" : "text-white/52",
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">Scrum</span>
                </span>
                {isScrumExpanded ? (
                  <ChevronDown
                    className="af-nav-chevron h-4 w-4 shrink-0 text-white/52"
                    aria-hidden="true"
                  />
                ) : (
                  <ChevronRight
                    className="af-nav-chevron h-4 w-4 shrink-0 text-white/52"
                    aria-hidden="true"
                  />
                )}
              </button>

              {isScrumExpanded ? (
                <div
                  className={cx(
                    "mt-2 ml-4 border-l pl-2",
                    isScrumActive ? "border-[color:var(--accent-soft-25)]" : "border-white/[0.06]",
                  )}
                >
                  <div className="space-y-1">
                    {scrumItems.map((item) => renderNavItem(item, { indented: true }))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-1">
              {topLevelItems.map((item) => renderNavItem(item))}
            </div>
          </div>
        </nav>
      </SidebarContent>

      <SidebarFooter className="af-separator-t bg-[#14121a] px-4 py-3">
        {footer ?? (
          <a
            href="/projects"
            onClick={(event) => handleNavigation(event, "/projects")}
            className="af-focus-ring af-nav-item inline-flex w-full items-center justify-between gap-3 px-3 py-2 text-sm text-white/76 transition hover:bg-white/[0.03] hover:text-white"
          >
            <span className="inline-flex min-w-0 items-center gap-2.5">
              <ArrowLeftFromLine
                className="af-nav-icon h-4 w-4 text-white/52"
                aria-hidden="true"
              />
              <span className="truncate">Sair do projeto</span>
            </span>
          </a>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

