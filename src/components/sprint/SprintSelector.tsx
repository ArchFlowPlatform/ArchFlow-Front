import { Check, RefreshCw, ChevronDown, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  const { toast, showError, showSuccess } = useToast();

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setActionMenuSprintId(null);
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!actionMenuSprintId) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        actionMenuRef.current &&
        event.target instanceof Node &&
        !actionMenuRef.current.contains(event.target)
      ) {
        setActionMenuSprintId(null);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [actionMenuSprintId]);

  return (
    <div ref={containerRef} className="relative">
      <InlineToast toast={toast} />
      <button
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

      <div
        className={`absolute right-0 top-[calc(100%+0.5rem)] z-30 min-w-full origin-top-right transition duration-150 ${
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        }`}
      >
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
                      aria-label="Ações da sprint"
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

                    {actionMenuSprintId === sprint.id ? (
                      <div
                        ref={actionMenuRef}
                        className="absolute right-0 top-[calc(100%+0.25rem)] z-40 w-40 overflow-hidden rounded-md border border-white/10 bg-[#14121a]/98 shadow-[0_18px_40px_rgba(0,0,0,0.38)] backdrop-blur-md"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuSprintId(null);
                            setEditSprint(sprint);
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuSprintId(null);
                            setDeleteSprint(sprint);
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
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

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
