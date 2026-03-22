"use client";

import { useCallback, useState } from "react";

import ModalShell from "@/components/ui/ModalShell";
import { createColumn } from "@/features/board/api/board-columns.api";

interface AddBoardColumnModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  sprintId: string;
  onCreated: () => Promise<void> | void;
}

export default function AddBoardColumnModal({
  open,
  onClose,
  projectId,
  sprintId,
  onCreated,
}: AddBoardColumnModalProps) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setName("");
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    if (!submitting) {
      reset();
      onClose();
    }
  }, [submitting, onClose, reset]);

  const handleSubmit = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Informe o nome da coluna.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createColumn(projectId, sprintId, { name: trimmed });
      reset();
      await onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }, [name, onClose, onCreated, projectId, reset, sprintId]);

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      title="Nova coluna"
      subtitle="Colunas definem o fluxo do board desta sprint."
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
            disabled={submitting}
            onClick={() => void handleSubmit()}
            className="af-focus-ring af-accent-hover af-surface-md px-4 py-2 text-xs font-medium text-white transition disabled:opacity-50"
          >
            {submitting ? "Salvando…" : "Criar coluna"}
          </button>
        </div>
      }
    >
      <div className="space-y-2">
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
          Nome
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
          placeholder="Ex.: Em progresso"
          className="af-focus-ring w-full rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/30"
        />
        {error ? (
          <p className="text-[11px] text-red-400">{error}</p>
        ) : null}
      </div>
    </ModalShell>
  );
}
