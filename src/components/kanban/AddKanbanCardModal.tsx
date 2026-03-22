"use client";

import { useCallback, useMemo, useState } from "react";

import ModalShell from "@/components/ui/ModalShell";
import SelectDropdown, {
  type SelectOption,
} from "@/components/ui/SelectDropdown";
import { createCard } from "@/features/board/api/board-cards.api";
import { getSprintItemUserStoryLabel } from "@/lib/sprint-item-label";
import type { SprintItem } from "@/types/sprint";

interface AddKanbanCardModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  sprintId: string;
  /** Target board column (API id). */
  columnId: number | null;
  /** Sprint items for this sprint only — defines which user stories can be linked. */
  sprintItems: SprintItem[];
  onCreated: () => Promise<void> | void;
}

export default function AddKanbanCardModal({
  open,
  onClose,
  projectId,
  sprintId,
  columnId,
  sprintItems,
  onCreated,
}: AddKanbanCardModalProps) {
  const [userStoryId, setUserStoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storyOptions: readonly SelectOption[] = useMemo(() => {
    const rows = sprintItems.map((item) => ({
      item,
      base: getSprintItemUserStoryLabel(item),
    }));
    const baseCount = new Map<string, number>();
    for (const { base } of rows) {
      baseCount.set(base, (baseCount.get(base) ?? 0) + 1);
    }
    return rows.map(({ item, base }) => {
      const dup = (baseCount.get(base) ?? 0) > 1;
      const label = dup ? `${base} · sprint item ${item.id}` : base;
      return { value: String(item.userStoryId), label };
    });
  }, [sprintItems]);

  const reset = useCallback(() => {
    setUserStoryId("");
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    if (!submitting) {
      reset();
      onClose();
    }
  }, [submitting, onClose, reset]);

  const handleSubmit = useCallback(async () => {
    if (columnId == null) {
      setError("Coluna inválida.");
      return;
    }
    if (!userStoryId.trim()) {
      setError("Selecione uma user story da sprint.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createCard(projectId, sprintId, columnId, {
        userStoryId: Number(userStoryId),
      });
      reset();
      await onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }, [columnId, onClose, onCreated, projectId, reset, sprintId, userStoryId]);

  const disabledNoStories = storyOptions.length === 0;

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      title="Novo card"
      subtitle="O card representa uma user story desta sprint (item de sprint). Selecione qual vincular."
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={handleClose}
            className="af-focus-ring af-surface-md px-4 py-2 text-xs font-medium text-white/70 transition hover:text-white/90 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={submitting || disabledNoStories || !userStoryId}
            onClick={() => void handleSubmit()}
            className="af-focus-ring af-accent-hover af-surface-md px-4 py-2 text-xs font-medium text-white transition disabled:opacity-50"
          >
            {submitting ? "Criando…" : "Criar card"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
            User story (sprint atual)
          </label>
          {disabledNoStories ? (
            <p className="af-text-secondary text-xs leading-relaxed">
              Não há itens de sprint disponíveis. Adicione user stories a esta
              sprint no sprint backlog para poder criar cards aqui.
            </p>
          ) : (
            <SelectDropdown
              value={userStoryId}
              options={storyOptions}
              onChange={setUserStoryId}
              disabled={submitting}
              placeholder="Selecionar user story…"
              panelLabel="Itens da sprint"
            />
          )}
        </div>

        {error ? (
          <p className="text-[11px] text-red-400">{error}</p>
        ) : null}
      </div>
    </ModalShell>
  );
}
