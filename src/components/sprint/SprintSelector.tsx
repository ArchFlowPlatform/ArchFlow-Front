"use client";

import { Check, RefreshCw, ChevronDown, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  useFloatingPortalPosition,
  type FloatingPortalPositionOptions,
} from "@/components/ui/floating-portal-position";
import { useProjectSprint } from "../../contexts/ProjectSprintContext";
import InlineToast from "@/components/ui/InlineToast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EditSprintModal from "@/components/sprint/EditSprintModal";
import { useToast } from "@/hooks/useToast";
import { archiveSprint } from "@/features/sprints/api/sprints.api";
import type { Sprint } from "@/types/sprint";

interface SprintSelectorProps {
  projectId: string;
}

/** Nested kebab menu above main sprint list (z-100). */
const SPRINT_ACTION_MENU_FLOAT: FloatingPortalPositionOptions = {
  zIndex: 110,
  minWidth: 160,
};

export default function SprintSelector({ projectId }: SprintSelectorProps) {
  const {
    sprints,
    selectedSprintId,
    selectedSprint,
    setSelectedSprintId,
    refetchSprints,
  } = useProjectSprint(projectId);

  const [isOpen, setIsOpen] = useState(false);
  const [actionMenuSprintId, setActionMenuSprintId] = useState<string | null>(
    null,
  );
  const [editOpen, setEditOpen] = useState(false);
  const [editSprint, setEditSprint] = useState<Sprint | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSprint, setDeleteSprint] = useState<Sprint | null>(null);

  const actionAnchorRef = useRef<HTMLButtonElement | null>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const { panelRef, style } = useFloatingPortalPosition(anchorRef, isOpen, "right");
  const {
    panelRef: actionMenuPanelRef,
    style: actionMenuStyle,
  } = useFloatingPortalPosition(
    actionAnchorRef,
    Boolean(actionMenuSprintId),
    "right",
    SPRINT_ACTION_MENU_FLOAT,
  );

  const { toast, showError, showSuccess } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setActionMenuSprintId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!actionMenuSprintId) return;
    if (!sprints.some((s) => s.id === actionMenuSprintId)) {
      setActionMenuSprintId(null);
    }
  }, [actionMenuSprintId, sprints]);

  useEffect(() => {
    if (!isOpen && !actionMenuSprintId) return;

    function handlePointerDown(event: MouseEvent) {
      const t = event.target as Node;
      if (anchorRef.current?.contains(t)) return;

      if (actionMenuSprintId) {
        const inAction =
          actionAnchorRef.current?.contains(t) ||
          actionMenuPanelRef.current?.contains(t);
        if (inAction) return;
        setActionMenuSprintId(null);
        if (panelRef.current?.contains(t)) return;
      }

      if (panelRef.current?.contains(t)) return;
      setIsOpen(false);
      setActionMenuSprintId(null);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (actionMenuSprintId) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        setActionMenuSprintId(null);
        return;
      }
      if (isOpen) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape, true);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape, true);
    };
  }, [isOpen, actionMenuSprintId]);

  const dropdownPanel = isOpen ? (
    <div ref={panelRef} style={style} className="origin-top-right">
      <div className="af-surface-md overflow-hidden bg-[#14121a]/98 p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.38)] backdrop-blur-md">
        <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
          Sprint
        </div>
        <div className="space-y-1" role="listbox" aria-label="Selecionar sprint">
          {sprints.map((sprint) => {
            const isSelected = sprint.id === selectedSprintId;

            return (
              <button
                key={sprint.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setSelectedSprintId(sprint.id);
                  setIsOpen(false);
                }}
                className={`af-focus-ring flex w-full items-center justify-between gap-3 px-2.5 py-2 text-sm transition ${
                  isSelected
                    ? "af-nav-item-active text-white"
                    : "text-white/72 hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  {isSelected ? (
                    <Check
                      className="h-4 w-4 shrink-0 text-[var(--accent-soft-35)]"
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="truncate font-medium">{sprint.name}</span>
                </span>

                <div className="relative shrink-0">
                  <button
                    type="button"
                    ref={(el) => {
                      if (sprint.id === actionMenuSprintId) {
                        actionAnchorRef.current = el;
                      } else if (actionAnchorRef.current === el) {
                        actionAnchorRef.current = null;
                      }
                    }}
                    aria-label="Ações da sprint"
                    aria-expanded={actionMenuSprintId === sprint.id}
                    aria-haspopup="menu"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActionMenuSprintId((current) =>
                        current === sprint.id ? null : sprint.id,
                      );
                    }}
                    className="af-focus-ring inline-flex h-8 w-8 items-center justify-center rounded-md text-white/60 transition hover:bg-white/[0.06] hover:text-white/90"
                  >
                    <MoreVertical className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  ) : null;

  const actionSprint =
    actionMenuSprintId == null
      ? null
      : (sprints.find((s) => s.id === actionMenuSprintId) ?? null);

  const actionMenuPortal =
    actionSprint && actionMenuSprintId ? (
      <div
        ref={actionMenuPanelRef}
        style={actionMenuStyle}
        className="overflow-hidden rounded-md border border-white/10 bg-[#14121a]/98 shadow-[0_18px_40px_rgba(0,0,0,0.38)] backdrop-blur-md"
        role="menu"
        aria-label="Ações da sprint"
      >
        <button
          type="button"
          role="menuitem"
          onClick={(e) => {
            e.stopPropagation();
            setActionMenuSprintId(null);
            setEditSprint(actionSprint);
            setEditOpen(true);
          }}
          className="af-focus-ring block w-full px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/[0.06] hover:text-white/95"
        >
          <span className="inline-flex items-center gap-2">
            <Pencil className="h-4 w-4 text-white/70" aria-hidden="true" />
            Editar
          </span>
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={(e) => {
            e.stopPropagation();
            setActionMenuSprintId(null);
            setDeleteSprint(actionSprint);
            setDeleteOpen(true);
          }}
          className="af-focus-ring block w-full px-3 py-2 text-left text-sm text-red-300 transition hover:bg-red-500/10"
        >
          <span className="inline-flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-red-300" aria-hidden="true" />
            Excluir
          </span>
        </button>
      </div>
    ) : null;

  return (
    <div className="relative">
      <InlineToast toast={toast} />
      <button
        ref={anchorRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={!sprints.length}
        onClick={() => setIsOpen((current) => !current)}
        className="af-surface-md af-surface-hover af-focus-ring inline-flex h-9 items-center gap-2 bg-white/5 px-3 text-left text-sm text-white/80 transition hover:border-[color:var(--accent-soft-15)] hover:bg-white/[0.06]"
      >
        <RefreshCw className="h-4 w-4 shrink-0 text-white/58" aria-hidden="true" />
        <span className="truncate text-sm text-white/58">
          {selectedSprint?.name ?? "Sem sprint"}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/50 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {typeof document !== "undefined" && dropdownPanel
        ? createPortal(dropdownPanel, document.body)
        : null}

      {typeof document !== "undefined" && actionMenuPortal
        ? createPortal(actionMenuPortal, document.body)
        : null}

      {editOpen && editSprint ? (
        <EditSprintModal
          projectId={projectId}
          sprint={editSprint}
          open
          onClose={() => {
            setEditOpen(false);
            setEditSprint(null);
          }}
          onUpdated={async (updated) => {
            await refetchSprints();
            setSelectedSprintId(updated.id);
          }}
        />
      ) : null}

      <ConfirmDialog
        open={deleteOpen}
        variant="danger"
        title="Excluir sprint?"
        description="Isso arquivará a sprint e removerá ela da interface. Você pode restaurar depois."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        loading={false}
        onCancel={() => {
          setDeleteOpen(false);
          setDeleteSprint(null);
        }}
        onConfirm={async () => {
          if (!deleteSprint) return;
          try {
            await archiveSprint(projectId, deleteSprint.id);
            await refetchSprints();
            showSuccess(
              "Sprint arquivada",
              `A sprint "${deleteSprint.name}" foi removida da interface.`,
            );
            setDeleteOpen(false);
            setDeleteSprint(null);
          } catch (e) {
            showError(e instanceof Error ? e.message : String(e));
          }
        }}
      />
    </div>
  );
}
