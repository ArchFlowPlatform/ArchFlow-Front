"use client";

import { LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";

import { cx } from "@/lib/utils/cx";
import type { User } from "@/types/user";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import {
  shouldHandleNavigationClick,
} from "./sidebarNavigation";
import UserAvatar from "../ui/UserAvatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "../ui/sidebar";

export interface AppSidebarItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: number | string;
  href?: string;
  onClick?: () => void;
}

export interface AppSidebarHeader {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

export interface AppSidebarUserSummary {
  user: User;
  badgeLabel?: string;
}

interface AppSidebarProps {
  activeItem?: string;
  items: AppSidebarItem[];
  header?: AppSidebarHeader;
  userSummary?: AppSidebarUserSummary;
  navLabel?: string;
  className?: string;
  footer?: ReactNode;
  onSignOut?: () => void;
  signOutLabel?: string;
}

function SidebarItem({
  item,
  active,
  onNavigate,
}: {
  item: AppSidebarItem;
  active: boolean;
  onNavigate: (href: string) => void;
}) {
  const Icon = item.icon;
  const baseClassName =
    "af-focus-ring af-nav-item flex w-full items-center justify-between gap-3 px-3 py-2 text-sm transition";
  const toneClassName = active
    ? "af-nav-item-active text-white"
    : "text-white/72 hover:bg-white/[0.03] hover:text-white";

  function handleLinkClick(event: MouseEvent<HTMLAnchorElement>): void {
    if (!item.href || !shouldHandleNavigationClick(event)) {
      return;
    }

    event.preventDefault();
    onNavigate(item.href);
  }

  const content = (
    <>
      <span className="inline-flex min-w-0 items-center gap-2.5">
        {Icon ? (
          <Icon
            className={cx(
              "af-nav-icon h-4 w-4",
              active ? "text-[var(--accent-soft-35)]" : "text-white/52",
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
            active ? "af-accent-chip text-white/80" : "bg-white/5 text-white/60",
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
        href={item.href}
        onClick={handleLinkClick}
        className={cx(baseClassName, toneClassName)}
        aria-current={active ? "page" : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={item.onClick}
      className={cx(baseClassName, toneClassName)}
      aria-current={active ? "page" : undefined}
    >
      {content}
    </button>
  );
}

export default function AppSidebar({
  activeItem,
  items,
  header,
  userSummary,
  navLabel = "Navegacao",
  className,
  footer,
  onSignOut,
  signOutLabel = "Sair",
}: AppSidebarProps) {
  const { navigate } = useAppNavigate();

  function handleSignOut(event: MouseEvent<HTMLAnchorElement>): void {
    if (!shouldHandleNavigationClick(event)) {
      return;
    }

    if (onSignOut) {
      event.preventDefault();
      onSignOut();
      return;
    }

    event.preventDefault();
    navigate("/");
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
        {header ? (
          <header className="af-separator-b shrink-0 p-4">
            <div className="af-surface-md flex items-center gap-3 bg-white/[0.03] px-3 py-3">
              {header.icon ? (
                <span className="af-surface-sm inline-flex h-8 w-8 items-center justify-center bg-white/5 text-white/80">
                  {header.icon}
                </span>
              ) : null}

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {header.title}
                </p>
                {header.subtitle ? (
                  <p className="af-text-tertiary truncate text-[11px]">
                    {header.subtitle}
                  </p>
                ) : null}
              </div>
            </div>
          </header>
        ) : null}

        {userSummary ? (
          <div className="af-separator-b shrink-0 px-4 py-4">
            <div className="af-surface-md bg-white/[0.02] px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex items-center gap-3">
                  <UserAvatar
                    user={userSummary.user}
                    className="af-surface-sm h-9 w-9 shrink-0 bg-white/5 text-sm font-semibold text-white/80"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white">
                      {userSummary.user.name}
                    </p>
                    {userSummary.user.type ? (
                      <p className="af-text-tertiary truncate text-[11px]">
                        plano {userSummary.user.type}
                      </p>
                    ) : null}
                  </div>
                </div>

                {userSummary.badgeLabel ? (
                  <span className="af-surface-sm inline-flex shrink-0 items-center bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white/70">
                    {userSummary.badgeLabel}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </SidebarHeader>

      <SidebarContent>
        <div className="af-separator-b px-4 py-3">
          <p className="af-text-tertiary text-[11px] font-semibold uppercase tracking-[0.2em]">
            {navLabel}
          </p>
        </div>

        <nav className="px-4 py-3">
          <div className="space-y-1">
            {items.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                active={item.id === activeItem}
                onNavigate={navigate}
              />
            ))}
          </div>
        </nav>
      </SidebarContent>

      <SidebarFooter className="af-separator-t bg-[#14121a] px-4 py-3">
        {footer ?? (
          <a
            href="/"
            onClick={handleSignOut}
            className="af-focus-ring af-nav-item inline-flex w-full items-center justify-between gap-3 px-3 py-2 text-sm text-white/76 transition hover:bg-white/[0.03] hover:text-white"
          >
            <span className="inline-flex min-w-0 items-center gap-2.5">
              <LogOut className="af-nav-icon h-4 w-4 text-white/52" aria-hidden="true" />
              <span className="truncate">{signOutLabel}</span>
            </span>
          </a>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
