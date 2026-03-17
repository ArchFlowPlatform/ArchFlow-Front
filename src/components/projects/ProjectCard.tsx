"use client";

import type { KeyboardEvent, MouseEvent } from "react";

import type { ProjectWithDetails } from "@/types/project";
import { useAppNavigate, shouldHandleNavigationClick } from "@/hooks/useAppNavigate";

interface ProjectCardProps {
  project: ProjectWithDetails;
}

function getStatusLabel(status: string): string {
  return status;
}

function getStatusTone(status: string): string {
  if (status === "active") return "text-white/85";
  return "af-text-tertiary";
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { navigate } = useAppNavigate();
  const backlogPath = `/projects/${project.id}/backlog`;

  function shouldIgnoreCardNavigation(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return Boolean(
      target.closest(
        'a, button, input, select, textarea, summary, [role="button"], [data-no-card-navigation]',
      ),
    );
  }

  function handleCardClick(event: MouseEvent<HTMLElement>): void {
    if (
      !shouldHandleNavigationClick(event) ||
      shouldIgnoreCardNavigation(event.target)
    ) {
      return;
    }

    navigate(backlogPath);
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (event.defaultPrevented || shouldIgnoreCardNavigation(event.target)) {
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    navigate(backlogPath);
  }

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Abrir backlog do projeto ${project.name}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className="af-surface-lg af-surface-hover af-accent-hover af-focus-ring flex min-h-[10.75rem] flex-col bg-[#14121a]/70 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex items-start gap-2.5">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium text-white">
              {project.name}
            </h3>
            <p className="af-text-tertiary truncate text-[11px]">
              owner: {project.owner.name}
            </p>
          </div>
        </div>
        <span
          className={`af-surface-md inline-flex items-center px-2 py-1 text-[10px] uppercase tracking-[0.08em] ${
            project.status === "active"
              ? "af-accent-chip"
              : `bg-white/[0.04] ${getStatusTone(project.status)}`
          }`}
        >
          {getStatusLabel(project.status)}
        </span>
      </div>

      <p
        className="af-text-secondary mt-3 text-xs leading-relaxed"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {project.description}
      </p>

      <footer className="mt-auto pt-3">
        <span className="af-surface-sm af-text-secondary inline-flex items-center bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.1em]">
          membros: {project.members.length}
        </span>
      </footer>
    </article>
  );
}
