import { Check, RefreshCw, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useProjectSprint } from "../../contexts/ProjectSprintContext";

interface SprintSelectorProps {
  projectId: string;
}

export default function SprintSelector({ projectId }: SprintSelectorProps) {
  const { sprints, selectedSprintId, selectedSprint, setSelectedSprintId } =
    useProjectSprint(projectId);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
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

  return (
    <div ref={containerRef} className="relative">
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
                  <span className="truncate font-medium">{sprint.name}</span>
                  {isSelected ? (
                    <Check
                      className="h-4 w-4 shrink-0 text-[var(--accent-soft-35)]"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
