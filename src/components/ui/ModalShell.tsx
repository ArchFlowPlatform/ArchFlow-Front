"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Badge text shown to the right of the title area. */
  badge?: string;
  /** Maximum width class. Defaults to `max-w-2xl`. */
  maxWidth?: string;
  /** When true, renders a two-column layout (main + sidebar). */
  sidebar?: ReactNode;
  children: ReactNode;
  /** Footer slot rendered below the body, outside the scroll area. */
  footer?: ReactNode;
}

/**
 * Shared modal overlay/panel.
 * Mirrors the visual language of KanbanModal:
 * dark glass surface, Escape to close, backdrop click to close.
 */
export default function ModalShell({
  open,
  onClose,
  title,
  subtitle,
  badge,
  maxWidth = "max-w-2xl",
  sidebar,
  children,
  footer,
}: ModalShellProps) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const hasSidebar = Boolean(sidebar);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className={`af-surface-lg flex max-h-[90vh] w-full flex-col overflow-hidden bg-[#14121a]/96 ${maxWidth}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="af-separator-b flex shrink-0 items-start justify-between gap-3 px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              {badge && (
                <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5 text-[10px] text-white/72">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="af-text-secondary mt-1 text-xs">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="af-focus-ring af-accent-hover inline-flex shrink-0 items-center gap-2 px-2 py-2 text-sm text-white/76 transition hover:bg-white/[0.03] hover:text-[var(--accent-soft-35)]"
          >
            <X className="af-accent-icon h-4 w-4" aria-hidden="true" />
            <span>Fechar</span>
          </button>
        </header>

        {/* Body */}
        {hasSidebar ? (
          <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.85fr)]">
            <section className="min-h-0 overflow-y-auto px-5 py-4">
              {children}
            </section>
            <aside className="af-separator-t min-h-0 overflow-y-auto px-5 py-4 lg:border-t-0 lg:border-l lg:border-white/8 lg:shadow-[inset_1px_0_0_rgba(255,255,255,0.03)]">
              {sidebar}
            </aside>
          </div>
        ) : (
          <section className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {children}
          </section>
        )}

        {/* Footer */}
        {footer && (
          <footer className="af-separator-t flex shrink-0 items-center justify-end gap-3 px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
